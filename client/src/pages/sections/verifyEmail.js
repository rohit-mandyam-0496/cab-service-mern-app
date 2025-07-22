/* eslint-disable no-unused-vars */
import React, { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const handleChange = (e) => setOtp(e.target.value);
  const { user, login } = useContext(AuthContext);
  const userData = localStorage.getItem("user");
  const parsedData = JSON.parse(userData);
  const token = parsedData?.data?.jwToken;

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${user?.data?.role}/verifyEmail`;
      const res = await axios.put(
        endpoint,
        {
          otp: otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      login(res?.data);
      alert(res?.data?.message || "Verification successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div>
      <h1>Verify Email by entering the otp</h1>
      <form>
        <label>OTP : &nbsp;</label>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleChange}
        />
        <button
          type="submit"
          style={{
            alignSelf: "center",
            backgroundColor: "blue",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleVerify}
        >
          Verify
        </button>
        <br />
        <Link to="/">Profile Page</Link>
        <br />
      </form>
    </div>
  );
};

export default VerifyEmail;
