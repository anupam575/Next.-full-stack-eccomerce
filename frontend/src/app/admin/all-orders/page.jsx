"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";
import OrderStatusUpdater from "../../components/Section/OrderStatusUpdater";
import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

// ✅ New Pagination Component
import UIPagination from "../../components/UI/UIPagination";

export default function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();

  // Fetch Orders
  const fetchOrders = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/admin/orders?page=${pageNumber}&limit=10`);
      setOrders(data.orders);
      setTotalAmount(data.totalAmount);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Delete Confirm (Updated for backend)
  const confirmDelete = async () => {
    if (!deleteOrderId) return;

    const originalOrders = [...orders];
    setOrders((prev) => prev.filter((o) => o._id !== deleteOrderId));
    toast.info("Deleting...");

    try {
      // ✅ Backend expects /admin/orders with body { orderIds: [id] }
      await API.delete("/admin/orders", { data: { orderIds: [deleteOrderId] } });
      toast.success("Order deleted successfully");
      fetchOrders(page);
    } catch (err) {
      setOrders(originalOrders);
      toast.error("Failed to delete order");
    }

    setDeleteOrderId(null);
  };

  useEffect(() => {
    fetchOrders(page);
  }, []);

  const desktopRows = useMemo(
    () =>
      orders.map((order) => (
        <tr key={order._id} className="hover:bg-gray-50">
          <td className="p-3 border border-gray-300">{order._id}</td>
          <td className="p-3 border border-gray-300">{order.user?.name}</td>
          <td className="p-3 border border-gray-300">{order.user?.email}</td>
          <td className="p-3 border border-gray-300 font-semibold">
            ₹{order.totalPrice}
          </td>
          <td className="p-3 border border-gray-300">
            <OrderStatusUpdater
              orderId={order._id}
              currentStatus={order.orderStatus}
              onStatusChange={() => fetchOrders(page)}
            />
          </td>
          <td className="p-3 border border-gray-300">
            <AppButton
              variant="contained"
              onClick={() => router.push(`/admin/all-orders/${order._id}`)}
            >
              View
            </AppButton>
          </td>
          <td className="p-3 border border-gray-300">
            <AppButton
              variant="outlined"
              color="error"
              onClick={() => setDeleteOrderId(order._id)}
            >
              <DeleteIcon fontSize="small" /> Delete
            </AppButton>
          </td>
        </tr>
      )),
    [orders, page]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto mt-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <InventoryIcon /> All Orders
      </h2>

      <p className="text-lg font-semibold mb-4">
        Total Revenue: ₹{totalAmount}
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg bg-white shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border border-gray-300 text-left">Order ID</th>
              <th className="p-3 border border-gray-300 text-left">User</th>
              <th className="p-3 border border-gray-300 text-left">Email</th>
              <th className="p-3 border border-gray-300 text-left">Total</th>
              <th className="p-3 border border-gray-300 text-left">Status</th>
              <th className="p-3 border border-gray-300 text-left">View</th>
              <th className="p-3 border border-gray-300 text-left">Delete</th>
            </tr>
          </thead>
          <tbody>{desktopRows}</tbody>
        </table>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center mt-6 flex items-center justify-center gap-2">
          <AccessTimeIcon fontSize="small" /> Loading orders...
        </p>
      )}

      {/* Error */}
      {error && <p className="text-center text-red-600 mt-6">{error}</p>}

      {/* Updated Pagination */}
      <div className="flex justify-center mt-6">
        <UIPagination
          totalPages={totalPages}
          page={page}
          onChange={(event, value) => {
            setPage(value);
            fetchOrders(value);
          }}
        />
      </div>

      {/* Alert Dialog */}
      <AlertDialogModal
        open={!!deleteOrderId}
        onClose={() => setDeleteOrderId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
