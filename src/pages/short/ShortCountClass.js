import React from "react"

import { format as d3format, rollups, group } from "d3"
import get from "lodash.get"

import { Table, Select } from "@availabs/avl-components"

import { BarGraph } from "avl-graph/src"

import CountMeta from "./components/CountMeta"

import { COLORS, VEHICLE_CLASSES, dataIntervalToTime } from "./wrappers/utils"

const COLUMNS = [
  { accessor: "rc_station",
    Header: "RC Station ID"
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
    Cell: ({ value }) => valueFormat(value)
  }
]

const reduceGroups = group => {
  return group.reduce((a, c) => {
    c.classes.forEach((v, i) => {
      const b = `class_f${ i + 1 }`;
      a[b] += +v;
    })
    return a;
  }, VEHICLE_CLASSES.reduce((a, c) => ({ ...a, [c]: 0 }), {}))
}

const valueFormat = d3format(",d");

const ShortCountSpeed = ({ count_id, counts }) => {

  const [dateIndex, setDateIndex] = React.useState(0);

  const grouped = React.useMemo(() => {
    return group(counts, d => d.federal_direction, d => d.date);
  }, [counts]);

  const rolledup = React.useMemo(() => {
    return rollups(counts, reduceGroups,
      d => d.federal_direction, d => d.date, d => d.data_interval
    )
  }, [counts]);

  const dates = get(rolledup, [0, 1], [])
    .map(([date], i) => ({
      index: i, date
    })).sort((a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf());

  const date = get(dates, [dateIndex, "date"]);

  const barData = React.useMemo(() => {
    return rolledup.map(([dir, byDate]) => ({
      dir,
      data: byDate.sort((a, b) => new Date(a[0]).valueOf() - new Date(b[0]).valueOf())
        [dateIndex][1]
          .map(([di, classes]) => ({
            data_interval: di,
            ...classes
          })).sort((a, b) => +a.data_interval - +b.data_interval)
    }));
  }, [rolledup, dateIndex]);

  return (
    <div className="m-10 grid grid-cols-1 gap-y-6">
      <div className="text-5xl font-bold">
        Count ID: { count_id }
      </div>

      <div className="border-2 rounded-sm"/>

      <div className="flex items-center max-w-md">
        <span className="mr-2 font-bold">Select a  date:</span>
        <div className="flex-1">
          <Select options={ dates }
            multi={ false }
            searchable={ false }
            removable={ false }
            value={ dateIndex }
            onChange={ setDateIndex }
            accessor={ d => d.date }
            valueAccessor={ d => d.index }/>
        </div>
      </div>

      { barData.map(({ dir, data }) => (
          <div key={ dir }>
            <CountMeta dir={ dir }
              counts={ grouped.get(dir).get(date) }/>
            <div style={ { height: "24rem" } }>
              <BarGraph colors={ COLORS }
                data={ data } keys={ VEHICLE_CLASSES }
                indexBy="data_interval"
                margin={ { left: 100, bottom: 50 } }
                padding={ 0 }
                hoverComp={ {
                  indexFormat: dataIntervalToTime,
                  // keyFormat,
                  valueFormat
                } }
                axisBottom={ {
                  tickDensity: 1.5,
                  format: dataIntervalToTime
                } }
                axisLeft={ {
                  label: "Vehicles"
                } }/>
            </div>
          </div>
        ))
      }
      <Table data={ counts }
        columns={ COLUMNS }
        sortBy="total"
        sortOrder="desc"/>

    </div>
  )
}
export default ShortCountSpeed;
