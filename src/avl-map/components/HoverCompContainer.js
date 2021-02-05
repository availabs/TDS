import React from "react"

import styled from "styled-components"

import { useTheme } from "@availabs/avl-components"

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

const Container = styled.div`
  .hover-comps > * {
    margin-bottom: 0.5rem;
  }
  .hover-comps > *:last-child {
    margin-bottom: 0px;
  }
`

const RemoveButton = ({ children }) => {
  const theme = useTheme();
  return (
    <div style={ { top: "-0.75rem", right: "-0.75rem" } }
      className={ `
        ${ theme.accent2 }
        rounded px-1 absolute inline-block
      ` }>
      { children }
    </div>
  )
}

export const PinnedHoverComp = ({ children, remove, id, project, lngLat, ...rest }) => {
  const theme = useTheme();
  return (
    <Container className={ `
        absolute top-0 left-0 z-10 inline-block
        rounded whitespace-nowrap hover-comp
        pointer-events-auto
        p-2 rounded ${ theme.accent1 }
      ` }
      style={ {
        transform: getPinnedTranslate(project(lngLat)),
        boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.75)"
      } }>
      <RemoveButton>
        <Icon onClick={ e => remove(id) }>
          <span className="fa fa-times"/>
        </Icon>
      </RemoveButton>
      <div className="hover-comps">
        { children }
      </div>
    </Container>
  )
}

export const HoverCompContainer = ({ show, children, ...rest }) => {
  const theme = useTheme();
  return (
    <Container className={ `
        absolute top-0 left-0 z-20
        rounded whitespace-nowrap hover-comp
        pointer-events-none
        p-2 rounded ${ theme.accent1 }
      ` }
      style={ {
        display: show ? "inline-block" : "none",
        transform: getTranslate(rest),
        boxShadow: "2px 2px 8px 0px rgba(0, 0, 0, 0.75)",
        transition: "transform 0.1s ease-out"
      } }>
      <div className="hover-comps">
        { children }
      </div>
    </Container>
  )
}
