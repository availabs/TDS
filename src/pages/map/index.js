import React from "react"

import get from "lodash.get"

import AvlMap from "avl-map"

import { MAPBOX_TOKEN } from "config.private"

import { TestCountyLayerFactory } from "./layers/TestCountyLayer"
import { TestCousubLayerFactory } from "./layers/TestCousubLayer"

const Map = ({ mapOptions, layers, falcor, falcorCache }) => {

  React.useEffect(() => {
    falcor.get(["geo", "36", ["counties", "cousubs"]])
      .then(res => {
        const counties = get(res, ["json", "geo", "36", "counties"]),
          cousubs = get(res, ["json", "geo", "36", "cousubs"]);
        return falcor.get(["geo", counties, "name"])
          .then(() => falcor.get(["geo", cousubs, "name"]));
      });
  }, [falcor]);

  return (
    <AvlMap accessToken={ MAPBOX_TOKEN }
      sidebar={ {
        title: "Map Test",
        layers: ["layers", "styles"]
      } }
      mapOptions={ mapOptions }
      layers={ layers }/>
  )
}

const MapPage = {
  path: "/map",
  mainNav: true,
  name: "Map Test",
  exact: true,
  authLevel: 0,
  layoutSettings: {
    fixed: true,
    navBar: 'top',
    headerBar: false
  },
  component: {
    type: Map,
    props: {
      mapOptions: {
        zoom: 9
      },
      layers: [
        TestCountyLayerFactory(),
        TestCousubLayerFactory()
      ]
    },
    wrappers: [
      "avl-falcor"
    ]
  }
}
const routes = [
  MapPage
];
export default routes;
