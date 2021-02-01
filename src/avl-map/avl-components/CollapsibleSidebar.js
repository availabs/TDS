import React from "react"

const Sidebar = ({ width = 300, padding = 10, children }) => {
  return (
    <div className="absolute top-0 left-0 bottom-0"
      style={ { padding: `${ padding }px` } }>
      <div className="h-full overflow-auto scrollbar-sm"
        style={ { width: `${ width - padding * 2 }px` } }>
        { children }
      </div>
    </div>
  )
}
export default Sidebar;
