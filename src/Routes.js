import Landing from "pages/Landing"
import NoMatch from "pages/404"

import Auth from "pages/auth"

import Continuous from "pages/continuous"
import Short from "pages/short"

import MapPage from "pages/map"

const Routes = [
  Landing,
  Auth,
  ...Continuous,
  ...Short,
  ...MapPage,
  NoMatch
]

export default Routes
