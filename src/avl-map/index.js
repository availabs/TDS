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
const getUniqueId = () => `unique-id-${ ++ idCounter }`;

const DefaultState = {
  map: null,
  activeLayers: [],
  dynamicLayers: [],
  filters: [],
  modals: [],
  mapActions: [],
  layersLoading: {},
  hoverData: {
    HoverComp: null,
    data: [],
    pos: [0, 0],
    show: false,
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
    case "update-filter": {
      const { layerId, filterName, value } = payload,
        filters = state.filters.map(filter => {
          if (filter.layerId === layerId && filter.name === filterName) {
            return { ...filter, prevValue: filter.value, value };
          }
          return filter;
        });
      return {
        ...state,
        filters
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
    case "pin-hover-comp":
      return {
        ...state,
        pinnedHoverComps: [
          ...state.pinnedHoverComps,
          { ...state.hoverData, id: getUniqueId() }
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

  const { falcor } = useFalcor();

  const [state, dispatch] = React.useReducer(Reducer, DefaultState);

  const initializedLayers = React.useRef([]);

  const _needsUpdate = React.useRef([]),

    needsUpdate = React.useCallback(layerId => {
      _needsUpdate.current.push(layerId);
    }, [_needsUpdate]),

    checkNeedsUpdate = React.useCallback(layerId => {
      if (!layerId) return Boolean(_needsUpdate.length);

      if (_needsUpdate.current.includes(layerId)) {
        _needsUpdate.current = _needsUpdate.current.filter(id => id !== layerId);
        return true;
      };
      return false;
    }, [_needsUpdate]);

  React.useEffect(() => {
    mapboxgl.accessToken = accessToken;
  }, [accessToken]);

  const mapMoved = React.useMemo(() => {
    return throttle(
      () => dispatch({ type: "update-state", mapMoved: Date.now() })
    , 50);
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

    map.on("move", mapMoved);

    map.on("load", () => {
      dispatch({ type: "map-loaded", map });
    });

    return () => { map.remove(); };
  }, [id, mapOptions, mapMoved]);

  const updateFilter = React.useCallback((layer, filterName, value) => {
    needsUpdate(layer.id);
    dispatch({
      type: "update-filter",
      layerId: layer.id,
      filterName,
      value
    });
  }, [needsUpdate]);

  const updateHover = React.useMemo(() => {
    return throttle((hoverData) => {
      dispatch({
        type: "update-hover",
        hoverData
      });
    }, 50);
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

      layers.filter(({ layerId }) => !initializedLayers.current.includes(layerId))
        .reduce((promise, layer) => {

          return promise.then(() => layer._init(state.map, falcor))
            .then(() => {

              const { filters, modals, mapActions } = layer;

              initializedLayers.current.push(layer);
              needsUpdate(layer.id);

              data.filters.push(...filters.map(f =>
                ({ ...f, layerId: layer.id, prevValue: f.value,
                  onChange: v => updateFilter(layer, f.name, v)
                })
              ));
              data.modals.push(...modals.map(m =>
                ({ ...m, layerId: layer.id })
              ));
              data.mapActions.push(...mapActions.map(ma =>
                ({ ...ma, layerId: layer.id })
              ));

              if (layer.setActive) {
                data.activeLayers.push(layer.id);
                layer._onAdd(state.map, filters, falcor, updateHover, pinHoverComp);
              }
            })

        }, Promise.resolve())
          .then(() => {
            dispatch({
              type: "init-layers",
              ...data
            });
          });
    }
  }, [layers, state.map, updateFilter, initializedLayers, needsUpdate, falcor, updateHover, pinHoverComp]);

  const allLayers = React.useMemo(() => {
    return layers.map(layer => ({
        layer,
        filters: state.filters
          .filter(({ layerId }) => layerId === layer.id)
      }));
  }, [layers, state.filters]);

  const activeLayers = React.useMemo(() => {
    return layers.filter(({ id }) => state.activeLayers.includes(id))
      .map(layer => ({
        layer,
        filters: state.filters
          .filter(({ layerId }) => layerId === layer.id)
      }));
  }, [layers, state.filters, state.activeLayers]);

  React.useEffect(() => {
    activeLayers.forEach(({ layer, filters }) => {
      if (checkNeedsUpdate(layer.id)) {

        dispatch({ type: "loading-start", layerId: layer.id });

        layer.fetchData(filters, falcor)
          .then(() => layer.render(state.map, filters, falcor))
          .then(() => {
            dispatch({ type: "loading-stop", layerId: layer.id });
          });
      }
    });
  }, [activeLayers, checkNeedsUpdate, state.map, falcor]);

  React.useEffect(() => {
    activeLayers.forEach(({ layer, filters }) => {
      const props = get(layerProps, layer.id);
      if (props) {
        layer.receiveProps(props, state.map, filters, falcor);
      }
    })
  }, [activeLayers, layerProps, state.map, falcor]);

  const addLayer = React.useCallback(({ layer, filters }) => {
    layer._onAdd(state.map, filters, falcor, updateHover, pinHoverComp)
      // .then(() => layer.fetchData(filters, falcor))
      .then(() => layer.render(state.map, filters, falcor));
    dispatch({
      type: "activate-layer",
      layerId: layer.id
    });
  }, [state.map, falcor, updateHover, pinHoverComp]);
  const removeLayer = React.useCallback(layer => {
    layer._onRemove(state.map);
    dispatch({
      type: "deactivate-layer",
      layerId: layer.id
    });
  }, [state.map]);

  const loadingLayers = React.useMemo(() => {
    return activeLayers.filter(({ layer }) => Boolean(state.layersLoading[layer.id]));
  }, [activeLayers, state.layersLoading]);

  const ref = React.useRef(null),
    { HoverComp, data,
      ...hoverData
    } = get(state, "hoverData", {});

  const size = useSetSize(ref);

  return (
    <div className="flex-grow relative flex">
      <div id={ id } className="flex-grow" ref={ ref }/>

      <Sidebar { ...sidebar }
        layers={ allLayers }
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
          { loadingLayers.map(({ layer }) =>
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
