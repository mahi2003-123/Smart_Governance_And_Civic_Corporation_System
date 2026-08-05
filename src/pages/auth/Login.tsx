import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
} from "@mui/material";

import {
  AccountBalance,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import heroImage from "../../assets/loginimg.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",

        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background Blur */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,

          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",

          background:
            "linear-gradient(rgba(248,245,242,0.35), rgba(248,245,242,0.35))",

          zIndex: 1,
        }}
      />

      {/* Login Card */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          zIndex: 2,

          width: 470,
          maxWidth: "90%",

          p: 5,

          borderRadius: "24px",

          background: "rgba(255,255,255,0.78)",

          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",

          border: "1px solid rgba(255,255,255,.35)",

          boxShadow:
            "0 30px 80px rgba(0,0,0,.20)",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <AccountBalance
            sx={{
              fontSize: 60,
              color: "#6F4E37",
            }}
          />

          <Typography
            variant="h3"
            fontWeight="700"
          >
            Welcome Back
          </Typography>

          <Typography color="text.secondary">
            Sign in to continue to SGCS
          </Typography>
                    <TextField
            fullWidth
            variant="outlined"
            label="Email Address"
            placeholder="Enter your email"
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <FormControlLabel
              control={<Checkbox />}
              label="Remember Me"
            />

            <Link
              href="#"
              underline="hover"
              sx={{
                color: "#6F4E37",
                fontWeight: 600,
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              height: 55,
              borderRadius: 3,
              fontSize: 17,
              fontWeight: 700,
              textTransform: "none",
              background: "#6F4E37",
              boxShadow:
                "0 10px 30px rgba(111,78,55,0.35)",
              "&:hover": {
                background: "#5B3F2E",
              },
            }}
          >
            Login
          </Button>

          <Divider sx={{ width: "100%", my: 2 }}>
            OR
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              height: 50,
              borderRadius: 3,
              textTransform: "none",
              mb: 2,
            }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              height: 50,
              borderRadius: 3,
              textTransform: "none",
            }}
          >
            Continue with Microsoft
          </Button>
                    <Typography
            sx={{
              mt: 3,
              color: "text.secondary",
              fontSize: "15px",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/register"
              underline="hover"
              sx={{
                color: "#6F4E37",
                fontWeight: 700,
              }}
            >
              Register
            </Link>
          </Typography>

        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;