import React from "react"

import styled from "styled-components"
import { format as d3format } from "d3"

import StationVMTGraph from "./components/StationVMTGraph"

const aadtFormat = d3format(",d"),
  vmtFormat = d3format(",.1f");

const selector = ({ year }) => year;

const ShortStation = ({ station, years }) => {
  return (
    <div className="mx-10 my-8 grid grid-cols-2 gap-6">
      <div className="text-5xl font-bold col-span-2">
        Station ID: { station.stationId }
      </div>
      <div className="col-span-1">
        <TabSelector startTab={ years[0] }
          selector={ selector }
          data={ station.data }
          Selected={ Selected }/>
      </div>
      <div className={ `
        col-span-1 flex items-center rounded bg-blueGray-800 h-full
      ` }>
        <StationVMTGraph data={ station.data }/>
      </div>
    </div>
  )
}
export default ShortStation;

const Selected = ({ selected }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      { selected.data.map(s => <Station key={ s.mpo } { ...s }/>) }
    </div>
  )
}
const Station = props => {
  const {
    mpo, region, county,
    aadt = 0, aadt_combo = 0, aadt_single_unit = 0,
    road_name, length, functional_class
  } = props;

  const roads = road_name.split(",");

  return (
    <>
      <div className="col-span-1">
        <Row large row={ ["MPO", mpo] }/>
        <Row row={ ["Region", region] }/>
        <Row row={ ["County", county] }/>
        <Separator />
        <Row row={ ["VMT (total)", vmtFormat(aadt * length)] }/>
        <Row row={ ["VMT (car)", vmtFormat((aadt - (aadt_combo + aadt_single_unit)) * length)] }/>
        <Row row={ ["VMT (truck)", vmtFormat((aadt_combo + aadt_single_unit) * length)] }/>
        <Separator />
        <Row row={ ["AADT (total)", aadtFormat(aadt)] }/>
        <Row row={ ["AADT (car)", aadtFormat(aadt - (aadt_combo + aadt_single_unit))] }/>
        <Row row={ ["AADT (truck)", aadtFormat(aadt_combo + aadt_single_unit)] }/>
        <Separator />
        <Row row={ ["Miles", length] }/>
        <Row row={ ["Functional Class", functional_class] }/>
        <ExpandRow row={ [`Road Name${ roads.length > 1 ? "s" : "" }`, roads[0]] }
          expand={ roads.slice(1) }/>
      </div>
      <div className="col-span-1 bg-blueGray-700 h-full flex flex-col justify-center items-center">
        <span className="fa fa-map text-9xl"/>
      </div>
    </>
  )
}
const Row = ({ row, large = false }) => (
  <div className={ `
    flex hover:bg-blueGray-600 px-2 rounded
    ${ large ? "text-3xl leading-8" : "text-lg leading-7" }
  ` }>
    <div className="font-bold">
      { row[0] }
    </div>
    <div className="flex-1 text-right">
      { row[1] }
    </div>
  </div>
)
const Separator = () => <div className="rounded border"/>

const ExpandRowContainer = styled.div`
  position: relative;
  white-space: nowrap;
  .expand {
    display: none;
    position: absolute;
    top: 100%;
    right: 0px;
  }
  & > * {
    border-bottom-right-radius: 0px;
  }
  &:hover .expand {
    display: block;
    pointer-events: none;
  }
`
const ExpandRow = ({ row, expand }) => {
  return (
    <ExpandRowContainer>
      <Row row={ row }/>

      { !expand.length ? null :
        <div className="expand rounded-bl rounded-br bg-blueGray-600 px-2 text-large leading-7">
          { expand.map((v, i) =>
              <div key={ i }>{ v }</div>
            )
          }
        </div>
      }
    </ExpandRowContainer>
  )
}

const Compare = (a, b) => a === b;

const TabSelector = ({ startTab, selector, data, Selected, fullTabs = false, compare = Compare, Tab = DefaultTab }) => {

  const [current, setCurrent] = React.useState(startTab);

  React.useEffect(() => {
    setCurrent(startTab);
  }, [startTab]);

  const tabs = React.useMemo(() => {
    return data.map(d => {
      const tab = selector(d);
      return {
        tab,
        isCurrent: compare(current, tab),
        onClick: e => setCurrent(tab)
      }
    })
  }, [data, current, setCurrent, compare, selector]);

  const selected = data.find(d => compare(current, selector(d)));

  return (
    <div>
      <TabContainer>
        { tabs.map(({ tab, ...rest }) =>
            <Tab key={ tab } { ...rest } full={ fullTabs }>
              { tab }
            </Tab>
          )
        }
      </TabContainer>
      <div className={ `
        p-4 bg-blueGray-800 rounded-bl rounded-br
        ${ fullTabs ? "" : "rounded-tr" }
      ` }>
        <Selected selected={ selected }/>
      </div>
    </div>
  )
}
const TabContainer = styled.div`
  display: flex;
  > *:last-child {
    margin-right: 0px;
  }
`
const DefaultTab = ({ isCurrent, onClick, children, full = false }) => (
  <div onClick={ onClick }
    className={ `
      rounded-tl rounded-tr pt-1 px-5 bg-blueGray-800 text-lg
      mr-2 border-b-2 ${ full ? "flex-1" : "flex-0" } text-center
      ${ isCurrent ? "border-current" : "border-transparent cursor-pointer" }
    ` }>
    { children }
  </div>
)
