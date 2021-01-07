import React from "react"

const makeBlue = [
  "login",
  "signup",
  "reset-password",
  "verify-email",
  "verify-request",
  "set-password",
  "accept-invite"
]

const AuthContainer = ({ children, action }) => {
  const bgColor = makeBlue.includes(action) ? "bg-cyan-500" : "bg-transparent";
  return (
    <div className={ `
        w-full h-full flex-1 flex flex-col justify-center ${ bgColor }
      ` }>
      <div className="flex flex-col flex-1 max-w-6xl mx-auto">
        { children }
      </div>
    </div>
  )
}

export default AuthContainer
