 "use client";

import Link from "next/link";
import { AppBar, Toolbar, Box, Button, Typography } from "@mui/material";
import Navbar from "./Navbar";

const Panel = () => {
  return (
    <Box>
      {/* Top AppBar */}
      <AppBar
        position="static"
        sx={{ backgroundColor: "#232f3e", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
      >
        <Toolbar
          sx={{
            minHeight: "50px !important", // 👈 height reduced
            height: "50px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Navbar />

          <Box sx={{ display: "flex", gap: "24px" }}>
            <Button
              color="inherit"
              component={Link}
              href="/"
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#37475a" },
              }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: "bold", letterSpacing: "1px" }}>
                Home
              </Typography>
            </Button>

            <Button
              color="inherit"
              component={Link}
              href="/product"
              sx={{
                textTransform: "none",
                "&:hover": { backgroundColor: "#37475a" },
              }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: "bold", letterSpacing: "1px" }}>
                Product
              </Typography>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Panel;
