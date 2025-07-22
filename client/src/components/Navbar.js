import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  function capitalizeFirstLetter(word) {
  if (typeof word !== 'string' || word.length === 0) {
    return word; // Return as is if not a string or empty
  }
  return word.charAt(0).toUpperCase() + word.slice(1);
}

  return (
    <div>
      <h4
        style={{
          textAlign: "center",
          margin: "10px",
          color: "grey",
          fontSize: "50px",
          fontWeight: "bold",
          textShadow: "2px 2px 4px grey",
        }}
      >
        Cab Booking App
      </h4>
      <nav
        style={{
          padding: "10px",
          background: "#222",
          color: "white",
          display: "flex",
          alignItems: "center",
          fontSize: "30px",
          justifyContent: "flex-start",
        }}
      >
        {!user && (
          <>
            <Link to="/" style={{ marginRight: "10px", color: "white" }}>
              Home
            </Link>
            <Link to="/login" style={{ marginRight: "10px", color: "white" }}>
              Login
            </Link>
            <Link to="/register" style={{ color: "white" }}>
              Register
            </Link>
          </>
        )}
        {user && (
          <>
            <span style={{ marginRight: "10px" }}>
              Welcome, {user?.data?.name} ({capitalizeFirstLetter(user?.data?.role)})
            </span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
