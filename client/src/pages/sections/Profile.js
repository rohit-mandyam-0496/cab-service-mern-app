/* eslint-disable react/style-prop-object */
/* eslint-disable no-unused-vars */
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user.data.name,
    email: user.data.email,
    phone: user.data.phone,
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    setForm({
      name: user.data.name,
      email: user.data.email,
      phone: user.data.phone,
    });
  }, [user]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      if (!validateEmail(value) && value) {
        setEmailError("Please enter a valid email address");
      } else {
        setEmailError("");
      }
    }
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async () => {
    if (emailError) return;
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = user.data.jwToken;
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${user.data.role}/updateDetails`
      const res = await axios.put(endpoint, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update user context with new data
      const updatedUser = {
        ...user,
        data: {
          ...user.data,
          ...form
        },
      };
      login(updatedUser);
      setMessage({
        text: "Profile updated successfully!",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const userData = localStorage.getItem("user");
      const token = JSON.parse(userData).data.jwToken;

      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${user.data.role}/sendOTP`;
      const res = await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message);
      navigate("/verifyEmail");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send verification email");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h3 className="mb-0">My Profile</h3>
        </div>

        <div className="card-body">
          {message.text && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          <div className="mb-4">
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ width: "30%" }}>Name</th>
                  <td>{user.data.name}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{user.data.email}</td>
                </tr>
                <tr>
                  <th>Email Verified</th>
                  <td>
                    {user.data.verifiedEmail ? (
                      <span className="badge bg-success">Verified</span>
                    ) : (
                      <>
                        <span className="badge bg-warning text-dark">
                          Not Verified
                        </span>
                        <button
                          onClick={handleSendOTP}
                          className="btn btn-sm btn-outline-primary ms-2"
                        >
                          Verify Now
                        </button>
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <th>Phone</th>
                  <td>{user.data.phone}</td>
                </tr>
                <tr>
                  <th>Online</th>
                  <td>{user.data.loggedOut ? "No" : "Yes"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {user.data.role === "admin" && (
            <div className="mb-4">
              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <th>Role</th>
                    <td>{user.data.role}</td>
                  </tr>
                  <tr>
                    <th>Login Count</th>
                    <td>{user.data.loginCount}</td>
                  </tr>
                  <tr>
                    <th>Logout Count</th>
                    <td>{user.data.logoutCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label" style={{ color: "white" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "white" }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`form-control ${emailError ? "is-invalid" : ""}`}
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" style={{ color: "white" }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="d-flex justify-content-between">
            <button
              onClick={handleUpdate}
              className="btn btn-primary"
              disabled={loading || emailError}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete your account?"
                  )
                ) {
                  logout();
                  navigate("/");
                }
              }}
              className="btn btn-outline-danger"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
