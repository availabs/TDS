import React from "react"

import { format as d3format, rollups, group } from "d3"

import { Table } from "@availabs/avl-components"

import { LineGraph } from "avl-graph/src"

import CountMeta from "./components/CountMeta"

import { COLORS } from "./wrappers/utils"

const yFormat = d3format(",d"),
  idFormat = (id, { date }) => date;

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

const intervalToTime = (i, mod) => {
  const h = Math.floor(i / mod),
    m = `00${ (i % mod) * 15 }`,
    hour = h === 0 ? 12 : h > 12 ? h - 12 : h,
    ampm = h < 12 ? "am" : "pm";

  return `${ hour }:${ m.slice(-2) } ${ ampm }`
}

const groupReducer = group => group.map(c => ({
  id: c.id,
  date: c.date,
  sortBy: +c.date.replace(/[-]/g, ""),
  data: c.intervals.map((v, i) => ({
    x: intervalToTime(i, +c.collection_interval === 60 ? 1 : 4),
    y: +v
  }))
})).sort((a, b) => a.sortBy - b.sortBy)

const ShortCountVolume = ({ count_id, counts }) => {

  const grouped = React.useMemo(() => {
    return group(counts, d => d.federal_direction);
  }, [counts]);

  const lineData = React.useMemo(() => {
    return rollups(counts, groupReducer, d => d.federal_direction)
  }, [counts]);

  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">
      <div className="text-5xl font-bold">
        Count ID: { count_id }
      </div>

      <div className="border-2 rounded-sm"/>

      { lineData.map(([dir, data]) => (
          <div key={ dir }>
            <CountMeta dir={ dir }
              counts={ grouped.get(dir) }/>
            <div style={ { height: "24rem" } }>
              <LineGraph data={ data }
                colors={ COLORS }
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
          </div>
        ))
      }
      <Table data={ counts }
        columns={ Columns }
        sortBy="total"
        sortOrder="desc"/>
    </div>
  )
}
export default ShortCountVolume;
