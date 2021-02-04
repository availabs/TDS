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
  layers: [],
  isVisible: true
}

class LayerContainer {
  constructor(options = {}) {

    this.id = getLayerId();

    const Options = { ...DefaultOptions, ...options };
    for (const key in Options) {
      this[key] = Options[key];
    }
    this.layerVisibility = {};

    this.callbacks = [];
    this.hoveredFeatures = new Map();

    // this.toggleVisibility = this.toggleVisibility.bind(this);
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
        if (!this.isVisible) {
          this._setVisibilityNone(map, layer.id);
        }
        else {
          this.layerVisibility[layer.id] = map.getLayoutProperty(layer.id, "visibility");
        }
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

  hoverLeave(map, layerId) {
    this.hoveredFeatures.get(layerId).forEach(value => {
      map.setFeatureState(value, { hover: false });
    });
    this.hoveredFeatures.delete(layerId);
  }

  addHover(map, updateHover, pinHoverComp) {

    const callback = get(this, ["onHover", "callback"], DefaultCallback).bind(this),
      HoverComp = get(this, ["onHover", "HoverComp"], DefaultHoverComp);

    const mousemove = (layerId, { point, features, lngLat }) => {

      const hoveredFeatures = this.hoveredFeatures.get(layerId) || new Map();
      this.hoveredFeatures.set(layerId, new Map());

      features.forEach(({ id, source, sourceLayer }) => {
        if (hoveredFeatures.has(id)) {
          this.hoveredFeatures.get(layerId).set(id, hoveredFeatures.get(id));
          hoveredFeatures.delete(id);
        }
        else {
          const value = { id, source, sourceLayer };
          this.hoveredFeatures.get(layerId).set(id, value);
          map.setFeatureState(value, { hover: true });
        }
      });
      hoveredFeatures.forEach(value => {
        map.setFeatureState(value, { hover: false });
      })

      const data = callback(layerId, features, lngLat);

      if (hasValue(data)) {
        updateHover({
          pos: [point.x, point.y],
          type: "layer-move",
          HoverComp,
          layerId,
          lngLat,
          data
        });
      }
    };

    const mouseleave = (layerId, e) => {
      this.hoverLeave(map, layerId);
      updateHover({
        type: "layer-leave",
        layerId
      });
    };

    const click = pinHoverComp.bind(this);

    this.onHover.layers.forEach(layer => {
      let callback = mousemove.bind(this, layer);
      this.callbacks.push({
        action: "mousemove",
        callback,
        layer
      });
      map.on("mousemove", layer, callback);

      callback = mouseleave.bind(this, layer);
      this.callbacks.push({
        action: "mouseleave",
        callback,
        layer
      });
      map.on("mouseleave", layer, callback);

      callback = click.bind(this, layer);
      this.callbacks.push({
        action: "click",
        callback,
        layer
      });
      map.on("click", layer, callback);
    }, this);
  }

  _onRemove(map) {
    while (this.callbacks.length) {
      const { action, layer, callback } = this.callbacks.pop();
      map.off(action, layer, callback);
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

  toggleVisibility(map) {
    this.isVisible = !this.isVisible;
    this.layers.forEach(({ id }) => {
      if (this.isVisible) {
        this._setVisibilityVisible(map, id);
      }
      else {
        this._setVisibilityNone(map, id);
      }
    });
  }
  _setVisibilityVisible(map, layerId) {
    if (this.layerVisibility[layerId] !== "none") {
      map.setLayoutProperty(layerId, "visibility", "visible");
    }
  }
  _setVisibilityNone(map, layerId) {
    const visibility = map.getLayoutProperty(layerId, "visibility");
    if (visibility === "none") {
      this.layerVisibility[layerId] = "none";
    }
    else {
      map.setLayoutProperty(layerId, "visibility", "none");
    }
  }
  setLayerVisibility(map, layer, visibility) {
    const isVisible = this.isVisible && (visibility === "visible");
    this.layerVisibility[layer.id] = visibility;

    visibility = isVisible ? "visible" : "none";
    map.setLayoutProperty(layer.id, "visibility", visibility);
  }

  onFilterChange(filterName, newValue, prevValue) {

  }

  onMapStyleChange(map, falcor, falcorCache, updateHover, pinHoverComp) {
    this._onAdd(map, falcor, falcorCache, updateHover, pinHoverComp)
      .then(() => this.render(map, falcorCache))
  }
}
export default LayerContainer;
