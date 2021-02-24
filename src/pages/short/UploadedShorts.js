import React from "react"

import { Table } from "@availabs/avl-components"

const Columns = [
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

const UploadedShorts = ({ uploads, ...props }) => {
  return (
    <div className="m-10">
      <Table data={ uploads }
        columns={ Columns }/>
    </div>
  )
}
export default UploadedShorts;
