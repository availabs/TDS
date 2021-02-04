import React from "react"

import mapboxgl from "mapbox-gl"

import get from "lodash.get"
import throttle from "lodash.throttle"

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

// const getLayer = (layers, layerId) => {
//   return layers.reduce((a, c) => {
//     return c.layerId === layerId ? c : a;
//   }, null);
// };
//
// const getFilter = (filters, layerId, filterName) => {
//   return filters.reduce((a, c) => {
//     return c.layerId === layerId && c.name === filterName ? c : a;
//   }, null);
// };

let idCounter = 0;
const getUniqueId = () => `unique-id-${ ++idCounter }`;

const reduceHoverData = ({ data }) =>
  [...data.values()].reduce((a, c) => a.concat(c), []);

const DefaultState = {
  map: null,
  activeLayers: [],
  dynamicLayers: [],
  modals: [],
  mapActions: [],
  layersLoading: {},
  hoverData: {
    HoverComp: null,
    data: new Map(),
    pos: [0, 0],
    lngLat: {}
  },
  pinnedHoverComps: []
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "init-layers": {
      const { filters, modals, mapActions, activeLayers } = payload;
      return {
        ...state,
        activeLayers,
        filters,
        modals,
        mapActions,
        layersLoading: {
          ...state.layersLoading,
          ...activeLayers.reduce((a, c) => ({ ...a, [c]: 0 }), {})
        }
      };
    }
    case "loading-start":
      return {
        ...state,
        layersLoading: {
          ...state.layersLoading,
          [payload.layerId]: state.layersLoading[payload.layerId] + 1
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
      const { data, layerId, ...rest } = payload;
      state.hoverData.data.set(layerId, data);
      return {
        ...state,
        hoverData: {
          ...state.hoverData,
          ...rest
        }
      }
    }
    case "layer-leave": {
      const { layerId } = payload;
      state.hoverData.data.delete(layerId);
      return {
        ...state,
        hoverData: {
          ...state.hoverData
        }
      }
    }
    case "pin-hover-comp":
      return {
        ...state,
        pinnedHoverComps: [
          ...state.pinnedHoverComps,
          { ...state.hoverData,
            id: getUniqueId(),
            data: reduceHoverData(state.hoverData)
          }
        ]
      }
    case "remove-pinned":
      return {
        ...state,
        pinnedHoverComps: state.pinnedHoverComps
                            .filter(({ id }) => id !== payload.compId)
      };
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

const AvlMap = props => {

  const {
    id = "avl-mapbox-gl",
    accessToken,
    mapOptions = EmptyObject,
    layers = EmptyArray,
    sidebar = EmptyObject,
    layerProps = EmptyObject
  } = props;

  const { falcor, falcorCache } = useFalcor();

  const [state, dispatch] = React.useReducer(Reducer, DefaultState);

  const initializedLayers = React.useRef([]);

  React.useEffect(() => {
    mapboxgl.accessToken = accessToken;
  }, [accessToken]);

  const mapMoved = React.useMemo(() => {

  }, []);

  React.useEffect(() => {
		// const regex = /^mapbox:\/\/styles\//;

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

    map.on("load", e => {
      dispatch({ type: "map-loaded", map });
    });

    return () => map.remove();
  }, [id, mapOptions, mapMoved]);

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
      .then(() => layer.fetchData(falcor, falcorCache))
      .then(() => layer.render(state.map, falcorCache))
      .then(() => {
        dispatch({ type: "loading-stop", layerId: layer.id });
      });

  }, [state.map, falcor, falcorCache]);

  const updateHover = React.useMemo(() => {
    return hoverData => {
      dispatch(hoverData);
    };
  }, []);
  const pinHoverComp = React.useCallback(hoverData => {
    dispatch({
      type: "pin-hover-comp",
      hoverData
    });
  }, []);
  const removePinnedHoverComp = React.useCallback(compId => {
    dispatch({
      type: "remove-pinned",
      compId
    });
  }, []);

  const toggleVisibility = React.useCallback(layer => {
    layer.toggleVisibility(state.map);
    dispatch({ type: "update-state" });
  }, [state.map]);

  const projectLngLat = React.useCallback(lngLat => {
    return state.map.project(lngLat);
  }, [state.map]);

  React.useEffect(() => {
    if (state.map) {

      const data = {
        filters: [],
        modals: [],
        mapActions: [],
        activeLayers: [],
        initedLayers: []
      };

      const layersToInit = layers
        .filter(({ id }) => !initializedLayers.current.includes(id))
        .map(layer => {
          return layer._init(state.map, falcor, falcorCache)
            .then(() => {

              const { modals, mapActions } = layer;

              initializedLayers.current.push(layer.id);

              for (const filterName in layer.filters) {
                layer.filters[filterName] = {
                  ...layer.filters[filterName],
                  layerId: layer.id,
                  prevValue: null,
                  onChange: v => updateFilter(layer, filterName, v)
                }
              }
              data.filters.push(...Object.values(layer.filters));

              if (layer.setActive) {
                data.activeLayers.push(layer.id);
                layer._onAdd(state.map, falcor, falcorCache, updateHover, pinHoverComp)
                  .then(() => layer.fetchData(falcor, falcorCache))
                  .then(() => layer.render(state.map, falcorCache));
              }
            })
        });

        if (layersToInit.length) {
          Promise.all(layersToInit)
            .then(() => {
              dispatch({
                type: "init-layers",
                ...data
              });
            })
        };
    }
  }, [layers, state.map, updateFilter, initializedLayers, falcor, falcorCache, updateHover, pinHoverComp]);

  const [activeLayers, inactiveLayers] = React.useMemo(() => {
    return layers.reduce((a, c) => {
      if (state.activeLayers.includes(c.id)) {
        a[0].push(c);
      }
      else {
        a[1].push(c);
      }
      return a;
    }, [[], []]);
  }, [layers, state.activeLayers]);

  React.useEffect(() => {
    activeLayers.forEach(layer => {
      const props = get(layerProps, layer.id);
      if (props) {
        layer.receiveProps(props, state.map, falcor, falcorCache);
      }
    })
  }, [activeLayers, layerProps, state.map, falcor, falcorCache]);

  const addLayer = React.useCallback(layer => {
    layer._onAdd(state.map, falcor, falcorCache, updateHover, pinHoverComp)
      .then(() => layer.render(state.map, falcorCache));
    dispatch({
      type: "activate-layer",
      layerId: layer.id
    });
  }, [state.map, falcor, falcorCache, updateHover, pinHoverComp]);
  const removeLayer = React.useCallback(layer => {
    layer._onRemove(state.map);
    dispatch({
      type: "deactivate-layer",
      layerId: layer.id
    });
  }, [state.map]);

  const loadingLayers = React.useMemo(() => {
    return activeLayers.filter(layer => Boolean(state.layersLoading[layer.id]));
  }, [activeLayers, state.layersLoading]);

  const ref = React.useRef(null);

  const {
    HoverComp, data,
    ...hoverData
  } = React.useMemo(() => {
    const data = reduceHoverData(state.hoverData);
    return { ...state.hoverData, show: Boolean(data.length), data };
  }, [state.hoverData]);

  const size = useSetSize(ref);

  return (
    <div className="flex-grow relative flex">
      <div id={ id } className="flex-grow" ref={ ref }/>

      <Sidebar { ...sidebar }
        toggleVisibility={ toggleVisibility }
        inactiveLayers={ inactiveLayers }
        activeLayers={ activeLayers }
        addLayer={ addLayer }
        removeLayer={ removeLayer }/>

      <HoverCompContainer { ...hoverData } { ...size }>
        { !HoverComp ? null : <HoverComp data={ data }/> }
      </HoverCompContainer>

      <div className={ `
        absolute top-0 bottom-0 left-0 right-0
        pointer-events-none overflow-hidden flex-grow
      ` }>
        { state.pinnedHoverComps.map(({ HoverComp, data, id, ...hoverData }) => (
            <PinnedHoverComp { ...hoverData } { ...size }
              remove={ removePinnedHoverComp }
              project={ projectLngLat }
              key={ id } id={ id }>
              { !HoverComp ? null : <HoverComp data={ data }/> }
            </PinnedHoverComp>
          ))
        }
      </div>

      <div className="absolute bottom-0 top-0"
        style={ { left: "300px" } }>

        <div className="absolute bottom-0">
          { loadingLayers.map(layer =>
              <LoadingLayer key={ layer.id } layer={ layer }/>
            )
          }
        </div>
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
