import throttle from "lodash.throttle"

import { hasValue } from "@availabs/avl-components"

import DefaultHoverComp from "./components/DefaultHoverComp"

import get from "lodash.get"

let num = -1;
const getLayerId = () => `avl-layer-${ ++num }`;

const DefaultCallback = () => null;

export const getFilter = (filters, filterName) => {
  return filters.reduce((a, c) => {
    return c.name === filterName ? c : a;
  }, null);
};

const DefaultOptions = {
  setActive: true,
  filters: {},
  modals: {},
  mapActions: [],
  sources: [],
  layers: []
}

class MapLayer {
  constructor(options = {}) {

    this.id = getLayerId();

    const Options = { ...DefaultOptions, ...options };

    for (const key in Options) {
      this[key] = Options[key];
    }

    this.callbacks = [];
    this.hoveredFeatures = [];
  }
  _init(map, falcor, falcorCache) {
    return this.init(falcor, falcorCache);
  }
  init(falcor, falcorCache) {
    return Promise.resolve({
      filters: this.filters,
      modals: this.modals,
      mapActions: this.mapActions
    });
  }

  _onAdd(map, falcor, falcorCache, updateHover, pinHoverComp) {
    this.sources.forEach(({ id, source }) => {
      if (!map.getSource(id)) {
        map.addSource(id, source);
      }
    });
    this.layers.forEach(layer => {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    });
    if (this.onHover) {
      this.addHover(map, updateHover, pinHoverComp);
    }
    if (this.onClick) {
      this.addClick(map);
    }
    return this.onAdd(map, falcor, falcorCache);
  }
  onAdd(map, falcor, falcorCache) {
    return Promise.resolve();
  }

  addClick(map) {
    const click = ({ point, features, lngLat }) => {
      const properties = features.map(({ properties }) => ({ ...properties }));
      this.onClick.callback.call(this, properties, lngLat, point);
    };
    this.callbacks.push({
      action: "click",
      callback: click,
      layers: [...this.onClick.layers]
    });

    this.onClick.layers.forEach(layer => {
      map.on("click", layer, click);
    });
  }

  hoverLeave(map) {
    while (this.hoveredFeatures.length) {
      map.setFeatureState(this.hoveredFeatures.pop(), { hover: false });
    }
  }

  addHover(map, updateHover, pinHoverComp) {

    const callback = get(this, ["onHover", "callback"], DefaultCallback).bind(this),
      HoverComp = get(this, ["onHover", "HoverComp"], DefaultHoverComp);

    const mousemove = ({ point, features, lngLat }) => {

      this.hoverLeave(map);

      features.forEach(({ id, source, sourceLayer }) => {
        map.setFeatureState({ id, source, sourceLayer }, { hover: true });
        this.hoveredFeatures.push({ id, source, sourceLayer });
      });

      const data = callback(features, lngLat);

      if (hasValue(data)) {
        updateHover({
          HoverComp,
          data: data || [],
          show: true,
          pos: [point.x, point.y],
          lngLat
        });
      }
    };
    this.callbacks.push({
      action: "mousemove",
      callback: mousemove,
      layers: [...this.onHover.layers]
    });

    const mouseleave = () => {
      updateHover({ show: false });
      this.hoverLeave(map);
    }
    this.callbacks.push({
      action: "mouseleave",
      callback: mouseleave,
      layers: [...this.onHover.layers]
    });

    const click = pinHoverComp.bind(this);
    this.callbacks.push({
      action: "click",
      callback: click,
      layers: [...this.onHover.layers]
    });

    this.onHover.layers.forEach(layer => {

      map.on("mousemove", layer, mousemove);
      map.on("mouseleave", layer, mouseleave);
      map.on("click", layer, click);
    });
  }

  _onRemove(map) {
    while (this.callbacks.length) {
      const { action, layers, callback } = this.callbacks.pop();
      layers.forEach(id => {
        map.off(action, id, callback);
      });
    }
    this.layers.forEach(({ id }) => {
      map.removeLayer(id);
    });
    this.onRemove(map);
  }
  onRemove(map) {

  }

  fetchData() {
    return Promise.resolve();
  }
  render(map, falcorCache) {

  }

  receiveProps(props, map, falcor, falcorCache) {

  }
}
export default MapLayer;
