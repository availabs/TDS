import React from "react"

import { useTheme, hasValue } from "@availabs/avl-components"

import { FED_DIRS } from "../wrappers/utils"

const pushUnique = (array, value) => {
  if (!array.includes(value)) array.push(value);
}

const CountMeta = ({ counts, date, dir }) => {
  const rc_station = [],
    county_code = [],
    region_code = [],
    speed_limit = [],
    vehicle_axle_code = [],
    functional_class = [],
    factor_group = [],
    specific_recorder_placement = [],
    channel_notes = [];
  if (counts) {
      counts.forEach(count => {
        pushUnique(rc_station, count.rc_station);
        pushUnique(county_code, count.county_code);
        pushUnique(region_code, count.region_code);
        pushUnique(speed_limit, count.speed_limit);
        pushUnique(vehicle_axle_code, count.vehicle_axle_code);
        pushUnique(functional_class, count.functional_class);
        pushUnique(factor_group, count.factor_group);
        pushUnique(specific_recorder_placement, count.specific_recorder_placement);
        pushUnique(channel_notes, count.channel_notes);
      })
  }

  return (
    <div>
      <div className="text-2xl font-bold flex items-end">
        <div className="mr-4 text-3xl">
          RC Station ID: { rc_station }
        </div>
        <div>
          Federal Direction: { FED_DIRS[dir] }
        </div>
      </div>

      <div className="border"/>

      <div className="flex flex-wrap mt-2">
        <ValueDisplay label="Region Code"
          value={ region_code }/>
        <ValueDisplay label="County Code"
          value={ county_code }/>
        <ValueDisplay label="Factor Group"
          value={ factor_group }/>
        <ValueDisplay label="Speed Limit"
          value={ speed_limit }/>
        <ValueDisplay label="Vehicle Axle Code"
          value={ vehicle_axle_code }/>
        <ValueDisplay label="Functional Class"
          value={ functional_class }/>
        <ValueDisplay label="Specific Recorder Placement"
          value={ specific_recorder_placement }/>
        <ValueDisplay label="Channel Notes"
          value={ channel_notes }/>
      </div>

      <div className="border"/>
    </div>
  )
}
export default CountMeta

export const ValueDisplay = ({ label, value, className = "", ...props }) => {
  const theme = useTheme();
  return !hasValue(value) ? null : (
    <div className={ `
      ${ className } mr-2 ${ theme.accent2 } px-4 py-1 rounded mb-2
    ` } { ...props }>
      <div className="flex">
        <span className="font-bold mr-2">{ label }:</span>
        { (Array.isArray(value) ? value : [value])
            .map((v, i) => (
              <div key={ i }>{ v }</div>
            ))
        }
      </div>
    </div>
  )
}
