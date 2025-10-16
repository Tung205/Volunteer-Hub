import { useState } from "react";
import { api } from "../api/api";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const { data } = await api.post("/register", form);
      setMsg(`✅ Đăng ký thành công cho: ${data.user.email}`);
      setForm({ email: "", password: "", name: "" });
    } catch (err) {
      const m = err?.response?.data?.error || "Lỗi hệ thống";
      setMsg(`❌ ${m === 'EMAIL_EXISTS' ? 'Email đã tồn tại' : m}`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Đăng ký</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label><br/>
          <input name="email" type="email" value={form.email} onChange={onChange} required style={{ width:"100%", padding:8 }}/>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Mật khẩu</label><br/>
          <input name="password" type="password" value={form.password} onChange={onChange} required minLength={6} style={{ width:"100%", padding:8 }}/>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Tên hiển thị (tuỳ chọn)</label><br/>
          <input name="name" value={form.name} onChange={onChange} style={{ width:"100%", padding:8 }}/>
        </div>

        <button disabled={loading} style={{ padding:"8px 16px" }}>
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
