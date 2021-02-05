import { hasValue } from "@availabs/avl-components"

import DefaultHoverComp from "./components/DefaultHoverComp"

import get from "lodash.get"

let id = -1;
const getLayerId = () => `avl-layer-${ ++id }`;

const DefaultCallback = () => null;

const DefaultOptions = {
  setActive: true,
  isDynamic: false,
  filters: {},
  modals: {},
  mapActions: [],
  sources: [],
  layers: [],
  isVisible: true,
  toolbar: ["toggle-visibility"]
}

class LayerContainer {
  constructor(options = {}) {

    this.id = getLayerId();

    const Options = { ...DefaultOptions, ...options };
    for (const key in Options) {
      this[key] = Options[key];
    }
    this.layerVisibility = {};

    this.needsRender = this.setActive;

    this.callbacks = [];
    this.hoveredFeatures = new Map();

    // this.toggleVisibility = this.toggleVisibility.bind(this);
  }
  _init(map, falcor) {
    this.sources.forEach(({ id, source }) => {
      if (!map.getSource(id)) {
        map.addSource(id, source);
      }
    });
    return this.init(map, falcor);
  }
  init(map, falcor) {
    return Promise.resolve({
      filters: this.filters,
      modals: this.modals,
      mapActions: this.mapActions
    });
  }

  _onAdd(map, falcor, updateHover) {
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
      this.addHover(map, updateHover);
    }
    if (this.onClick) {
      this.addClick(map);
    }
    return this.onAdd(map, falcor);
  }
  onAdd(map, falcor) {
    return Promise.resolve();
  }

  addClick(map) {
    const click = ({ point, features, lngLat }) => {
      const properties = features.map(({ properties }) => ({ ...properties }));
      this.onClick.callback.call(this, properties, lngLat, point);
    };

    this.onClick.layers.forEach(layerId => {
      const callback = click.bind(this);
      this.callbacks.push({
        action: "click",
        callback,
        layerId
      });
      map.on("click", layerId, callback);
    });
  }

  hoverLeave(map, layerId) {
    if (!this.hoveredFeatures.has(layerId)) return;

    this.hoveredFeatures.get(layerId).forEach(value => {
      map.setFeatureState(value, { hover: false });
    });
    this.hoveredFeatures.delete(layerId);
  }

  addHover(map, updateHover) {

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
          layer: this,
          lngLat,
          data
        });
      }
    };

    const mouseleave = (layerId, e) => {
      this.hoverLeave(map, layerId);
      updateHover({
        type: "layer-leave",
        layer: this
      });
    };

    this.onHover.layers.forEach(layerId => {
      let callback = mousemove.bind(this, layerId);
      this.callbacks.push({
        action: "mousemove",
        callback,
        layerId
      });
      map.on("mousemove", layerId, callback);

      callback = mouseleave.bind(this, layerId);
      this.callbacks.push({
        action: "mouseleave",
        callback,
        layerId
      });
      map.on("mouseleave", layerId, callback);
    }, this);
  }

  _onRemove(map) {
    while (this.callbacks.length) {
      const { action, layerId, callback } = this.callbacks.pop();
      map.off(action, layerId, callback);
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
  render(map, falcor) {

  }

  receiveProps(props) {

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

  onMapStyleChange(map, falcor, updateHover) {
    this._onAdd(map, falcor, updateHover)
      .then(() => this.render(map))
  }
}
export default LayerContainer;
