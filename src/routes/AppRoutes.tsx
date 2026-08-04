import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;