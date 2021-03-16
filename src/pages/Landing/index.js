import React from 'react';
import {Redirect, Link} from 'react-router-dom'
import {TopNav, withAuth} from '@availabs/avl-components'
import AuthMenu from 'pages/auth/components/AuthMenu'



const navItems = [
  {
    name: 'Traffic Data Map',
    path: `/map/`,
    //icon: 'fa fa-home',
    className: 'font-medium text-lg'
    
  },
  {
      name: 'Traffic Stats',
      path: `/short/`,
      //icon: 'fa fa-edit',
      className: 'font-medium text-lg'
  },
  {
      name: 'Documentation',
      path: `/docs/`,
      //icon: 'fa fa-edit',
      className: 'font-medium text-lg'
  }
]

export const PublicNav = () => 
  <TopNav 
    menuItems={navItems} 
    open={false} 
    logo={<div>TDS</div>} 
    rightMenu={<AuthMenu />}
    customTheme={{
      sidebarBg: 'bg-gray-800',
      topNavHeight: '12' ,
      navitemTop: 'px-8 inline-flex items-center text-base font-normal text-white hover:text-gray-300 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out',
      navitemTopActive: 'px-8 inline-flex items-center  text-base font-normal text-blue-500 hover:pb-4 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out'
    }}
    
  />

export const Pattern = () => 
  <div className="hidden sm:block sm:absolute sm:inset-0" aria-hidden="true">
    <svg className="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-gray-700 lg:top-0 lg:mt-28 lg:mb-0 xl:transform-none xl:translate-x-0" width={364} height={384} viewBox="0 0 364 384" fill="none">
      <defs>
        <pattern id="eab71dd9-9d7a-47bd-8044-256344ee00d0" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
          <rect x={0} y={0} width={4} height={4} fill="currentColor" />
        </pattern>
      </defs>
      <rect width={364} height={384} fill="url(#eab71dd9-9d7a-47bd-8044-256344ee00d0)" />
    </svg>
  </div>

const Landing = () =>
 <div className="relative bg-gray-800 overflow-hidden min-h-screen">
  <Pattern />
  <div class="relative">
    <PublicNav />
  </div>
  <div className="relative pt-6 pb-16 sm:pb-24">
    <main className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-7xl">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div>
              <div  className="inline-flex items-center text-white bg-gray-900 rounded-full p-1 pr-2 sm:text-base lg:text-sm xl:text-base hover:text-gray-200">
                <span className="px-3 py-0.5 text-white text-xs font-semibold leading-5 uppercase tracking-wide bg-blue-500 rounded-full">NYSDOT</span>
                <span className="ml-4 text-sm">Highway Data Services Bureau</span>
                {/* Heroicon name: solid/chevron-right */}
                <svg className="ml-2 w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-white sm:mt-5 sm:leading-none lg:mt-6 lg:text-5xl xl:text-6xl">
                <span className="md:block">Traffic Data</span>
                <span className="text-blue-500 md:block">Services</span>
              </h1>
              <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Maintaining an up-to-date inventory of public roadways in New York State, including physical and administrative data about the roads.
              </p>
            </div>
          </div>
          <div className="mt-8 sm:px-16 sm:mt-8 lg:mt-0 lg:col-span-6 ">
            <div className='bg-gray-900 p-2 shadow-lg rounded-lg'>
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src="/images/traffic-data-map.png" alt='Traffic Map' />
                </div>
                <div className="flex-1 bg-gray-900 p-2 flex flex-col justify-between">
                  <div className="flex-1">
                    <Link to='/map' className="block mt-2">
                      <p className="text-xl font-semibold text-gray-100">
                        Traffic Data Mapping
                      </p>
                      
                    </Link>
                  </div>
                </div>
              </div>
            </div>
             <div className='bg-gray-900 p-2 mt-8 shadow-lg rounded-lg'>
              <div className="flex flex-col rounded-lg overflow-hidden">
                <div className="flex-1 bg-gray-900 p-4 pt-0 flex flex-col justify-between">
                  <div className="flex-1">
                    <Link to="/short" className="block mt-2">
                      <p className="text-xl font-semibold text-gray-100">
                        Traffic Statistics & Reporting
                      </p>
                      
                    </Link>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img className="h-48 w-full object-cover" src="/images/traffic-statistics.png" alt="Traffic Graphs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</div>

const AuthedLanding = withAuth(({ title, shadowed = true, user, children }) => {
  if(user && user.authLevel > 0) {
    return <Redirect to="/admin" />
  }
  return <Landing />
})

const config = {
  path: "/",
  exact: true,
  mainNav: false,
  component: AuthedLanding,
  layout: 'Simple',
  layoutSettings: {
    fixed: true,
    headerBar: false,
    logo: "AVAIL",
    navBar: 'side'
  }
}


export default config;

