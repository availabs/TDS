import React from "react"

import mapboxgl from "mapbox-gl"

import get from "lodash.get"

import { useFalcor } from "@availabs/avl-components"

import Sidebar from "./components/Sidebar"
import LoadingLayer from "./components/LoadingLayer"
import {
  HoverCompContainer,
  PinnedHoverComp
} from "./components/HoverCompContainer"

const DefaultMapOptions = {
  center: [-74.180647, 42.58],
  minZoom: 2,
  zoom: 10,
  preserveDrawingBuffer: false,
  style: "mapbox://styles/am3081/cjqqukuqs29222sqwaabcjy29",
  attributionControl: false,
  logoPosition: "bottom-right"
}

let idCounter = 0;
const getUniqueId = () => `unique-id-${ ++idCounter }`;

const DefaultState = {
  map: null,
  activeLayers: [],
  dynamicLayers: [],
  layersLoading: {},
  hoverData: {
    data: new Map(),
    pos: [0, 0],
    lngLat: {}
  },
  pinnedHoverComps: []
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "init-layer":
      return {
        ...state,
        activeLayers: [
          ...state.activeLayers,
          payload.layerId
        ]
      };
    case "loading-start":
      return {
        ...state,
        layersLoading: {
          ...state.layersLoading,
          [payload.layerId]: get(state, ["layersLoading", payload.layerId], 0) + 1
        }
      };
    case "loading-stop":
      return {
        ...state,
        layersLoading: {
          ...state.layersLoading,
          [payload.layerId]: Math.max(0, state.layersLoading[payload.layerId] - 1)
        }
      };
    case "activate-layer":
      return {
        ...state,
        activeLayers: [
          ...state.activeLayers,
          payload.layerId
        ]
      };
    case "deactivate-layer":
      return {
        ...state,
        activeLayers: state.activeLayers.filter(id => id !== payload.layerId)
      };
    case "update-hover":
      return {
        ...state,
        hoverData: {
          ...state.hoverData,
          ...payload.hoverData
        }
      };
    case "layer-move": {
      const { data, layer, HoverComp, ...rest } = payload;
      state.hoverData.data.set(layer.id, { data, HoverComp, layer });
      return {
        ...state,
        hoverData: {
          ...state.hoverData,
          ...rest
        }
      }
    }
    case "layer-leave": {
      const { layer } = payload;
      state.hoverData.data.delete(layer.id);
      return {
        ...state,
        hoverData: {
          ...state.hoverData
        }
      }
    }
    case "pin-hover-comp":
      if (!state.hoverData.data.size) return state;
      return {
        ...state,
        pinnedHoverComps: [
          ...state.pinnedHoverComps,
          { id: getUniqueId(),
            HoverComps: [...state.hoverData.data.values()],
            ...payload
          }
        ]
      };
    case "remove-pinned":
      return {
        ...state,
        pinnedHoverComps: state.pinnedHoverComps
          .filter(({ id }) => id !== payload.id)
      };
    case "add-dynamic-layer":
      return {
        ...state,
        dynamicLayers: [
          ...state.dynamicLayers,
          payload.layer
        ]
      }
    case "remove-dynamic-layer":
      return {
        ...state,
        dynamicLayers: state.dynamicLayers.filter(({ id }) => id !== payload.layer.id)
      }
    case "map-loaded":
    case "update-state":
      return {
        ...state,
        ...payload
      };
    default:
      return state;
  }
}

const EmptyArray = [];
const EmptyObject = {};

