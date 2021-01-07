import React from "react"

import { Table } from "@availabs/avl-components"

import { format as d3format } from "d3-format"

const floatFormat = d3format(",.1f");

const ValueHeader = ({ children }) =>
  <div className="text-right pr-8">
    { children }
  </div>
const ValueCell = ({ value }) =>
  <div className="text-right pr-8">
    { floatFormat(value) }
  </div>

const Columns = [
  { accessor: "functional_class",
    Header: "Functional Class",
    Cell: ({ value }) =>
      <div className="pl-4">
        { value }
      </div>,
    disableFilters: true
  },
  { accessor: "vmt",
    Header: <ValueHeader>VMT</ValueHeader>,
    Cell: ValueCell,
    disableFilters: true
  },
  { accessor: "length",
    Header: <ValueHeader>Miles</ValueHeader>,
    Cell: ValueCell,
    disableFilters: true
  }
]

const ClassTable = ({ fClassData }) =>
  <Table initialPageSize={ 14 }
    columns={ Columns }
    sortBy="functional_class" sortOrder="asc"
    data={ fClassData }/>

export default ClassTable;