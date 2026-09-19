import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          <div className="hidden sm:block shrink-0">
            <SideMenu activeMenu={activeMenu} />
          </div>

          <div className="grow mx-5 pt-3 pb-6 bg-white min-h-[calc(100vh-61px)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
