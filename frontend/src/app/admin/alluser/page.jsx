"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";

import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";
import SelectBasic from "../../components/UI/Select";

// MUI Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AdminUsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleUser = async (id) => {
    try {
      const { data } = await API.get(`/admin/user/${id}`);
      setSelectedUser(data.user);
    } catch (err) {
      toast.error("Failed to fetch user details");
    }
  };

  const updateUserRole = async (id, role) => {
    const original = [...users];
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, role } : u))
    );

    try {
      await API.put(`/admin/user/${id}`, { role });
      toast.success("Role updated successfully");
    } catch (err) {
      setUsers(original);
      toast.error("Failed to update role");
    }
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    const original = [...users];
    setUsers((prev) => prev.filter((u) => u._id !== deleteUserId));

    try {
      await API.delete(`/admin/user/${deleteUserId}`);
      toast.success("User deleted successfully");
    } catch (err) {
      setUsers(original);
      toast.error("Failed to delete user");
    }

    setDeleteUserId(null);
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // DESKTOP TABLE ROWS
  const desktopRows = useMemo(
    () =>
      users.map((u) => (
        <tr
          key={u._id}
          className="border-t border-gray-300 hover:bg-gray-50 transition"
        >
          <td className="px-4 py-3 border-r border-gray-300">{u._id}</td>
          <td className="px-4 py-3 border-r border-gray-300">{u.name}</td>
          <td className="px-4 py-3 border-r border-gray-300">{u.email}</td>

          <td className="px-4 py-3 border-r border-gray-300">
            <SelectBasic
              value={u.role}
              onChange={(e, newVal) => updateUserRole(u._id, newVal)}
              options={["user", "admin"]}
            />
          </td>

          <td className="px-4 py-3 border-r border-gray-300 text-center">
            <AppButton
              variant="outlined"
              className="rounded-full p-2 border border-gray-400 hover:bg-gray-100"
              onClick={() => fetchSingleUser(u._id)}
            >
              <VisibilityIcon fontSize="small" />
            </AppButton>
          </td>

          <td className="px-4 py-3 text-center">
            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-500 hover:bg-red-50"
              onClick={() => setDeleteUserId(u._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </td>
        </tr>
      )),
    [users]
  );

  // MOBILE CARD VIEW
  const mobileCards = useMemo(
    () =>
      users.map((u) => (
        <div
          className="user-card border border-gray-300 p-4 rounded-xl shadow-sm bg-white"
          key={u._id}
        >
          <p><strong>ID:</strong> {u._id}</p>
          <p><strong>Name:</strong> {u.name}</p>
          <p><strong>Email:</strong> {u.email}</p>

          <SelectBasic
            value={u.role}
            onChange={(e, v) => updateUserRole(u._id, v)}
            options={["user", "admin"]}
          />

          <div className="flex gap-3 mt-3">
            <AppButton
              variant="outlined"
              className="rounded-full p-2 border border-gray-400 hover:bg-gray-100"
              onClick={() => fetchSingleUser(u._id)}
            >
              <VisibilityIcon fontSize="small" />
            </AppButton>

            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-500 hover:bg-red-50"
              onClick={() => setDeleteUserId(u._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </div>
        </div>
      )),
    [users]
  );

  return (
    <div className="admin-users-container p-4 mt-10">
      <div className="top-bar flex justify-between items-center mb-10">
        <Link href="/admin/dashboard" className="text-blue-600 flex items-center gap-2">
          <ArrowBackIcon fontSize="small" /> Back to Dashboard
        </Link>

        <h2 className="text-xl font-semibold flex items-center gap-2">
          <PeopleAltIcon fontSize="medium" />
          Admin Panel - Manage Users
        </h2>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-gray-600">
          <AccessTimeIcon fontSize="small" /> Loading users...
        </p>
      ) : users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="desktop-users overflow-x-auto mt-5">
            <table className="min-w-full border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold border-r border-gray-300">ID</th>
                  <th className="px-4 py-3 text-left font-semibold border-r border-gray-300">Name</th>
                  <th className="px-4 py-3 text-left font-semibold border-r border-gray-300">Email</th>
                  <th className="px-4 py-3 text-left font-semibold border-r border-gray-300">Role</th>
                  <th className="px-4 py-3 text-center font-semibold border-r border-gray-300">View</th>
                  <th className="px-4 py-3 text-center font-semibold">Delete</th>
                </tr>
              </thead>

              <tbody>{desktopRows}</tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-users grid grid-cols-1 gap-4 mt-5 md:hidden">
            {mobileCards}
          </div>
        </>
      )}

      {selectedUser && (
        <div className="single-user-card border border-gray-300 p-4 rounded-xl shadow mt-5 bg-white">
          <h3 className="text-lg font-semibold mb-2">Single User Details:</h3>
          <p><strong>ID:</strong> {selectedUser._id}</p>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AlertDialogModal
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsersPanel;
