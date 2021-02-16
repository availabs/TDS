console.log("WORKER LOADED!!!");

const RowLengths = {
  "122": "Short Volume",
  "41": "Short Class"
}

const processedFiles = [],
  erroredFileNames = [];

let fileStack = [];

onmessage = async msg => {

console.log("WORKER RECEIVED:", msg);

  const { type, files, token } = msg.data;

  switch (type) {
    case "process-files":
      fileStack.push(...files.map(file => ({ file, type: "process-file" })));
      break;
    case "remove-file": {
      fileStack = fileStack.filter(({ name }) => name !== file.name);
      break;
    }
    case "remove-all-files":
      fileStack = [];
      break;
    case "upload-files":
      fileStack.push(...files.map(file => ({ file, token, type: "upload-file" })));
      break;
  }

  while (fileStack.length) {

    let result = { msg: "unkown worker request" };

    const { type, file, token } = fileStack.pop();

    switch (type) {
      case "process-file":
        result = await handleDroppedFile(file);
        break;
      case "upload-file": {
        const index = processedFiles.findIndex(f => f.name === file.name);
        if (index !== -1) {
          result = await uploadFile(processedFiles.splice(index, 1).pop(), token);
        }
        break;
      }
    }
    postMessage(result);
  }
}

const uploadFile = (file, token) => {
  // const data = new FormData();
  // data.append("tds-upload", file);
  const [countType, dataType] = file.dataType.split(" ")
  return fetch(`http://localhost:4444/tds/upload/${ countType }/${ dataType }/${ file.name }`, {
      method: "POST",
      // body: JSON.stringify([{
      //   name: file.name,
      //   dataType: file.dataType,
      //   data: file.data,
      //   rawData: file.rawData,
      //   countId: file.countId,
      //   stationId: file.stationId
      // }]),
      // body: data,
      body: file.rawData,
      headers: {
        "Content-Type": "text/plain",
        "Authorization": token
      }
    })
    .then(res => res.json())
    .then(res => {
console.log("UPLOAD RES:", res);
      return {
        msg: `File ${ file.name } has been successfully uploaded.`,
        result: {
          type: "upload-success",
          ["upload-success"]: [file.name]
        }
      };
    });
};

const handleDroppedFile = async droppedFile => {
  if (processedFiles.find(f => f.name === droppedFile.name)) {
    return { msg: `File ${ droppedFile.name } has already been successfully processed.`};
  }
  if (erroredFileNames.find(fn => fn === droppedFile.name)) {
    return { msg: `File ${ droppedFile.name } has already been unsuccessfully processed.`};
  }
  if (/^(?:application|image|audio|video|model)/.test(droppedFile.type)) {
    return {
      msg: `File ${ droppedFile.name } has incorrect MIME type: ${ droppedFile.type }.`,
      result: {
        type: "error",
        error: {
          name: droppedFile.name,
          size: droppedFile.size,
          mimeType: droppedFile.type,
          error: "incorrect MIME type",
          action: "remove"
        }
      }
    }
  }
  const result = await PromiseReader(droppedFile);
  return result;
}

const PromiseReader = file => {
  return new Promise(resolve => {
    const fr = new FileReader();

    fr.onerror = e => {
      resolve({
        msg: `File ${ file.name } failed to load.`,
        result: {
          type: "error",
          error: {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            error: "failed to load",
            action: "remove"
          }
        }
      });
    };
    fr.onload = loaded => {
      const rawData = loaded.target.result,
        data = rawData.trim().split(/[\n]+/)
          .map(row => row.trim().split(/[,]/).map(r => r.trim()));

console.log("DATA:", data);

      let len = data[0].length;

      const fileOK = data.reduce((a, c, i) => {
        if (i === 0) return a;
        return a && (c.length in RowLengths) && (len === c.length);
      }, true);

      if (!fileOK) {
        resolve({
          msg: `File ${ file.name } has incorrect data format.`,
          result: {
            type: "error",
            error: {
              name: file.name,
              size: file.size,
              mimeType: file.type,
              error: "incorrect data format",
              action: "remove"
            }
          }
        })
      }
      else {
        processedFiles.push({
          name: file.name, size: file.size,
          mimeType: file.type,
          dataType: RowLengths[len],
          status: "awaiting-upload",
          upload: "upload", remove: "remove",
          rawData, data, file
        })
        resolve({
          msg: `File ${ file.name } was successfully scanned and is awaiting upload.`,
          result: {
            type: "file",
            file: {
              name: file.name,
              size: file.size,
              mimeType: file.type,
              dataType: RowLengths[len],
              status: "awaiting-upload",
              file,
              upload: "upload",
              remove: "remove",
            }
          }
        });
      }
    };
    fr.readAsText(file);
  });
}
