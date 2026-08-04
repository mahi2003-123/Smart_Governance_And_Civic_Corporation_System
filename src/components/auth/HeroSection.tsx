import { Box, Typography, Paper } from "@mui/material";

const HeroSection = () => {
  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        display: { xs: "none", md: "flex" },
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {/* Dark Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(248,245,242,0.45), rgba(248,245,242,0.45))",
        }}
      />

      {/* Information Card */}
      <Paper
        elevation={6}
        sx={{
          position: "relative",
          zIndex: 2,
          width: 420,
          p: 5,
          borderRadius: 4,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#5E4630",
            mb: 2,
            lineHeight: 1.15,
          }}
        >
          Building Smarter
          <br />
          Cities Together
        </Typography>

        <Typography
          sx={{
            color: "#5f5f5f",
            fontSize: "1rem",
            lineHeight: 1.8,
          }}
        >
          Digital governance platform connecting citizens and local authorities
          through transparency, collaboration and AI-powered civic services.
        </Typography>
      </Paper>
    </Box>
  );
};

export default HeroSection;