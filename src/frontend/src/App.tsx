import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect "/" → "/dashboard" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard page */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
