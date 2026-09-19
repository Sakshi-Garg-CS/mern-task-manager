import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import { getProfileImageUrl } from "../../utils/imageUrl";

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
    } else {
      navigate(route);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  useEffect(() => {
    if (user) {
      setSideMenuData(
        user?.role === "admin" ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }
    return () => {};
  }, [user]);

  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] overflow-y-auto">
      {/* Profile */}
      <div className="flex flex-col items-center justify-center mb-7 pt-6 px-4">
        <div className="relative">
          {user?.profileImageUrl ? (
            <img
              src={getProfileImageUrl(user.profileImageUrl)}
              alt="Profile"
              className="w-20 h-20 bg-slate-200 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-slate-300 rounded-full flex items-center justify-center text-2xl font-semibold text-white">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Admin
          </div>
        )}

        <h5 className="text-gray-950 font-medium leading-6 mt-3 text-center">
          {user?.name || ""}
        </h5>
        <p className="text-[12px] text-gray-500 text-center break-all">
          {user?.email || ""}
        </p>
      </div>

      {/* Menu */}
      <div className="pb-6">
        {sideMenuData.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={`menu_${index}`}
              type="button"
              className={`w-full flex items-center gap-4 text-[15px] ${
                activeMenu === item.label
                  ? "text-primary bg-gradient-to-r from-purple-50/40 to-purple-100/50 border-r-[3px] border-primary"
                  : "text-gray-950 font-medium"
              } py-3 px-6 mb-3 cursor-pointer`}
              onClick={() => handleClick(item.path)}
            >
              <Icon className="text-xl" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SideMenu;
