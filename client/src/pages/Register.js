/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contactNumber: "",
    role: "customer",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${form.role}/register`;
      const res = await axios.post(endpoint, form);
      // login(res.data);
      setSuccessMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div
      className="container mt-5"
      style={{
        margin: "auto",
        display: "flex",
        width: "400px",
        height: "600px",
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
        <h3 className="mb-4" style={{ textAlign: "center" }}>Register</h3>
        <div className="mb-3">
          <p>
            Already have an account?&nbsp;<a href="/login">Login</a>
          </p>
        </div>
        {errorMessage && (
          <div 
            style={{
              color: "red",
              marginBottom: "15px",
              textAlign: "center"
            }}
          >
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div 
            style={{
              color: "green",
              marginBottom: "15px",
              textAlign: "center"
            }}
          >
            {successMessage}
          </div>
        )}
        <div className="mb-3">
          <label>Full Name:</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="mb-3">
          <label>Email ID:</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="mb-3">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="contactNumber"
            className="form-control"
            placeholder="Enter your phone number"
            value={form.contactNumber}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="mb-3">
          <label>User Role:</label>
          <select
            name="role"
            className="form-select"
            value={form.role}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "grey",
            }}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;