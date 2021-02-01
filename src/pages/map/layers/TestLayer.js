
import get from "lodash.get"

import MapLayer, { getFilter } from "avl-map/MapLayer"

class TestLayer1 extends MapLayer {
  name = "Counties"

  filters = [
    { name: "Counties",
      type: "select",
      domain: [],
      value: ["36001", "36093", "36083"],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    },
    // { name: "Test 1",
    //   type: "select",
    //   multi: false,
    //   searchable: false,
    //   options: [1, 2, 3, 4, 5],
    //   accessor: v => `Value ${ v }`
    // }
  ]
  onHover = {
    layers: ["counties"],
    callback: (features, lngLat, layer) => {
      return [
        [this.name],
        ...features.map(f => ["GEOID", f.properties.geoid]),
        ["Fake 1", "data..."],
        ["Fake 2", "data..."],
        ["Fake 3", "data..."]
      ];
    }
  }
  // onClick = {
  //   layers: ["counties"],
  //   callback: (properties, lngLat, point) => {
  //     const geoids = properties.map(({ geoid }) => geoid);
  //     // this.history.push({
  //     //   pathname: `/map/${ geoids.join("_") }`,
  //     //   // search: "?key=value",
  //     //   // state: { key: "value" }
  //     // });
  //     // window.open(`/map/${ geoids.join("_") }`, "_blank");
  //   }
  // }
  sources = [
    { id: "counties",
      source: {
        type: "vector",
        url: "mapbox://am3081.a8ndgl5n"
      }
    },
  ]
  layers = [
    { id: "counties",
      filter : ["in", "geoid", "none"],
      "source-layer": "counties",
      source: "counties",
      type: "fill",
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#090",
          "#900"
        ],
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5, 1.0,
          20, 0.1
        ]
      }
    }
  ]
  init(falcor) {
    return falcor.get(["geo", "36", "counties"])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"]);
        return falcor.get(["geo", counties, "name"])
          .then(res => {
            this.filters[0].domain = counties.map(geoid => {
              const name = get(res, ["json", "geo", geoid, "name"]);
              return { geoid, name };
            }).sort((a, b) => a.name.localeCompare(b.name));
          });
      });
  }
  render(map, filters) {
    const filter = getFilter(filters, "Counties"),
      geoids = get(filter, "value", []);

    map.setFilter("counties", ["in", "geoid", "none", ...geoids]);
  }
  receiveProps(props) {
    this.history = props.history;
  }
}

export const layerFactory1 = (options = {}) => new TestLayer1({
  ...options,
})
