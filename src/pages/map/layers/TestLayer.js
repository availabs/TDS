
import get from "lodash.get"

import { rollups } from "d3"

import MapLayer, { getFilter } from "avl-map/MapLayer"

class TestLayer1 extends MapLayer {
  name = "Counties"

  filters = {
    counties: {
      name: "Counties",
      type: "select",
      domain: [],
      value: ["36001", "36093", "36083"],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    },
    cousubs: {
      name: "Cousubs",
      type: "select",
      domain: [],
      value: [],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    },
    // Test{
    //   name: "Test",
    //   type: "select",
    //   multi: false,
    //   searchable: false,
    //   options: [1, 2, 3, 4, 5],
    //   accessor: v => `Value ${ v }`
    // }
  }
  onHover = {
    layers: ["Counties", "Cousubs"],
    callback: (features, lngLat, layer) => {

      const data = rollups(
        features, group => group.map(f => f.properties.geoid), f => f.layer.id
      ).reduce((a, [layer, geoids]) => {
        a.push([layer],
          ...geoids.map(geoid => ["GeoID", geoid])
        );
        return a;
      }, []);
      return data;
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
    { id: "cousubs",
      source: {
        'type': "vector",
        'url': 'mapbox://am3081.36lr7sic'
      },
    }
  ]
  layers = [
    { id: "Counties",
      filter: ["boolean", false],
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
    },
    { id: "Cousubs",
      filter: ["boolean", false],
      "source-layer": "cousubs",
      source: "cousubs",
      type: "fill",
      paint: {
        "fill-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#090",
          "#009"
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
    return falcor.get(["geo", "36", ["counties", "cousubs"]])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"]),
          cousubs = get(res, ["json", "geo", "36", "cousubs"]);
        return falcor.get(["geo", counties, "name"])
          .then(res => {
            this.filters.counties.domain = counties.map(geoid => {
              const name = get(res, ["json", "geo", geoid, "name"]);
              return { geoid, name };
            }).sort((a, b) => a.name.localeCompare(b.name));
          })
          .then(() => {
            return falcor.get(["geo", cousubs, "name"])
              .then(res => {
                this.filters.cousubs.domain = cousubs.map(geoid => {
                  const name = get(res, ["json", "geo", geoid, "name"]);
                  return { geoid, name };
                }).sort((a, b) => a.name.localeCompare(b.name));
              })
          });
      });
  }
  render(map) {
    const counties = get(this, ["filters", "counties", "value"], []);
    if (counties.length) {
      map.setFilter("Counties", ["match", ["get", "geoid"], counties, true, false]);
    }
    else {
      map.setFilter("Counties", ["boolean", false]);
    }

    const cousubs = get(this, ["filters", "cousubs", "value"], []);
    if (cousubs.length) {
      map.setFilter("Cousubs", ["match", ["get", "geoid"], cousubs, true, false]);
    }
    else {
      map.setFilter("Cousubs", ["boolean", false]);
    }
  }
  // receiveProps(props) {
  //   this.history = props.history;
  // }
}

export const layerFactory1 = (options = {}) => new TestLayer1({
  ...options,
})
