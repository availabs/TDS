import React from "react"

import get from "lodash.get"

import AvlMap from "avl-map"

import { MAPBOX_TOKEN } from "config.private"

import { withAuth } from '@availabs/avl-components'

import { RisLayerFactory } from "./layers/RISLayer"

import { PublicNav } from 'pages/Landing'

const Map = withAuth(({ mapOptions, layers, falcor, user }) => {

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
    <div className='h-screen  h-full flex-1 flex flex-col text-white'>
      {user && user.authLevel > 0 ? <React.Fragment/> : <PublicNav />}
      <AvlMap 
        accessToken={ MAPBOX_TOKEN }
        mapOptions={ mapOptions }
        layers={ layers }
        sidebar={{
          title: "Map Test",
          tabs: ["layers", "styles"],
          open: false
        }}/>
    </div>
  )
})



const MapPage = {
  path: "/map",
  mainNav: false,
  name: "Traffic Data Map",
  exact: true,
  // authLevel: 0,
  layout: 'Simple',
  layoutSettings: {
    fixed: true,
    navBar: 'top',
    headerBar: false
  },
  component: {
    type: Map,
    props: {
      mapOptions: {
        zoom: 6.6
      },
      layers: [
        RisLayerFactory()
      ]
    },
    wrappers: [
      "avl-falcor"
    ]
  }
}

const AdminMapPage = {
  path: "/authmap",
  mainNav: true,
  name: "Traffic Data Map",
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
        zoom: 6.6
      },
      layers: [
        RisLayerFactory()
      ]
    },
    wrappers: [
      "avl-falcor"
    ]
  }
}
const routes = [
  MapPage,
  AdminMapPage
];
export default routes;
