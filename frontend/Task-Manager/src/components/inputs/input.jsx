import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="input-box">
        <input
          type={
            type === "password"
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          placeholder={placeholder}
          className="w-full bg-transparent outline-none"
          value={value}
          onChange={onChange}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={toggleShowPassword}
            className="border-0 bg-transparent p-0 cursor-pointer"
          >
            {showPassword ? (
              <FaRegEye size={22} className="text-primary" />
            ) : (
              <FaRegEyeSlash size={22} className="text-slate-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
