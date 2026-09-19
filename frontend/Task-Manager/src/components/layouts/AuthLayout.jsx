import React from "react";
import UI_IMG from "../../assets/images/auth-img.png";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex">
      <div className="w-screen h-screen md:w-[60vw] px-12 pt-8 pb-12 flex flex-col">
        <h2 className="text-lg  text-bold font-medium text-black mb-6">Task Manager</h2>
        <div className="flex-1 w-full">{children}</div>
      </div>

      <div className="hidden md:flex w-[40vw] h-screen items-center justify-center bg-blue-50 bg-[url('/bg-img.png')] bg-cover bg-no-repeat bg-center overflow-hidden p-2">
        <img
          src={UI_IMG}
          alt="Task manager illustration"
          className="w-64 lg:w-[90%] -translate-y-10"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
