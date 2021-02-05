import React from "react"

import { Select } from "@availabs/avl-components"

import CollapsibleSidebar from "../avl-components/CollapsibleSidebar"

import LayerPanel from "./LayerPanel"

const Sidebar = ({ inactiveLayers, activeLayers, toggleOpen, open,
                    MapActions, title = "", children, ...rest }) => {

  return (
    <CollapsibleSidebar open={ open }
      toggle={ toggleOpen }
      placeBeside={ children }>
      <div className="p-1 h-full bg-blueGray-900 rounded">
        { !title ? null :
          <div className="text-xl font-bold">
            { title }
          </div>
        }
        { !inactiveLayers.length ? null :
          <div className="mb-1 p-1 bg-blueGray-800">
            <div className="p-1 bg-blueGray-700">
              <Select options={ inactiveLayers }
                placeholder="Add a Layer..."
                accessor={ ({ name }) => name }
                value={ null } multi={ false }
                searchable={ false }
                onChange={ MapActions.addLayer }/>
            </div>
          </div>
        }
        { activeLayers.map(layer =>
            <LayerPanel key={ layer.id } { ...rest }
              layer={ layer } MapActions={ MapActions }/>
          )
        }
      </div>
    </CollapsibleSidebar>
  )
}
export default Sidebar;
