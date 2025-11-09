import React from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = ({ usuario, children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <div className="sticky top-0 h-screen z-30">
      <Sidebar />
    </div>
    <div className="flex-1 flex flex-col">
      <div className="sticky top-0 z-20 bg-white">
        <Header usuario={usuario} />
      </div>
      {children}
    </div>
  </div>
);

export default MainLayout;