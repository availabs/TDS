import React from "react"

import { useParams } from "react-router-dom"

import get from "lodash.get"

export const REGIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
export const CLASSES = [
    1, 2, 4, 6, 7, 8, 9,
    11, 12, 14, 16, 17, 18, 19
  ];

export const YEARS = [2019, 2018, 2017, 2016];

export const useAsyncSafe = func => {
  const MOUNTED = React.useRef(false);
  React.useEffect(() => {
    MOUNTED.current = true;
    return () => { MOUNTED.current = false; };
  }, []);
  return React.useMemo(() =>
    (...args) => { MOUNTED.current && func(...args); },
    [func]
  );
}

const shortWrapper = Component =>
  ({ falcor, falcorCache, ...props }) => {
    const [region, setRegion] = React.useState(1),
      [year, setYear] = React.useState(YEARS[0]),
      [loading, _setLoading] = React.useState(false),
      setLoading = useAsyncSafe(_setLoading);

    const params = useParams();

    React.useEffect(() => {
      const { region } = params;
      if (region) setRegion(region);
    }, [params]);

    React.useEffect(() => {
      falcor.get(["hds", "regions", "byId", REGIONS, ["region", "name"]]);
    }, [falcor]);

    React.useEffect(() => {
      if (region === null) return;

      setLoading(true);

      falcor.get([
        "ris", "byRegion", region, YEARS, "byClass", CLASSES,
        ['functional_class', 'aadt', 'length', 'vmt']
      ]).then(() => falcor.get(["hds", "short", "stations", region, year, "length"]))
        .then(res => {
          const length = +get(res, ["json", "hds", "short", "stations", region, year, "length"], 0);
          if (length) {
            const indices = [];
            for (let i = 0; i < length; ++i) {
              indices.push(i);
            }
            return falcor.get(
              ["hds", "short", "stations", region, year, "byIndex",
                { from: 0, to: length - 1 }, "array"
              ]
            )
          }
        })
        .then(() => setLoading(false));
    }, [falcor, region, setLoading, year]);

    const stations = React.useMemo(() => {
      const length = +get(falcorCache, ["hds", "short", "stations", region, year, "length"], 0);

      const stations = [];

      for (let i = 0; i < length; ++i) {
        const ref = get(falcorCache, ["hds", "short", "stations", region, year, "byIndex", i, "value"]),
          data = get(falcorCache, ref);
        if (data) {
          stations.push(...get(data, ["array", "value"], []));
        }
      }

      return stations;
    }, [region, falcorCache, year]);

    const [Region, regions] = React.useMemo(() =>
      REGIONS.reduce((a, c) => {
        const data = get(falcorCache, ["hds", "regions", "byId", c], null);
        if (data) {
          if (+data.region === +region) {
            a[0] = data;
          }
          a[1].push(data);
        }
        return a;
      }, [{ region, name: `Region ${ region }` }, []])
    , [region, falcorCache]);

    const allClassData = React.useMemo(() =>
      YEARS.slice().reverse().map(year =>
        CLASSES.reduce((a, c) => {
          const data = get(falcorCache,
                            ["ris", "byRegion", region, year, "byClass", c],
                            {}
                          );
          a[c] = get(data, "vmt", 0);
          return a;
        }, { index: year }),
      ),
    [region, falcorCache])

    const fClassData = React.useMemo(() =>
      CLASSES.reduce((a, c) => {
        let data = get(falcorCache, ["ris", "byRegion", region, year, "byClass", c]);

        if (!data || !data.functional_class) {
          data = { functional_class: c, aadt: 0, vmt: 0, length: 0 };
        }
        a.push(data);

        return a;
      }, []),
    [region, falcorCache, year]);

    return (
      <Component { ...props } loading={ loading } stations={ stations }
        Region={ Region } setRegion={ setRegion }
        year={ year } setYear={ setYear } years={ YEARS }
        regions={ regions } fClassData={ fClassData }
        allClassData={ allClassData }/>
    )
  }

export default shortWrapper;
