import React from "react"

import { format as d3format } from "d3"

import { Table } from "@availabs/avl-components"

import { LineGraph } from "avl-graph/src"

import { getColorRange } from "avl-components"

const colors1 = getColorRange(7, "Set3"),
  colors2 = getColorRange(7, "Set1");

const yFormat = d3format(",d"),
  idFormat = (id, { date }) => date;

const Colors = colors1.reduce((a, c, i) => {
  a.push(c, colors2[i]);
  return a;
}, []);

const Columns = [
  { accessor: "station_id",
    Header: "Station ID"
  },
  { accessor: "date",
    Header: "Date",
    Cell: ({ value }) => (
      <span>
        { new Date(value).toDateString() }
      </span>
    )
  },
  { accessor: "region",
    Header: "Region"
  },
  { accessor: "total",
    Header: "Total",
    Cell: ({ value }) => yFormat(value)
  }
]

const intervalToTime = i => {
  const h = Math.floor(i / 4),
    m = `00${ (i % 4) * 15 }`,
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h,
    ampm = h < 12 ? "am" : "pm";

  return `${ hour }:${ m.slice(-2) } ${ ampm }`
}

const ShortCount = ({ count_id, counts }) => {

  const lineData = React.useMemo(() => {
    return counts.map(c => ({
      id: c.id,
      date: c.date,
      data: c.intervals.map((int, i) => ({
        x: intervalToTime(i),
        y: +int
      }))
    }))
  }, [counts]);

  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">
      <div className="text-5xl font-bold">
        Count ID: { count_id }
      </div>

      <div className="border-2 rounded-sm"/>

      <div style={ { height: "32rem" } }>
        <LineGraph data={ lineData }
          colors={ Colors }
          hoverComp={ {
            yFormat,
            idFormat
          } }
          margin={ { left: 100, bottom: 50 } }
          axisBottom={ {
            label: "Intervals",
            tickDensity: 1.5
          } }
          axisLeft={ {
            label: "Counts"
          } }/>
      </div>
      <Table data={ counts }
        columns={ Columns }
        sortBy="total"
        sortOrder="desc"/>
    </div>
  )
}
export default ShortCount;
