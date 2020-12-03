import React from 'react';

const NoMatch = () =>
  <div className="flex-1 flex items-center justify-center flex-col">
    <div className="text-2xl font-bold">404</div>
    <div className="text-xl">Page not Found</div>
    <div className="text-xl">Oops, Something went missing...</div>
  </div>

const config = {
  mainNav: false,
  component: NoMatch,
  layoutSettings: {
    fixed: true,
    headerBar: true
  }
}

export default config;
