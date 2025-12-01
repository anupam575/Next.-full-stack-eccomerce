"use client";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { saveShippingInfo } from "../../redux/slices/shippingSlice";

// ⭐ MUI Imports
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
} from "@mui/material";

const initialShipping = {
  address: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  phoneNo: "",
};

const formFields = [
  { name: "address", label: "Address", type: "text" },
  { name: "city", label: "City", type: "text" },
  { name: "state", label: "State", type: "text" },
  { name: "country", label: "Country", type: "text" },
  { name: "pinCode", label: "Pin Code", type: "text" },
  { name: "phoneNo", label: "Phone Number (10 digits)", type: "tel", maxLength: 10 },
];

const ShippingPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const savedShipping = useSelector((state) => state.shipping.shippingInfo);

  const [shippingInfo, setShippingInfo] = useState(savedShipping || initialShipping);

  const isPhoneValid = (phone) => /^\d{10}$/.test(phone);
  const isFormValid = () => {
    const allFilled = Object.values(shippingInfo).every((val) => val.trim() !== "");
    return allFilled && isPhoneValid(shippingInfo.phoneNo);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNo" && !/^\d*$/.test(value)) return;

    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceed = (type) => {
    if (!isFormValid()) {
      toast.error("❌ Please fill all fields correctly.");
      return;
    }

    dispatch(saveShippingInfo(shippingInfo));

    router.push(type === "payment" ? "/payment" : "/cod");
  };

  return (
    <div className="flex justify-center mt-10 px-4">
      <Card className="w-full max-w-xl shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <Typography variant="h5" className="font-bold mb-6 flex items-center gap-2">
             Shipping Details
          </Typography>

          <Grid container spacing={2}>
            {formFields.map((field) => (
              <Grid item xs={12} key={field.name}>
                <TextField
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={shippingInfo[field.name]}
                  onChange={handleChange}
                  fullWidth
                  required
                  inputProps={{
                    maxLength: field.maxLength || undefined,
                  }}
                  error={
                    field.name === "phoneNo" &&
                    shippingInfo.phoneNo !== "" &&
                    !isPhoneValid(shippingInfo.phoneNo)
                  }
                  helperText={
                    field.name === "phoneNo" &&
                    shippingInfo.phoneNo !== "" &&
                    !isPhoneValid(shippingInfo.phoneNo)
                      ? "Phone number must be 10 digits"
                      : ""
                  }
                />
              </Grid>
            ))}
          </Grid>

          {/* Buttons */}
          <div className="flex gap-4 mt-6">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              className="py-3 rounded-lg"
              disabled={cartItems.length === 0 || !isFormValid()}
              onClick={() => handleProceed("payment")}
            >
              Proceed to Payment
            </Button>

            <Button
              variant="contained"
              color="success"
              fullWidth
              className="py-3 rounded-lg"
              disabled={cartItems.length === 0 || !isFormValid()}
              onClick={() => handleProceed("cod")}
            >
              Cash on Delivery
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingPage;
