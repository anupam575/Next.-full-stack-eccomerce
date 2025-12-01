"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import API from "../../utils/axiosInstance";
import UIPagination from "../components/UI/UIPagination";
import SliderSizes from "../components/UI/Slider";
import { addCartItem } from "../../redux/slices/cartSlice";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  Rating,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const Product = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [debouncedPriceRange] = useDebounce(priceRange, 300);

  const keyword = useSelector((state) => state?.search?.keyword) || "";
  const [debouncedKeyword] = useDebounce(keyword, 300);

  useEffect(() => setPage(1), [debouncedKeyword, debouncedPriceRange]);

  // ⭐ Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addCartItem({ productId, quantity: 1 })).unwrap();
      toast.success("🛒 Product added to cart!");
    } catch (err) {
      toast.error(err.message || "Failed to add product to cart");
    }
  };

  // ⭐ Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      let query = `/products?page=${page}`;
      if (debouncedKeyword.trim()) query += `&keyword=${debouncedKeyword.trim()}`;
      query += `&price[gte]=${debouncedPriceRange[0]}&price[lte]=${debouncedPriceRange[1]}`;

      const { data } = await API.get(query);

      setProducts(data.products || []);
      const total = data.filteredProductsCount || 0;
      const perPage = data.resultPerPage || 1;

      setTotalPages(Math.ceil(total / perPage));
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load products";
      setError(message);
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, debouncedPriceRange, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading)
    return (
      <Typography variant="h6" textAlign="center" mt={10}>
        Loading…
      </Typography>
    );

  return (
    <Box className="p-6">
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={6}>
        <Typography variant="h4" fontWeight="bold" className="flex items-center gap-2">
          All Products <FilterAltIcon className="text-gray-600 mt-20" />
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} gap={6}>
        {/* Filters */}
        <Box className="md:w-1/4 bg-white p-4 rounded-lg shadow">
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Filters
          </Typography>

          <Typography variant="subtitle1" mb={2}>
            Price
          </Typography>

          <SliderSizes value={priceRange} onChange={(e, val) => setPriceRange(val)} />

          <Stack direction="row" justifyContent="space-between" mt={2}>
            <Typography>₹{priceRange[0]}</Typography>
            <Typography>₹{priceRange[1]}</Typography>
          </Stack>
        </Box>

        {/* Products */}
        <Box className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 && (
            <Typography variant="body1" textAlign="center" w="full">
              No products found 😞
            </Typography>
          )}

          {products.map((p) => (
            <Card key={p._id} className="hover:shadow-lg transition duration-300">
              {/* Product Image */}
              <Box
                className="w-full h-110 overflow-hidden cursor-pointer relative"
                onClick={() => router.push(`/product/${encodeURIComponent(p._id)}`)}
              >
                <img
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.name}
                  className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
                />

                {/* Out of Stock Badge */}
                {!p.inStock && (
                  <Chip
                    label="Out of Stock"
                    color="error"
                    className="absolute top-2 right-2"
                    size="small"
                  />
                )}

                {/* Low Stock Badge */}
                {p.lowStock && p.inStock && (
                  <Chip
                    label="Few left!"
                    color="warning"
                    className="absolute top-2 right-2"
                    size="small"
                  />
                )}
              </Box>

              <CardContent>
                {/* Name */}
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {p.name}
                </Typography>

                {/* Price */}
                <Typography variant="h6" color="primary">
                  ₹{p.price}
                </Typography>

                {/* ⭐ Rating */}
                <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                  <Rating
                    name={`rating-${p._id}`}
                    value={p.ratings || 0}
                    precision={0.5}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2">({p.numOfReviews || 0})</Typography>
                </Stack>

                {/* Add to Cart Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="small"
                  className="mt-3"
                  disabled={!p.inStock || !p.isAvailable}
                  onClick={() => handleAddToCart(p._id)}
                >
                  {!p.inStock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Stack>

      {/* Pagination */}
      <Stack mt={6} justifyContent="center" alignItems="center">
        <UIPagination totalPages={totalPages} page={page} onChange={(e, value) => setPage(value)} />
      </Stack>
    </Box>
  );
};

export default Product;
