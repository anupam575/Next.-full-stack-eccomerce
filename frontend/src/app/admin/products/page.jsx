"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import API from "../../../utils/axiosInstance";

import { AppButton } from "../../components/UI/Button";
import { AlertDialogModal } from "../../components/UI/AlertDialogModal";

// MUI Icons
import InventoryIcon from "@mui/icons-material/Inventory";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const AdminProductsPanel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [error, setError] = useState("");

  // Fetch All Products
  const fetchAdminProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/admin/products");
      setProducts(data.products || []);
      setError("");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to load products";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  // Delete Product
  const confirmDelete = async () => {
    if (!deleteProductId) return;

    const original = [...products];
    setProducts((prev) => prev.filter((p) => p._id !== deleteProductId));

    try {
      await API.delete(`/admin/product/${deleteProductId}`);
      toast.success("Product deleted successfully");
    } catch (err) {
      setProducts(original);
      toast.error("Failed to delete product");
    }

    setDeleteProductId(null);
  };

  // DESKTOP TABLE ROWS
  const desktopRows = useMemo(
    () =>
      products.map((p) => (
        <tr
          key={p._id}
          className="border-t border-gray-300 hover:bg-gray-50 transition"
        >
          <td className="px-4 py-3 border-r border-gray-300">{p._id}</td>
          <td className="px-4 py-3 border-r border-gray-300">{p.name}</td>
          <td className="px-4 py-3 border-r border-gray-300">₹{p.price}</td>
          <td className="px-4 py-3 border-r border-gray-300">{p.stock}</td>

          <td className="px-4 py-3 text-center border-r border-gray-300">
            <Link
              href={`/admin/products/${p._id}/update`}
              className="rounded-full p-2 border border-gray-400 hover:bg-gray-100 inline-flex"
            >
              <EditIcon fontSize="small" />
            </Link>
          </td>

          <td className="px-4 py-3 text-center">
            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-500 hover:bg-red-50"
              onClick={() => setDeleteProductId(p._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </td>
        </tr>
      )),
    [products]
  );

  // MOBILE CARDS
  const mobileCards = useMemo(
    () =>
      products.map((p) => (
        <div
          className="product-card border border-gray-300 p-4 rounded-xl shadow-sm bg-white"
          key={p._id}
        >
          <h3 className="text-lg font-semibold">{p.name}</h3>

          <p><strong>ID:</strong> {p._id}</p>
          <p><strong>Price:</strong> ₹{p.price}</p>
          <p><strong>Stock:</strong> {p.stock}</p>

          <div className="flex gap-3 mt-3">
            <Link
              href={`/admin/products/${p._id}/update`}
              className="rounded-full p-2 border border-gray-400 hover:bg-gray-100 inline-flex"
            >
              <EditIcon fontSize="small" />
            </Link>

            <AppButton
              color="error"
              variant="outlined"
              className="rounded-full p-2 border border-red-400 text-red-500 hover:bg-red-50"
              onClick={() => setDeleteProductId(p._id)}
            >
              <DeleteIcon fontSize="small" />
            </AppButton>
          </div>
        </div>
      )),
    [products]
  );

  return (
    <div className="admin-products-container p-4 mt-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <InventoryIcon fontSize="medium" /> Admin Products Panel
        </h2>
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-gray-600">
          <AccessTimeIcon fontSize="small" /> Loading products...
        </p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="desktop-users overflow-x-auto mt-10">
            <table className="min-w-full border border-gray-300 rounded-xl overflow-hidden shadow-sm">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 border-r font-semibold">ID</th>
                  <th className="px-4 py-3 border-r font-semibold">Name</th>
                  <th className="px-4 py-3 border-r font-semibold">Price</th>
                  <th className="px-4 py-3 border-r font-semibold">Stock</th>
                  <th className="px-4 py-3 border-r text-center font-semibold">Edit</th>
                  <th className="px-4 py-3 text-center font-semibold">Delete</th>
                </tr>
              </thead>

              <tbody>{desktopRows}</tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mobile-users grid grid-cols-1 gap-4 mt-6 md:hidden">
            {mobileCards}
          </div>
        </>
      )}

      {/* DELETE CONFIRMATION (MUI ALERT DIALOG) */}
      <AlertDialogModal
        open={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminProductsPanel;
