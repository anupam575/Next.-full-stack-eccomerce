"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// MUI Components
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const OrderSuccessPage = () => {
  const router = useRouter();
  const { id } = useParams();

  // Redirect to home if no ID
  useEffect(() => {
    if (!id) {
      router.push("/");
    }
  }, [id, router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md w-full shadow-2xl rounded-2xl">
        <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
          <CheckCircleIcon className="text-green-600" sx={{ fontSize: 60 }} />

          <Typography variant="h5" className="font-semibold">
            Order Placed Successfully!
          </Typography>

          {id ? (
            <>
              <Typography variant="body1">
                Your order ID:
                <span className="font-bold text-gray-800 ml-1">{id}</span>
              </Typography>

              <Button
                variant="contained"
                color="primary"
                className="w-full rounded-xl py-2"
                onClick={() => router.push(`/my-orders/${id}`)}
              >
                View Order Details
              </Button>
            </>
          ) : (
            <Typography className="text-red-600">
              Order ID not found. Redirecting...
            </Typography>
          )}

          <Button
            variant="outlined"
            color="secondary"
            className="w-full rounded-xl py-2"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccessPage;
