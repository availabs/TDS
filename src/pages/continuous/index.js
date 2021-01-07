import ContinuousComponent from "./components/Continuous"
import continuousWrapper from "./wrappers/continuous"

const continuous = {
  path: "/continuous",
  mainNav: true,
  name: "Continuous Counts",
  exact: true,
  authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Continuous Counts"
    }
  },
  component: {
    type: ContinuousComponent,
    wrappers: [
      "show-loading",
      continuousWrapper,
      "avl-falcor"
    ]
  }
}
export default continuous;
