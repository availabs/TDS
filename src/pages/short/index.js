import ShortComponent from "./Short"
import shortWrapper from "./wrappers/short"

import ShortStation from "./ShortStation"
import shortStation from "./wrappers/shortStation"

import ShortUploader from "./ShortUploader"

const Station = {
  path: "/short/station/:stationId",
  // mainNav: true,
  name: "Short Counts",
  exact: true,
  authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Station View"
    }
  },
  component: {
    type: ShortStation,
    wrappers: [
      "show-loading",
      shortStation,
      "avl-falcor"
    ]
  }
}

const Short = {
  path: ["/short", "/short/:region"],
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

const Uploader = {
  path: "/short-uploader",
  mainNav: true,
  name: "Short Uploader",
  exact: true,
  authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Short Uploader"
    }
  },
  component: {
    type: ShortUploader,
    wrappers: [
      "show-loading",
      // shortWrapper,
      "avl-falcor",
      "with-auth"
    ]
  }
}
const routes = [
  Uploader,
  Station,
  Short
];
export default routes;
