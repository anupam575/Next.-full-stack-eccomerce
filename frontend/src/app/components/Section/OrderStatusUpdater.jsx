"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import { AppButton } from "../../components/UI/Button";
import SelectBasic from "../UI/Select";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// ✅ status options can be string array or objects, compatible with SelectBasic
const statusOptions = ["Processing", "Shipped", "Soon", "Delivered", "Cancelled"];

const OrderStatusUpdater = ({ orderId, currentStatus, onStatusChange }) => {
  const [status, setStatus] = useState(currentStatus || ""); // initial fallback
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Ensure if currentStatus changes from parent, local state syncs
  useEffect(() => {
    setStatus(currentStatus || "");
  }, [currentStatus]);

  const handleUpdateClick = () => {
    if (!status || status === currentStatus) return;
    if (["Delivered", "Cancelled"].includes(currentStatus)) return;
    setShowModal(true);
  };

  const confirmUpdate = async () => {
    setLoading(true);
    try {
      const response = await API.put("/admin/orders", {
        orderIds: [orderId],
        status,
      });

      toast.success(`Order status updated to "${status}" successfully`);
      onStatusChange && onStatusChange();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  const isDisabled =
    loading ||
    status === currentStatus ||
    ["Delivered", "Cancelled"].includes(currentStatus);

  const disableDropdown = ["Delivered", "Cancelled"].includes(currentStatus);

  return (
    <div className="flex items-center gap-2">
      {/* ✅ SelectBasic now fully compatible with string or object options */}
      <SelectBasic
        value={status}
        onChange={(newValue) => {
          if (disableDropdown) return;
          setStatus(newValue);
        }}
        options={statusOptions}
        disabled={disableDropdown}
        className="min-w-[120px]"
      />

      <AppButton
        variant="contained"
        color="primary"
        onClick={handleUpdateClick}
        disabled={isDisabled}
      >
        {loading ? "Updating..." : "Update"}
      </AppButton>

      <AlertDialogModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmUpdate}
        message={`Are you sure you want to change status from "${currentStatus}" to "${status}"?`}
        confirmText="Update"
      />
    </div>
  );
};

export default OrderStatusUpdater;
