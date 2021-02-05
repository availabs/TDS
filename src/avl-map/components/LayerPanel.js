import React from "react"

import { Select, useTheme } from "@availabs/avl-components"

const LayerPanel = ({ layer, layersLoading, ...rest }) => {
  const [open, setOpen] = React.useState(true),
    toggleOpen = React.useCallback(e => {
      setOpen(!open);
    }, [open, setOpen]);

  const filters = React.useMemo(() => {
    return generateFilters(Object.values(layer.filters));
  }, [layer.filters]);

  const theme = useTheme();

  return (
    <div className="bg-blueGray-800 p-1 mb-1 rounded relative">
      <div className={ `
          absolute top-0 bottom-0 left-0 right-0 z-10
          ${ Boolean(layersLoading[layer.id]) ? "block" : "hidden" }
          ${ theme.sidebarBg } opacity-50
        ` }/>
      <LayerHeader layer={ layer } { ...rest }
        open={ open } toggleOpen={ toggleOpen }/>
      <div style={ { display: open ? "block" : "none" } }>
        { filters }
      </div>
    </div>
  )
}
export default LayerPanel;

const generateFilters = filters => {
  return filters.map(({ name, type, layerId, ...rest }, i) => {
    switch (type) {
      default:
        return (
          <div className="mt-1 bg-blueGray-700 p-1 rounded"
            key={ `${ layerId }-${ name }` }>
            <div className="text-base leading-4 mb-1">
              { name }
            </div>
            <Select { ...rest }/>
          </div>
        )
    }
  })
}

export const Icon = ({ onClick, cursor="cursor-pointer", className="", style={}, children }) => (
  <div className={ `
      ${ cursor } ${ className }
      hover:text-cyan-400 inline-block
    ` }
    style={ { padding: "2px 4px", ...style } }
    onClick={ onClick }>
    { children }
  </div>
)

const LayerHeader = ({ layer, toggleOpen, open, MapActions }) => {

  return (
    <div className="flex flex-col px-1 bg-blueGray-700 rounded">
      <div className="flex items-center"
        style={ { marginBottom: "-3px" } }>
        <div className="font-semibold text-lg leading-5">
          <Icon cursor="cursor-move">
            <span className="fa fa-bars mr-1"/>
          </Icon>
          { layer.name }
        </div>
        <div className="flex-1 flex justify-end">
          { !layer.isDynamic ? null :
            <Icon onClick={ e => MapActions.removeDynamicLayer(layer) }>
              <span className="fa fa-trash"/>
            </Icon>
          }
          <Icon onClick={ e => MapActions.removeLayer(layer) }>
            <span className="fa fa-times"/>
          </Icon>
          <Icon onClick={ toggleOpen }>
            <span className={ `fa fa-sm ${ open ? 'fa-minus' : 'fa-plus' }` }/>
          </Icon>
        </div>
      </div>
      <div className="flex items-center"
        style={ { marginTop: "-3px" } }>
        { layer.toolbar.map((tool, i) =>
            <LayerTool MapActions={ MapActions }
              layer={ layer } tool={ tool } key={ i }/>
          )
        }
      </div>
    </div>
  )
}

const DefaultToolbars = {
  "toggle-visibility":
    ({ MapActions, layer }) => (
      <Icon onClick={ e => MapActions.toggleVisibility(layer) }>
        <span className={ `fa fa-sm ${ layer.isVisible ? "fa-eye" : "fa-eye-slash" }` }/>
      </Icon>
    )
};

const LayerTool = ({ tool, layer, MapActions }) => {
  const Tool = React.useMemo(() => {
    if (tool in DefaultToolbars) {
      return DefaultToolbars[tool];
    }
    return () => (
      <Icon onClick={ tool.actionFunc }>
        <span className={ `fa fa-sm ${ tool.icon }` }/>
      </Icon>
    )
  }, [tool]);
  return (
    <Tool layer={ layer } MapActions={ MapActions }/>
  )
};
