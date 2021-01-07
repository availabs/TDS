import React from 'react';

const Landing = () =>
  <div className="flex-1 flex items-center justify-center flex-col">
    <div className="text-2xl font-bold">Welcome</div>
    <div className="text-xl">Please add new pages!</div>
    <div className="flex items-center justify-center">
      <img src="images/sadpanda.jpg" alt=""/>
    </div>
  </div>

const config = {
  path: "/",
  exact: true,
  mainNav: false,
  component: Landing,
  layoutSettings: {
    fixed: true,
    headerBar: true,
    logo: "AVAIL",
    navBar: 'side'
  }
}

export default config;
