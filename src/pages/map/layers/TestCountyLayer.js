
import get from "lodash.get"

import { rollups } from "d3"

import LayerContainer from "avl-map/LayerContainer"

import { TestDynamicLayerFactory } from "./TestDynamicLayer"

class TestCountyLayer extends LayerContainer {
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
    }
  }
  onHover = {
    layers: ["Counties"],
    callback: (layerId, features, lngLat) => {

      const data = rollups(
        features, group => group.map(f => f.properties.geoid), f => f.layer.id
      ).reduce((a, [layerId, geoids]) => {
        a.push([layerId],
          ...geoids.map(geoid => ["GeoID", geoid])
        );
        return a;
      }, []);
      return data;
    }
  }
  sources = [
    { id: "counties",
      source: {
        type: "vector",
        url: "mapbox://am3081.a8ndgl5n"
      }
    }
  ]
  layers = [
    { id: "Counties",
      filter: false,
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
  toolbar = [
    "toggle-visibility",
    { tooltip: "Add Dynamic Layer",
      icon: "fa-thumbs-up",
      action: ["map.addDynamicLayer", "this.createDynamicLayer"]
    },
    { tooltip: "Add Dynamic Layer",
      icon: "fa-thumbs-up",
      action: ["map.addDynamicLayer", TestDynamicLayerFactory]
    },
    { tooltip: "Does Something",
      icon: "fa-cog",
      action: ["this.doSomething"]
    }
  ]

  init(map, falcor) {
    return falcor.get(["geo", "36", "counties",])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"])
        return falcor.get(["geo", counties, "name"])
          .then(res => {
            this.filters.counties.domain = counties.map(geoid => {
              const name = get(res, ["json", "geo", geoid, "name"]);
              return { geoid, name };
            }).sort((a, b) => a.name.localeCompare(b.name));
          });
      });
  }
  fetchData() {
    return new Promise(resolve => setTimeout(resolve, (Math.random(500) + 500)));
  }
  render(map) {
    const counties = get(this, ["filters", "counties", "value"], []);
    if (counties.length) {
      map.setFilter("Counties", ["in", ["get", "geoid"], ["literal", counties]]);
    }
    else {
      map.setFilter("Counties", false);
    }
  }
  createDynamicLayer() {
    return TestDynamicLayerFactory();
  }
  doSomething() {
    window.alert(`${ this.name } did something.`);
  }
}

export const TestCountyLayerFactory = (options = {}) => new TestCountyLayer(options);
