import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"

import { YEARS, REGIONS } from "./short"

const shortStations = Component =>
  ({ falcor, falcorCache }) => {

    const { stationId } = useParams();

    React.useEffect(() => {
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]]);
    }, [falcor]);

    React.useEffect(() => {
      falcor.get([
        "hds", "short", "stations", YEARS, "byId", stationId, "array"
      ])
    }, [falcor, stationId]);

    const Regions = React.useMemo(() => {
      return REGIONS.reduce((a, c) => {
        const data = get(falcorCache, ["hds", "regions", "byId", c], {});
        a[c] = data;
        return a;
      }, {});
    }, [falcorCache]);

    const station = React.useMemo(() => {

      const data = YEARS.slice().reverse().map(year => {
        const data = get(falcorCache,
          ["hds", "short", "stations", year, "byId", stationId, "array", "value"]
        , []);
        data.forEach(d => {
          d.region = get(Regions, [d.region, "name"], d.region);
          d.county = !d.county ? null :
            d.county.toLowerCase().split("")
              .map((dd, i) => i === 0 ? dd.toUpperCase() : dd).join("");
        });
        return { year, data };
      });

      return { stationId, data };
    }, [falcorCache, stationId, Regions]);
    return (
      <Component station={ station } years={ YEARS }/>
    )
  }
export default shortStations;
