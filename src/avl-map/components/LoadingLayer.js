import React from "react"

import { ScalableLoading } from "@availabs/avl-components"

const LoadingLayer = ({ layer, progress }) => {
  return (
    <div className="bg-blueGray-900 flex rounded-tl rounded-bl items-center"
      style={ {
        width: "300px",
        borderTopRightRadius: "25px",
        borderBottomRightRadius: "25px",
        padding: "5px 5px 5px 10px",
        marginTop: "8px"
      } }>
      <div className="flex-1 text-xl font-bold">
        { layer.name }
      </div>
      <div>
        <ScalableLoading scale={ 0.4 }/>
      </div>
    </div>
  )
}
export default LoadingLayer;
