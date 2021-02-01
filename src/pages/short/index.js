import ShortComponent from "./components/Short"
import shortWrapper from "./wrappers/short"

const Overview = {
  path: "/short",
  mainNav: true,
  name: "Short Counts",
  exact: true,
  authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Short Counts"
    }
  },
  component: {
    type: ShortComponent,
    wrappers: [
      "show-loading",
      shortWrapper,
      "avl-falcor"
    ]
  }
}
const routes = [
  Overview
];
export default routes;
