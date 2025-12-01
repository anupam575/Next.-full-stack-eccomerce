"use client";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearError,
} from "../../redux/slices/cartSlice";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Button,
  Grid,
  Snackbar,
  Alert,
  Box,
  Divider,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";

const Cart = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items: cartItems, status, error } = useSelector(
    (state) => state.cart
  );

  // Fetch cart
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Auto clear error
  useEffect(() => {
    if (status === "failed") {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [status, dispatch]);

  // Total price
  const totalPrice = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;

    return cartItems
      .reduce(
        (total, item) =>
          total +
          (Number(item?.product?.price) || 0) *
            (Number(item?.quantity) || 0),
        0
      )
      .toFixed(2);
  }, [cartItems]);

  const handleBuyNow = () => cartItems.length && router.push("/shipping");

  const handleIncrease = (id, quantity) =>
    dispatch(updateCartItem({ cartItemId: id, quantity: quantity + 1 }));

  const handleDecrease = (id, quantity) => {
    const newQty = quantity - 1;
    newQty <= 0
      ? dispatch(removeCartItem(id))
      : dispatch(updateCartItem({ cartItemId: id, quantity: newQty }));
  };

  const handleRemove = (id) => dispatch(removeCartItem(id));

  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || error?.error || "Something went wrong";

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50">
      <h2 className="text-3xl font-semibold mb-6">Your Cart</h2>

      <Snackbar open={status === "failed"} autoHideDuration={4000}>
        <Alert severity="error">{errorMessage}</Alert>
      </Snackbar>

      {!cartItems || cartItems.length === 0 ? (
        <div className="flex flex-col items-center mt-20">
          <p className="text-xl text-gray-600 mb-4">Your cart is empty!</p>
          <Button
            variant="contained"
            onClick={() => router.push("/")}
            className="!bg-blue-600"
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => {
              const product = item.product || {};
              const imageUrl = product.images?.[0]?.url || "/placeholder.png";
              const productName = product.name || "Unknown Product";
              const productPrice = Number(product.price) || 0;
              const quantity = Number(item.quantity) || 0;

              return (
                <Card
                  key={item._id}
                  className="mb-6 shadow-md border border-gray-200 rounded-xl"
                >
                  {/* 🔥 FIXED — IMAGE NEVER CUTS, NEVER SHRINKS */}
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt={productName}
                    className="w-full bg-white p-3 object-contain"
                    style={{
                      height: "200px", // ⭐ isse card ki height change kar sakte ho
                      objectFit: "contain",
                    }}
                  />

                  <CardContent>
                    <Typography variant="h6" className="font-semibold">
                      {productName}
                    </Typography>

                    <Typography className="text-gray-600">
                      ₹{productPrice.toFixed(2)}
                    </Typography>

                    <Box className="flex items-center gap-3 mt-3">
                      <IconButton
                        onClick={() => handleDecrease(item._id, quantity)}
                      >
                        <Remove />
                      </IconButton>

                      <Typography>{quantity}</Typography>

                      <IconButton
                        onClick={() => handleIncrease(item._id, quantity)}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Typography className="mt-2 font-medium">
                      Total: ₹{(productPrice * quantity).toFixed(2)}
                    </Typography>

                    <IconButton
                      color="error"
                      className="mt-2"
                      onClick={() => handleRemove(item._id)}
                    >
                      <Delete />
                    </IconButton>
                  </CardContent>
                </Card>
              );
            })}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className="shadow-lg border border-gray-200 p-4 rounded-xl">
              <Typography variant="h6">Order Summary</Typography>
              <Divider className="my-3" />

              <Typography className="text-xl font-semibold">
                Total Price: ₹{totalPrice}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                className="!mt-4 !bg-green-600 !py-2 !text-lg"
                onClick={handleBuyNow}
              >
                Proceed to Shipping
              </Button>
            </Card>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Cart;
