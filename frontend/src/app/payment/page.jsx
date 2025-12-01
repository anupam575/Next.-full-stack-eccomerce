"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-toastify";
import API from "../../utils/axiosInstance";

// MUI
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";

// Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const cartItems = useSelector((state) => state.cart.items) || [];
  const shippingInfo = useSelector((state) => state.shipping.shippingInfo) || {};

  const [clientSecret, setClientSecret] = useState("");
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const getClientSecret = async () => {
      if (!cartItems.length) return;
      setLoading(true);
      try {
        const { data } = await API.post("/payment/process", {
          items: cartItems.map((item) => ({
            price: item.product?.price,
            quantity: item.quantity,
          })),
          shippingFee:
            cartItems.reduce((acc, item) => acc + item.product?.price * item.quantity, 0) > 500
              ? 0
              : 50,
        });

        setClientSecret(data.client_secret);
        setOrderSummary(data.orderSummary);
      } catch (error) {
        console.error("Error creating payment intent:", error.response?.data || error.message);
        setPaymentError("Failed to create payment intent.");
        toast.error("⚠️ Failed to create payment intent");
      } finally {
        setLoading(false);
      }
    };

    getClientSecret();
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaymentError("");
    setLoading(true);

    const card = elements.getElement(CardElement);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (result.error) {
        setPaymentError(result.error.message);
        toast.error(`❌ ${result.error.message}`);
      } else if (result.paymentIntent?.status === "succeeded") {
        const paymentInfo = {
          id: result.paymentIntent.id,
          status: result.paymentIntent.status,
        };

        const orderData = {
          shippingInfo,
          orderItems: cartItems.map((item) => ({
            name: item.product?.name,
            quantity: item.quantity,
            image: item.product?.images?.[0]?.url,
            price: item.product?.price,
            product: item.product?._id,
          })),
          paymentInfo,
          itemsPrice: orderSummary?.itemsPrice || 0,
          taxPrice: orderSummary?.taxPrice || 0,
          shippingPrice: orderSummary?.shippingFee || 0,
          totalPrice: orderSummary?.totalPrice || 0,
        };

        try {
          const { data } = await API.post("/order/new", orderData);
          setOrderId(data.order._id);
          setPaymentSucceeded(true);
          toast.success("✅ Payment successful and order placed!");
        } catch (error) {
          console.error("Error placing order:", error.response?.data);
          setPaymentError("Order placement failed.");
          toast.error("❌ Payment done, but order placement failed!");
        }
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Payment failed.");
      toast.error("❌ Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <Box className="flex flex-col items-center gap-4 p-6">
        <Typography variant="h5" className="font-semibold">
          ✅ Payment Successful!
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push(`/my-orders/${orderId}`)}
        >
          View Order Full Details
        </Button>
      </Box>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2">
          <CircularProgress size={20} />
          <Typography>Processing...</Typography>
        </div>
      )}

      <div className="w-full p-4 border rounded-lg">
        <CardElement options={{ hidePostalCode: true, style: { base: { fontSize: '16px' } } }} />
      </div>

      {paymentError && <Typography color="error">{paymentError}</Typography>}

      <div className="flex gap-4">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!stripe || loading || !clientSecret}
          className="flex-1 py-3"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <CircularProgress size={18} /> Processing...
            </div>
          ) : (
            "Pay Now"
          )}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.back()}
          className="py-3"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="flex justify-center mt-12 px-4">
        <Card className="w-full max-w-2xl shadow-2xl rounded-2xl">
          <CardContent className="p-6">
            <Typography variant="h5" className="font-bold mb-4">
              Payment
            </Typography>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <CheckoutForm />
              </div>

              <div className="col-span-1">
                {/* Order summary box (show minimal data if orderSummary not ready) */}
                <div className="border rounded-lg p-4">
                  <Typography variant="subtitle1" className="font-medium mb-2">
                    Order Summary
                  </Typography>

                  {/* Simple placeholder - you can expand this to show items/totals */}
                  <Typography className="text-sm text-gray-600">
                    If order summary doesn't appear, ensure cart has items and backend returned
                    orderSummary.
                  </Typography>

                  {/** If you want to show orderSummary details, you can map here. **/}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Elements>
  );
};

export default PaymentPage;
