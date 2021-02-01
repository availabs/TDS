import React from "react"

import { Icon } from "./LayerPanel"

const getTranslate = ({ pos, width, height }) => {

  const gap = 30, padding = 10, [x, y] = pos;

  const yMax = height,
    yTrans = `max(
      ${ padding }px,
      min(calc(${ y }px - 50%), calc(${ yMax - padding }px - 100%))
    )`;
  if (x < width * 0.5) {
    return `translate(
      ${ x + gap }px,
      ${ yTrans }
    )`
  }
  return `translate(
    calc(-100% + ${ x - gap }px),
    ${ yTrans }
  )`
}
const getPinnedTranslate = ({ x, y }) => {
  const gap = 30;
  return `translate(${ x + gap }px, calc(${ y }px - 50%))`;
}

export const PinnedHoverComp = ({ children, remove, id, project, lngLat, ...rest }) => {
  const onClick = React.useCallback(e => {
    remove(id);
  }, [remove, id]);
  return (
    <div className={ `
        absolute top-0 left-0 z-50 inline-block
        rounded whitespace-nowrap hover-comp
        pointer-events-auto
      ` }
      style={ {
        transform: getPinnedTranslate(project(lngLat)),
        boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.75)"
      } }>
      <Icon onClick={ onClick } className="absolute"
        style={ { top: "0px", right: "4px", } }>
        <span className="fa fa-times"/>
      </Icon>
      { children }
    </div>
  )
}

export const HoverCompContainer = ({ show, children, ...rest }) => {
  return (
    <div className={ `
        absolute top-0 left-0 z-50 pointer-events-none
        rounded whitespace-nowrap hover-comp
      ` }
      style={ {
        display: show ? "inline-block" : "none",
        transform: getTranslate(rest),
        boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.75)",
        transition: "transform 0.15s ease-out"
      } }>
      { children }
    </div>
  )
}
