"use client";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import API from "@/utils/axiosInstance";
import { toast } from "react-toastify";

// MUI Components
import { Card, CardContent, Typography, Button, CircularProgress, Box } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const CODPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cartItems = useSelector((state) => state.cart.items) || [];
  const shippingInfo = useSelector((state) => state.shipping.shippingInfo) || {};

  const handleCOD = async () => {
    if (!cartItems.length) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      const itemsPrice = cartItems.reduce((acc, item) => acc + item.product?.price * item.quantity, 0);
      const shippingPrice = itemsPrice > 500 ? 0 : 50;

      const orderData = {
        shippingInfo,
        orderItems: cartItems.map((item) => ({
          name: item.product?.name,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url,
          price: item.product?.price,
          product: item.product?._id,
        })),
        paymentInfo: {
          id: `COD_${Date.now()}`,
          status: "Cash on Delivery",
        },
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice: itemsPrice + shippingPrice,
      };

      const { data } = await API.post("/order/new", orderData);

      toast.success("✅ Order placed successfully!");
      router.push(`/cod/order-success/${data.order._id}`);
    } catch (error) {
      console.error("COD Error:", error);
      toast.error(error.response?.data?.message || "❌ Failed to place order!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md w-full shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
          <LocalShippingIcon className="text-blue-600" sx={{ fontSize: 60 }} />

          <Typography variant="h5" className="font-semibold">
            Cash on Delivery
          </Typography>

          <Typography variant="body1" className="text-gray-600">
            Review your details and place your order.
          </Typography>

          <Box className="w-full">
            <Button
              variant="contained"
              color="primary"
              onClick={handleCOD}
              disabled={loading}
              className="w-full rounded-xl py-3"
            >
              {loading ? (
                <Box className="flex items-center justify-center gap-2">
                  <CircularProgress size={18} color="inherit" />
                  Placing Order...
                </Box>
              ) : (
                "Place Order (COD)"
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default CODPage;
