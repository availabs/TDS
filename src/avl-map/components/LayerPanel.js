import React from "react"

import { Select } from "@availabs/avl-components"

const LayerPanel = ({ layer, filters, removeLayer }) => {
  const [open, setOpen] = React.useState(true),
    toggle = React.useCallback(e => {
      setOpen(!open);
    }, [open, setOpen]);

  return (
    <div className="bg-blueGray-800 p-1 mb-1 rounded">
      <LayerHeader layer={ layer }
        open={ open } toggle={ toggle }
        removeLayer={ removeLayer }/>
      <div style={ { display: open ? "block" : "none" } }>
        { generateFilters(filters) }
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

const LayerHeader = ({ layer, toggle, open, removeLayer }) => {
  const remove = React.useCallback(e => {
    removeLayer(layer);
  }, [layer, removeLayer])
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
          <Icon onClick={ remove }>
            <span className="fa fa-times mr-1"/>
          </Icon>
          <Icon onClick={ toggle }>
            <span className={ `fa fa-sm ${ open ? 'fa-minus' : 'fa-plus' }` }/>
          </Icon>
        </div>
      </div>
      <div className="flex items-center"
        style={ { marginTop: "-3px" } }>
        { /*
          <Icon onClick={ null }>
            <span className="fa fa-sm fa-cog mr-1"/>
          </Icon>
          <Icon onClick={ null }>
            <span className="fa fa-sm fa-map mr-1"/>
          </Icon> */
        }
        <Icon onClick={ null }>
          <span className="fa fa-sm fa-eye"/>
        </Icon>
      </div>
    </div>
  )
}
