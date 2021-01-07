import React from "react"

import get from "lodash.get"

const continuousWrapper = Component =>
  ({ falcor, falcorCache, ...props }) => {
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
      setLoading(true);
      falcor.get(
        ["hds", "continuous", "stations", "length"]
      )
      .then(res => {
        const length = +get(res, ["json", "hds", "continuous", "stations", "length"], 0);
        if (length) {
          return falcor.get(
            ["hds", "continuous", "stations", "byIndex",
              { from: 0, to: length - 1 },
              ["stationId", "data_type", "muni"]
            ]
          )
        }
      }).then(() => setLoading(false));
    }, [falcor]);

    const stations = React.useMemo(() =>
      getStationsFromCache(falcorCache), [falcorCache]
    );
    return (
      <Component { ...props } stations={ stations } loading={ loading }/>
    )
  }

export default continuousWrapper;

const getStationsFromCache = falcorCache => {
  const length = +get(falcorCache, ["hds", "continuous", "stations", "length"], 0);

  const stations = [];

  for (let i = 0; i < length; ++i) {
    const ref = get(falcorCache, ["hds", "continuous", "stations", "byIndex", i, "value"]),
      data = get(falcorCache, ref);
    if (data) {
      stations.push(data);
    }
  }

  return stations;
}
