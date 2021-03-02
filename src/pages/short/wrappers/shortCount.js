import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"

import { useAsyncSafe } from "avl-components"

import { REGIONS } from "./short"

const basePath = ["tds", "count", "data", "byCountId"]

const shortCount = Component =>
  ({ falcor, falcorCache, ...props }) => {
    const { count_id } = useParams();

    const [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    React.useEffect(() => {
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]]);
    }, [falcor]);

    React.useEffect(() => {
      setLoading(true);
      falcor.get([...basePath, count_id, "length"])
        .then(res => {
          const length = +get(res, ["json", ...basePath, count_id, "length"], 0);
          if (length) {
            return falcor.get(
              [...basePath, count_id, "byIndex", { from: 0, to: length - 1 },
                ["id", "date", "intervals", "count_id", "station_id", "region"]
              ]
            )
          }
        }).then(() => setLoading(false))
    }, [falcor, count_id, setLoading]);

    const counts = React.useMemo(() => {
      const counts = [];
      const length = +get(falcorCache, [...basePath, count_id, "length"], 0);
      if (length) {
        for (let i = 0; i < length; ++i) {
          const ref = get(falcorCache, [...basePath, count_id, "byIndex", i, "value"]),
            data = get(falcorCache, ref, null);
          if (data) {
            counts.push({
              ...data,
              intervals: get(data, ["intervals", "value"], []),
              total: get(data, ["intervals", "value"], []).reduce((a, c) => a + +c, 0),
              region: get(falcorCache, ["hds", "regions", "byId", data.region, "name"], data.region)
            })
          }
        }
      }
      return counts;
    }, [count_id, falcorCache])

    return (
      <Component { ...props } count_id={ count_id } counts={ counts }
        loading={ loading }/>
    )
  }
export default shortCount;
