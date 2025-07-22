import React, { useState } from "react";
import Profile from "../sections/Profile";
import Bookings from "../sections/DriverBookings";

const DriverDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  return (
    <div style={{ padding: 20 }}>
      <h2>Driver Dashboard</h2>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("profile")}>My Profile</button>
        <button onClick={() => setActiveTab("bookings")}>Assigned Bookings</button>
      </div>
      {activeTab === "profile" && <Profile />}
      {activeTab === "bookings" && <Bookings />}
    </div>
  );
};
export default DriverDashboard;
