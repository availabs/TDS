import React from "react"

import { useHistory } from "react-router-dom"

import get from "lodash.get"

import AvlMap from "avl-map"

import { MAPBOX_TOKEN } from "config.private"

import { layerFactory1 } from "./layers/TestLayer"

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

  const history = useHistory();

  // const layerProps = React.useMemo(() => {
  //   return {
  //     [layers[0].id]: {
  //       history
  //     }
  //   }
  // }, [layers, history]);

  return (
    <AvlMap accessToken={ MAPBOX_TOKEN }
      // layerProps={ layerProps }
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
        layerFactory1()
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
