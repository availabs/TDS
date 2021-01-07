import React from "react"

import { Select } from "@availabs/avl-components"

import ClassTable from "./ClassTable"
import StationsTable from "./StationsTable"

import { format as d3format } from "d3-format"

const floatFormat = d3format(",.1f");

const Short = ({ loading, stations, Region, setRegion, regions, fClassData }) => {
  const updateRegion = React.useCallback(v =>
    setRegion(v ? v.region : null)
  , [setRegion]);

  const [totalVMT, totalLength] = fClassData.reduce((a, c) => {
    a[0] += c.vmt;
    a[1] += c.length;
    return a;
  }, [0, 0]);

  return (
    <div className="mx-10 my-8 grid grid-cols-2 gap-y-6">
      <div className="text-5xl font-bold col-span-1">
        { loading ? "Loading " : null }{ Region.name }
      </div>
      <div className="col-span-1 flex items-center justify-end">
        <span className="mr-2">Region:</span>
        <div className="w-full max-w-lg">
          <Select options={ regions.sort((a, b) => +a.region - +b.region) }
            accessor={ v => `(${ v.region }) ${ v.name }` }
            onChange={ updateRegion } value={ Region }
            multi={ false } searchable={ false } removable={ false }/>
        </div>
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-1 pr-4">

        <div className="grid grid-cols-12 gap-1 mb-4 text-2xl">
          <div className="col-span-3 font-bold">
            Total VMT
          </div>
          <div className="col-span-4 text-right">
            { floatFormat(totalVMT) }
          </div>
          <div className="col-span-5 text-base leading-9">
            miles traveled
          </div>

          <div className="col-span-3 font-bold">
            Total Length
          </div>
          <div className="col-span-4 text-right">
            { floatFormat(totalLength) }
          </div>
          <div className="col-span-5 text-base leading-9">
            miles
          </div>
        </div>

        <ClassTable fClassData={ fClassData }/>

      </div>

      <div className="col-span-1 pl-4 flex items-center">
        <div className="flex justify-center items-center bg-blueGray-500 w-full"
          style={ { height: "300px" } }>
          LINE GRAPH HERE
        </div>
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-2">
        <StationsTable stations={ stations }/>
      </div>
    </div>
  )
}
export default Short;
