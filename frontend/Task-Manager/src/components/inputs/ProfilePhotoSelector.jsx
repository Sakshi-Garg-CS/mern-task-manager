import React, { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

const ProfilePhotoSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="w-full flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div className="w-24 h-24 flex items-center justify-center bg-purple-50 rounded-full relative border-2 border-purple-500">
          <LuUser className="text-4xl text-purple-500" />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-purple-500 text-white rounded-full absolute bottom-0 right-0 shadow-md cursor-pointer"
            onClick={onChooseFile}
          >
            <LuUpload size={16} />
          </button>
        </div>
      ) : (
        <div className="relative w-24 h-24 border-2 border-purple-500 rounded-full">
          <img
            src={previewUrl}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute bottom-0 right-0 shadow-md cursor-pointer"
            onClick={handleRemoveImage}
          >
            <LuTrash size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
