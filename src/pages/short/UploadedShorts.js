import React from "react"

import { useHistory } from "react-router-dom"

import { Table } from "@availabs/avl-components"

const UploadColumns = [
  { id: "fileName",
    accessor: d => d.meta.fileName,
    Header: "File Name"
  },
  { accessor: "status",
    Header: "Status"
  },
  { id: "dataType",
    accessor: d => d.meta.dataType,
    Header: "Data Type"
  },
  { accessor: "created_at",
    Header: "Uploaded At",
    Cell: ({ value }) => {
      const date = new Date(value);
      return date.toDateString();
    }
  },
  { accessor: "created_by",
    Header: "Uploaded By"
  }
]
const CountColumns = [
  { accessor: "count_id",
    Header: "Count ID"
  },
  { accessor: "count_type",
    Header: "Count Type"
  },
  { accessor: "status",
    Header: "Status"
  },
  { accessor: "upload_id",
    Header: "Upload ID"
  }
]

const UploadedShorts = ({ uploads, counts, setUploadId, ...props }) => {

  const onUploadedRowClick = React.useCallback((e, row) => {
    setUploadId(row.original.upload_id)
  }, [setUploadId])

  const { push } = useHistory();

  const onRowClick = React.useCallback((e, row) => {
    push(`/short/count/${ row.values.count_id }`);
  }, [push]);

  return (
    <div className="m-10">
      <Table data={ uploads }
        onRowClick={ onUploadedRowClick }
        columns={ UploadColumns }/>
      { !counts.length ? null :
        <div className="mt-4">
          <Table data={ counts }
            onRowClick={ onRowClick }
            columns={ CountColumns }/>
        </div>
      }
    </div>
  )
}
export default UploadedShorts;
