import React from "react"

import get from "lodash.get"

import AvlMap from "avl-map"

import { MAPBOX_TOKEN } from "config.private"

import { TestCountyLayerFactory } from "./layers/TestCountyLayer"
import { TestCousubLayerFactory } from "./layers/TestCousubLayer"

const Map = ({ mapOptions, layers, falcor }) => {

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
    <AvlMap 
      accessToken={ MAPBOX_TOKEN }
      mapOptions={ mapOptions }
      layers={ layers }
      sidebar={ {
        title: "Map Test",
        tabs: ["layers", "styles",
          { icon: "fa-cog",
            Component: CustomTab
          }
        ]
      } }/>
  )
}

const CustomTab = props => {
  return (
    <div className={ `bg-blueGray-800 p-1 rounded` }>
      <div className={ `bg-blueGray-700 p-1 rounded` }>
        SOME STUFF HERE!!!!
      </div>
    </div>
  )
}

const MapPage = {
  path: "/maptest",
  mainNav: false,
  name: "Map Test",
  exact: true,
  // authLevel: 0,
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
        TestCousubLayerFactory(),
        TestCountyLayerFactory()
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
