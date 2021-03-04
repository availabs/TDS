import ShortComponent from "./Short"
import shortWrapper from "./wrappers/short"

import ShortStation from "./ShortStation"
import shortStation from "./wrappers/shortStation"

import ShortUploader from "./ShortUploader"

import UploadedShorts from "./UploadedShorts"
import shortUploaded from "./wrappers/shortUploaded"

import ShortCountVolume from "./ShortCountVolume"
import shortCountVolume from "./wrappers/shortCountVolume"

import ShortCountSpeed from "./ShortCountSpeed"
import shortCountSpeed from "./wrappers/shortCountSpeed"

import ShortCountClass from "./ShortCountClass"
import shortCountClass from "./wrappers/shortCountClass"

const Station = {
  path: "/short/station/:stationId",
  // mainNav: true,
  name: "Short Counts",
  exact: true,
  // authLevel: 0,
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
  path: ["/short", "/short/region/:region"],
  mainNav: true,
  name: "Short Counts",
  exact: true,
  // authLevel: 0,
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

const Uploaded = {
  path: "/short/uploaded",
  mainNav: true,
  name: "Uploaded Shorts",
  exact: true,
  // authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Uploaded Shorts"
    }
  },
  component: {
    type: UploadedShorts,
    wrappers: [
      "show-loading",
      shortUploaded,
      "avl-falcor",
      "with-auth"
    ]
  }
}

const VolumeCount = {
  path: "/short/volume/count/:count_id",
  mainNav: false,
  name: "Short Count Volume",
  exact: true,
  // authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Short Count Volume"
    }
  },
  component: {
    type: ShortCountVolume,
    wrappers: [
      "show-loading",
      shortCountVolume,
      "avl-falcor",
      "with-auth"
    ]
  }
}
const SpeedCount = {
  path: "/short/speed/count/:count_id",
  mainNav: false,
  name: "Short Count Speed",
  exact: true,
  // authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Short Count Speed"
    }
  },
  component: {
    type: ShortCountSpeed,
    wrappers: [
      "show-loading",
      shortCountSpeed,
      "avl-falcor",
      "with-auth"
    ]
  }
}
const ClassCount = {
  path: "/short/class/count/:count_id",
  mainNav: false,
  name: "Short Count Class",
  exact: true,
  // authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'side',
    headerBar: {
      title: "Short Count Class"
    }
  },
  component: {
    type: ShortCountClass,
    wrappers: [
      "show-loading",
      shortCountClass,
      "avl-falcor",
      "with-auth"
    ]
  }
}

const Uploader = {
  path: "/short/uploader",
  mainNav: true,
  name: "Short Uploader",
  exact: true,
  // authLevel: 0,
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
  Uploaded,
  Station,
  VolumeCount,
  SpeedCount,
  ClassCount,
  Short
];
export default routes;
