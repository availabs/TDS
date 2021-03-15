import React from "react"

import styled from "styled-components"
import { format as d3format } from "d3"

import { useTheme } from "@availabs/avl-components"

import StationVMTGraph from "./components/StationVMTGraph"
import StationTable from "./components/StationTable"

const aadtFormat = d3format(",d"),
  vmtFormat = d3format(",.1f");

const selector = ({ year }) => year;

const ShortStation = ({ station, years, stations }) => {
  const [year, setYear] = React.useState(years[0]);

  const stationsByYear = React.useMemo(() =>
    stations.filter(s => +s.year === +year)
  , [stations, year]);

  return (
    <div className="m-10 grid grid-cols-2 gap-6">
      <div className="text-5xl font-bold col-span-2">
        RC Station ID: { station.stationId }
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-1">
        <TabSelector currentTab={ year } setTab={ setYear }
          selector={ selector }
          data={ station.data }
          Selected={ Selected }/>
      </div>
      <div className={ `
        col-span-1 rounded bg-blueGray-800 h-full w-full
      ` }>
        <StationVMTGraph data={ station.data }/>
      </div>

      <div className="col-span-2 border-2 rounded-sm"/>

      <div className="col-span-2">
        <StationTable station={ stationsByYear }/>
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

  const classes = functional_class.split(",").sort((a, b) => +a - +b);

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
        <Row row={ ["Miles", vmtFormat(length)] }/>
        <Row row={ [`${ classes.length > 5 ? "Func." : "Functional" } Class${ classes.length > 1 ? "es" : "" }`, classes.join(", ")] }/>
        <ExpandRow row={ [`Road Name${ road_name.length > 1 ? "s" : "" }`, road_name[0]] }
          expand={ road_name.slice(1) }/>
      </div>
      <div className="col-span-1 bg-blueGray-700 h-full flex flex-col justify-center items-center">
        <span className="fa fa-map text-9xl"/>
      </div>
    </>
  )
}
export const Row = ({ row, large = false }) => (
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
export const Separator = () => <div className="rounded border"/>

const ExpandRowContainer = styled.div`
  position: relative;
  white-space: nowrap;
  .expand {
    display: none;
    position: absolute;
    top: 100%;
    left: 0px;
  }
  & > * {
    border-bottom-right-radius: 0px;
  }
  &:hover .expand {
    display: flex;
    pointer-events: none;
  }
`
const ExpandRow = ({ row, expand }) => {
  return (
    <ExpandRowContainer>
      <Row row={ row }/>

      { !expand.length ? null :
        <div style={ {
            maxHeight: "500px"
          } }
          className={ `
            expand rounded-bl rounded-br bg-blueGray-600 px-2 pb-2
            overflow-auto scrollbar-sm flex-row-reverse flex-wrap w-full
          ` }>
          { expand.map((v, i) =>
              <div className="rounded bg-blueGray-500 px-2 ml-1 mb-1 flex-0 text-large leading-7" key={ i }>{ v }</div>
            )
          }
        </div>
      }
    </ExpandRowContainer>
  )
}

const Compare = (a, b) => a === b;

const TabSelector = ({ currentTab, setTab, selector, data, Selected, fullTabs = false, compare = Compare, Tab = DefaultTab }) => {

  const tabs = React.useMemo(() => {
    return data.map(d => {
      const tab = selector(d);
      return {
        tab,
        isCurrent: compare(currentTab, tab),
        onClick: e => setTab(tab)
      }
    })
  }, [data, currentTab, setTab, compare, selector]);

  const theme = useTheme();

  const selected = data.find(d => compare(currentTab, selector(d)));

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
        p-4 ${ theme.menuBg } rounded-bl rounded-br
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
const DefaultTab = ({ isCurrent, onClick, children, full = false }) => {
  const theme = useTheme();
  return (
    <div onClick={ onClick }
      className={ `
        ${ isCurrent ?
          `${ theme.menuTextActive } ${ theme.menuTextActiveHover }` :
          `${ theme.menuBgHover } ${ theme.menuText } ${ theme.menuTextHover }`
        }
        ${ theme.menuBg }
        rounded-tl rounded-tr pt-1 px-5 text-lg
        mr-2 border-b-2 ${ full ? "flex-1" : "flex-0" } text-center
        ${ isCurrent ? "border-current" : "border-transparent cursor-pointer" }
      ` }>
      { children }
    </div>
  )
}
