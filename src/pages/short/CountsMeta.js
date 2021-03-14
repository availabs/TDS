import React from "react"

import { useHistory } from "react-router-dom"

import { Table } from "@availabs/avl-components"

const COLUMNS = [
  { accessor: "count_id",
    Header: "Count ID"
  },
  { accessor: "rc_station",
    Header: "RC Station ID"
  },
  { accessor: "region_code",
    Header: "Region"
  },
  { accessor: "type",
    Header: "Type"
  },
  { accessor: "upload_id",
    Header: "Upload ID"
  },
  { accessor: "status",
    Header: "Status"
  },
  { accessor: "date",
    Header: "Date"
  },
  { accessor: "functional_class",
    Header: "Functional Class"
  }
]

const CountsMeta = ({ counts }) => {
  const { push } = useHistory();
  const onRowClick = React.useCallback((e, row) => {
    const { type, id } = row.original;
    const [countType, dataType] = type.split(" ");
    push(`/${ countType }/${ dataType }/count/${ id }`);
  }, [push])
  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">
      <Table data={ counts }
        onRowClick={ onRowClick }
        columns={ COLUMNS }/>
    </div>
  )
}
export default CountsMeta
