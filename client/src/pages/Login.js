/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "customer",
  });
  const [forgotPassword, setForgotPassword] = useState({
    email: "",
    newPassword: "",
    role: "customer",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordChange = (e) => {
    setForgotPassword({ ...forgotPassword, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${form.role}/login`;
      const res = await axios.post(endpoint, form);
      login(res.data);
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/${form.role}/passwordReset`,
        {
          email: forgotPassword.email,
          newPassword: forgotPassword.newPassword,
          role: forgotPassword.role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage(res.data.message);
      setForgotPassword({ email: "", newPassword: "", role: "customer" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending reset link");
    }
  };

  return (
    <div
      className="container mt-5"
      style={{
        margin: "auto",
        display: "flex",
        width: "400px",
        height: "700px",
        paddingTop: "10px",
        paddingBottom: "10px",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#282c34",
        borderRadius: "8px",
        padding: "20px",
        color: "white",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h1 className="mb-4">Login</h1>
        <div className="mb-3">
          <p>
            Don't have an account?&nbsp;<a href="/register">Register</a>
          </p>
        </div>
        <div className="mb-3">
          <label>User Email ID:&nbsp;</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>User Password:&nbsp;</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>User Role:&nbsp;</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit">
          Login
        </button>
        <div className="mt-3">
          <a href="#" onClick={() => setShowForgotPassword(true)}>
            Forgot Password?
          </a>
        </div>
      </form>

      {showForgotPassword && (
        <div
          className="forgot-password-modal"
          style={{
            position: "flex",
            // top: 0,
            // left: 0,
            // right: 0,
            // bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "fixed",
            justifyContent: "center",
            alignItems: "center",
            // zIndex: 1000,
          }}
        >
          {/* <div
            style={{
              backgroundColor: "#282c34",
              //padding: "10px",
              //borderRadius: "8px",
              width: "400px",
              color: "white",
            }}
          > */}
          <h1>Reset Password</h1>
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label>Email:&nbsp;</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={forgotPassword.email}
                onChange={handleForgotPasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>New Password:&nbsp;</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter your new password"
                value={forgotPassword.newPassword}
                onChange={handleForgotPasswordChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>User Role:&nbsp;</label>
              <select
                name="role"
                value={forgotPassword.role}
                onChange={handleForgotPasswordChange}
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <button className="btn btn-primary" type="submit">
                Update Password
              </button>
            </div>
          </form>
          {message && <p style={{ color: "blue" }}>{message}</p>}
          <button
            className="btn btn-secondary"
            onClick={() => setShowForgotPassword(false)}
          >
            Close
          </button>
        </div>
        // </div>
      )}
    </div>
  );
};

export default Login;
