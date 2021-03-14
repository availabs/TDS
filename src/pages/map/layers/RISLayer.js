
import get from "lodash.get"

import  colorbrewer from 'colorbrewer'

import { rollups } from "d3"

import { RISSources, RISLayers } from 'pages/map/map-styles/ris'

import LayerContainer from "avl-map/LayerContainer"


class RisLayer extends LayerContainer {
  name = "RIS"
  sources = RISSources
  layers = RISLayers
  
  /*filters = {
    counties: {
      name: "Counties",
      type: "select",
      domain: [],
      value: [],
      searchable: true,
      accessor: d => d.name,
      valueAccessor: d => d.geoid,
      multi: true
    }
  }*/
  onHover = {
    layers: [...RISLayers.map(d => d.id)],
    callback: (layerId, features, lngLat) => {

      let feature = features[0]
      const data = Object.keys(feature.properties)
        .map(k=> [k, feature.properties[k]])

      console.log('test', features, feature, data)
      return data;
    }
  }

  init(map, falcor) {
    
  }
  render(map) {
    let colors = colorbrewer['Oranges'][8] //.reverse()
    RISLayers.forEach(d => {
      map.setPaintProperty(d.id, 'line-color',  {
        property: 'a',
        stops: [
          [0, 'hsl(185, 0%, 27%)'],
          [1, colors[0]],
          [1500, colors[1]],
          [5000, colors[2]],
          [10000, colors[3]],
          [25000, colors[4]],
          [75000, colors[5]],
          [100000, colors[6]],
          [200000, colors[7]]
        ]
      })
    })    
  } 
}

export const RisLayerFactory = (options = {}) => new RisLayer(options);
