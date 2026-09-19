import React, { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getProfileImageUrl } from "../../utils/imageUrl";

const AddMembersModal = ({ isOpen, onClose, selectedMembers, onConfirm }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(selectedMembers.map((m) => String(m._id)));
      fetchUsers();
    }
  }, [isOpen, selectedMembers]);

  const mergeWithSelectedMembers = (fetchedUsers) => {
    const byId = new Map();
    (fetchedUsers || []).forEach((user) => byId.set(String(user._id), user));
    selectedMembers.forEach((member) => {
      const id = String(member._id);
      if (!byId.has(id)) byId.set(id, member);
    });
    return Array.from(byId.values());
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setUsers(mergeWithSelectedMembers(response.data || []));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers(mergeWithSelectedMembers([]));
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId) => {
    const id = String(userId);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    const members = selected
      .map((id) => {
        const fromList = users.find((u) => String(u._id) === id);
        if (fromList) return fromList;
        return selectedMembers.find((m) => String(m._id) === id);
      })
      .filter(Boolean);
    onConfirm(members);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-950">Add Members</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-6">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No team members found
            </p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user._id}>
                  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(String(user._id))}
                      onChange={() => toggleUser(user._id)}
                      className="w-4 h-4 accent-primary"
                    />
                    {user.profileImageUrl ? (
                      <img
                        src={getProfileImageUrl(user.profileImageUrl)}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-purple-500 text-white text-sm font-medium flex items-center justify-center">
                        {user.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-purple-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;