const toolbarFuncRunner = args => {
  if (!args.length) return [];
  const [arg, ...rest] = args;
  if (typeof arg === "function") {
    return [arg(...toolbarFuncRunner(rest))];
  }
  return [arg, ...toolbarFuncRunner(rest)];
}
const toolbarFuncArgs = ({ action }, layer, MapActions) => (
  action.map(action => {
    if (typeof action === "function") return action;
    if (typeof action === "string") {
      const [arg1, arg2] = action.split(".");
      if (arg1 === "map") {
        return MapActions[arg2];
      }
      else if (arg1 === "this") {
        return layer[arg2].bind(layer);
      }
    }
    return action;
  })
)
const AvlMap = props => {

  const id = React.useMemo(() => {
    return props.id || getUniqueId();
  }, [props.id]);

  const {
    accessToken,
    mapOptions = EmptyObject,
    layers = EmptyArray,
    sidebar = EmptyObject,
    layerProps = EmptyObject
  } = props;

  const { falcor } = useFalcor();

  const [state, dispatch] = React.useReducer(Reducer, DefaultState);

  const initializedLayers = React.useRef([]);

  const pinHoverComp = React.useCallback(({ lngLat }) => {
    dispatch({
      type: "pin-hover-comp",
      lngLat
    });
  }, []);
  const updateHover = React.useMemo(() => {
    return hoverData => {
      dispatch(hoverData);
    };
  }, []);

  const updateFilter = React.useCallback((layer, filterName, value) => {
    if (!get(layer, ["filters", filterName], null)) return;

    dispatch({ type: "loading-start", layerId: layer.id });

    const prevValue = layer.filters[filterName].value;

    layer.filters = {
      ...layer.filters,
      [filterName]: {
        ...layer.filters[filterName],
        prevValue,
        value
      }
    };

    Promise.resolve(layer.onFilterChange(filterName, value, prevValue))
      .then(() => layer.fetchData(falcor))
      .then(() => layer.render(state.map, falcor))
      .then(() => {
        dispatch({ type: "loading-stop", layerId: layer.id });
      });

  }, [state.map, falcor]);

  const addDynamicLayer = React.useCallback(layer => {
    layer.isDynamic = true;
    dispatch({
      type: "add-dynamic-layer",
      layer
    });
  }, []);
  const removeDynamicLayer = React.useCallback(layer => {
    layer._onRemove(state.map);
    dispatch({
      type: "remove-dynamic-layer",
      layer
    });
  }, [state.map]);
  const toggleVisibility = React.useCallback(layer => {
    layer.toggleVisibility(state.map);
    dispatch({ type: "update-state" });
  }, [state.map]);
  const addLayer = React.useCallback(layer => {
    layer._onAdd(state.map, falcor, updateHover)
      .then(() => layer.render(state.map, falcor));
    dispatch({
      type: "activate-layer",
      layerId: layer.id
    });
  }, [state.map, falcor, updateHover]);
  const removeLayer = React.useCallback(layer => {
    layer._onRemove(state.map);
    dispatch({
      type: "deactivate-layer",
      layerId: layer.id
    });
  }, [state.map]);

  const MapActions = React.useMemo(() => ({
    toggleVisibility,
    addLayer,
    removeLayer,
    addDynamicLayer,
    removeDynamicLayer
  }), [toggleVisibility, addLayer, removeLayer, addDynamicLayer, removeDynamicLayer]);

// INITIALIZE LAYERS
  React.useEffect(() => {
    if (!state.map) return;

    [...layers,
      ...state.dynamicLayers
    ].filter(({ id }) => !initializedLayers.current.includes(id))
      .forEach(layer => {
        initializedLayers.current.push(layer.id);

        for (const filterName in layer.filters) {
          layer.filters[filterName].onChange = v => updateFilter(layer, filterName, v);
        }
        layer.addDynamicLayer = addDynamicLayer.bind(layer);

        layer.toolbar.forEach(tool => {
          if (typeof tool === "object") {
            tool.actionFunc = e => {
              toolbarFuncRunner(toolbarFuncArgs(tool, layer, MapActions))
            };
          }
        })

        dispatch({ type: "loading-start", layerId: layer.id });

        return layer._init(state.map, falcor)
          .then(() => {
            if (layer.setActive) {
              return layer._onAdd(state.map, falcor, updateHover)
                .then(() => layer.fetchData(falcor))
                .then(() => layer.render(state.map, falcor));
            }
          })
          .then(() => {
            if (layer.setActive) {
              dispatch({ type: "init-layer", layerId: layer.id });
            }
            dispatch({ type: "loading-stop", layerId: layer.id });
            return layer;
          });
      });
  }, [state.map, state.dynamicLayers, falcor, layers, addDynamicLayer, updateFilter, updateHover, MapActions]);

  const removePinnedHoverComp = React.useCallback(id => {
    dispatch({
      type: "remove-pinned",
      id
    });
  }, []);

// LOAD MAPBOX GL MAP
  React.useEffect(() => {
    if (!accessToken) return;

    mapboxgl.accessToken = accessToken;

    const {
      style, ...Options
    } = { ...DefaultMapOptions, ...mapOptions };

    const map = new mapboxgl.Map({
      container: id,
      ...Options,
      style
    });

    map.on("move", e => {
      dispatch({ type: "update-state", mapMoved: performance.now() });
    });

    map.on("click", pinHoverComp)

    map.once("load", e => {
      dispatch({ type: "map-loaded", map });
    });

    return () => map.remove();
  }, [accessToken, id, mapOptions, pinHoverComp]);

  const projectLngLat = React.useCallback(lngLat => {
    return state.map.project(lngLat);
  }, [state.map]);

  const [activeLayers, inactiveLayers] = React.useMemo(() => {
    const result = [
      ...layers,
      ...state.dynamicLayers
    ].filter(({ id }) => initializedLayers.current.includes(id))
      .reduce((a, c) => {
        if (state.activeLayers.includes(c.id)) {
          c.MapActions = MapActions;
          const props = get(layerProps, c.id);
          if (props) {
            c.receiveProps(props);
          }
          a[0].push(c);
        }
        else {
          a[1].push(c);
        }
        return a;
      }, [[], []]);
    const sortOrder = state.activeLayers.reduce((a, c, i) => {
      a[c] = i;
      return a;
    }, {});
    result[0].sort((a, b) => sortOrder[a.id] - sortOrder[b.id]);
    return result;
  }, [layers, state.dynamicLayers, state.activeLayers, layerProps, MapActions]);

  const loadingLayers = React.useMemo(() => {
    return [
      ...layers,
      ...state.dynamicLayers
    ].filter(layer => Boolean(state.layersLoading[layer.id]));
  }, [layers, state.dynamicLayers, state.layersLoading]);

  const ref = React.useRef(null);

  const { HoverComps, ...hoverData } = React.useMemo(() => {
    const HoverComps = [...state.hoverData.data.values()];
    return { ...state.hoverData, show: Boolean(HoverComps.length), HoverComps };
  }, [state.hoverData]);

  const size = useSetSize(ref);

  const [open, setOpen] = React.useState(true);
  const toggleOpen = React.useCallback(e => {
    setOpen(!open);
  }, [open]);

  return (
    <div className="flex-grow relative flex">
      <div id={ id } className="flex-grow" ref={ ref }/>

      <Sidebar { ...sidebar } stateMap={ state.map }
        layersLoading={ state.layersLoading }
        inactiveLayers={ inactiveLayers }
        activeLayers={ activeLayers }
        MapActions={ MapActions }
        toggleOpen={ toggleOpen }
        open={ open }>

        <div className="absolute bottom-0">
          { loadingLayers.map(layer =>
              <LoadingLayer key={ layer.id } layer={ layer }/>
            )
          }
        </div>

      </Sidebar>

      <HoverCompContainer { ...hoverData } { ...size }>
        { HoverComps.map(({ HoverComp, data, layer }) =>
            <HoverComp key={ layer.id } layer={ layer } data={ data }/>
          )
        }
      </HoverCompContainer>

      <div className={ `
        absolute top-0 bottom-0 left-0 right-0
        pointer-events-none overflow-hidden flex-grow
      ` }>
        { state.pinnedHoverComps.map(({ HoverComps, data, id, ...hoverData }) => (
            <PinnedHoverComp { ...hoverData } { ...size }
              remove={ removePinnedHoverComp }
              project={ projectLngLat }
              key={ id } id={ id }>
              { HoverComps.map(({ HoverComp, data, layer }) =>
                  <HoverComp key={ layer.id } layer={ layer } data={ data }/>
                )
              }
            </PinnedHoverComp>
          ))
        }
      </div>

      <div className="absolute bottom-0 top-0"
        style={ { left: "320px" } }>

      </div>
    </div>
  )
}
export default AvlMap;

const getRect = ref => {
  const node = ref.hasOwnProperty("current") ? ref.current : ref;
  if (!node) return { width: 0, height: 0 };
  return node.getBoundingClientRect();
}

export const useSetSize = ref => {
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  const { width, height } = getRect(ref);

  React.useLayoutEffect(() => {
    setSize({ width, height });
  }, [width, height]);

  return size;
}
