import {
  Box,
  Paper,
  Typography,
} from "@mui/material";

const Login = () => {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F8F5F2",
      }}
    >
      {/* Left Hero Section */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          background:
            "linear-gradient(135deg, #F8F5F2 0%, #E8DDD3 100%)",
          p: 6,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 4,
            maxWidth: 500,
          }}
        >
          <Typography
            variant="h3"
            fontWeight="bold"
            color="#6F4E37"
            gutterBottom
          >
            Building Smarter
            <br />
            Cities Together
          </Typography>

          <Typography color="text.secondary">
            Digital governance platform connecting citizens and
            local authorities through transparency and
            AI-powered civic services.
          </Typography>
        </Paper>
      </Box>

      {/* Right Login Section */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 5,
        }}
      >
        <Paper
          elevation={5}
          sx={{
            width: 430,
            p: 5,
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Welcome Back
          </Typography>

          <Typography color="text.secondary">
            Sign in to continue
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;