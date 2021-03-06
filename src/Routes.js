import Landing from "pages/Landing"
import AdminLanding from "pages/Landing/admin"
import NoMatch from "pages/404"

import Auth from "pages/auth"

import Continuous from "pages/continuous"
import Short from "pages/short"

import MapPage from "pages/map"
import TrafficDataMap from "pages/map/TrafficDataMap"

const Routes = [
  Landing,
  AdminLanding,
  Auth,
  ...Continuous,
  ...Short,
  ...MapPage,
  ...TrafficDataMap,
  NoMatch
]

export default Routes
