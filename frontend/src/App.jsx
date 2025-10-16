import { Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/register">Đăng ký</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<div style={{ padding: 20 }}>Trang chủ</div>} />
      </Routes>
    </div>
  );
}
