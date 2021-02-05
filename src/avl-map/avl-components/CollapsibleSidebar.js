import React from "react"

import { useTheme } from "@availabs/avl-components"

const Sidebar = ({ placeBeside, width = 320, padding = 8, children, toggle, open = true }) => {

  const [transitioning, setTransitioning] = React.useState(false);

  const timeout = React.useRef();

  React.useEffect(() => {
    return () => clearTimeout(timeout.current);
  }, []);

  const doToggle = React.useCallback(e => {
    setTransitioning(true);
    toggle();
    timeout.current = setTimeout(setTransitioning, 500, false);
  }, [toggle]);

  const theme = useTheme();

  return (
    <div className="absolute top-0 left-0 bottom-0"
      style={ { padding: `${ padding }px` } }>
      <div className="h-full scrollbar-sm relative"
        style={ {
          width: `${ open ? (width - padding * 2) : 0 }px`,
          transition: "width 500ms"
        } }>

        <div className="absolute top-0 bottom-0"
          style={ {
            left: `calc(100% + ${ padding }px - ${ open ? 0 : padding }px)`,
            transition: "left 500ms"
          } }>
          
          { placeBeside }

          <div className={ `
              rounded bg-white z-10 py-1 absolute
              ${ theme.sidebarBg } cursor-pointer flex flex-col
              hover:${ theme.menuBg } transition
            ` }
            style={ {
              transform: `translateY(-50%)`,
              transition: "left 500ms",
              top: "50%"
            } }
            onClick={ doToggle }>

            <div className="fa fa-caret-left text-2xl pl-1 pr-2"
              style={ {
                transform: `scaleX(${ open ? 1 : -1 }`,
                transition: "transform 500ms"
              } }/>
            <div className="fa fa-caret-left text-2xl pl-1 pr-2"
              style={ {
                transform: `scaleX(${ open ? 1 : -1 }`,
                transition: "transform 500ms ease 250ms"
              } }/>
            <div className="fa fa-caret-left text-2xl pl-1 pr-2"
              style={ {
                transform: `scaleX(${ open ? 1 : -1 }`,
                transition: "transform 500ms ease 500ms"
              } }/>

          </div>

        </div>

        <div className="h-full w-full"
          style={ {
            overflow: open && !transitioning ? "visible" : "hidden"
          } }>
          <div className="h-full"
            style={ {
              width: `${ width - padding * 2 }px`
            } }>

            { children }

          </div>
        </div>
      </div>
    </div>
  )
}
export default Sidebar;

const temp = (
  <>
    <div className="h-20 w-0 border rounded mx-1"/>
    <div className="h-20 w-0 border rounded mr-1"/>
    <div className="h-20 w-0 border rounded mr-1"/>
  </>
)
