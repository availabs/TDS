console.log("WORKER LOADED!!!");

import { SC_CLASS_HEADERS, SC_SPEED_HEADERS, SC_VOLUME_HEADERS } from "/js/headers.js"

const RowLengths = {
  "122": "short volume",
  "41": "short class",
  "43": "short speed"
}
const RowHeaders = {
  "122": SC_VOLUME_HEADERS,
  "41": SC_CLASS_HEADERS,
  "43": SC_SPEED_HEADERS
}

let processedFiles = [];

let fileStack = [];

onmessage = async msg => {

console.log("WORKER RECEIVED:", msg);

  const { type, files, token, file } = msg.data;

  switch (type) {
    case "process-files":
      fileStack.push(...files.map(file => ({ file, type: "process-file" })));
      break;
    case "remove-file": {
      processedFiles = processedFiles.filter(({ name }) => name !== file.name);
      break;
    }
    case "remove-all-files":
      processedFiles = [];
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
        break
      };
      case "remove-file":
      case "remove-all-files":

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
      body: file.data
        .map(row =>
          row.map(r => {
            r = r.replace(/["]/g, "'");
            return /[,]/.test(r) ? `"${ r }"` : r;
          }).join(`,`)
        ).join("\n"),
      headers: {
        "Content-Type": "text/plain",
        "Authorization": token
      }
    })
    .then(res => res.json())
    .then(res => {
      const { result, msg, ...rest } = res;
console.log("UPLOAD RES:", res);
      return {
        msg,
        result: {
          type: result,
          [result]: [file.name],
          ...rest
        }
      };
    });
};

const handleDroppedFile = async droppedFile => {
  if (processedFiles.find(f => f.name === droppedFile.name)) {
    return {
      msg: `File ${ droppedFile.name } has already been successfully processed.`,
      result: { type: "already-dropped" }
    };
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

const checkHeaders = (row, headers) => {
  for (let i = 0; i < headers.length; ++i) {
    if (Array.isArray(headers[i])) {
      const bool = headers[i].reduce((a, c) => a || (c === row[i]), false);
      if (!bool) return false;
    }
    else {
      if (row[i] !== headers[i]) return false;
    }
  }
  return true;
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
      const rawData = loaded.target.result;

      const regex = /^["](.*)["]$/;

      let data = rawData.trim().split(/[\n]+/)
        .map(row =>
          row.trim().split(/[,]/)
            .map(r => regex.test(r) ? regex.exec(r)[1] : r)
            .map(r => r.trim())
        );

      const len = data[0].length;

      const fileOK = data.reduce((a, c, i) => {
        return a && (c.length in RowLengths) && (len === c.length);
      }, true) && checkHeaders(data[0], RowHeaders[len]);

      if (checkHeaders(data[data.length - 1], RowHeaders[len])) {
        data = data.slice(0, data.length - 1);
      }

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
