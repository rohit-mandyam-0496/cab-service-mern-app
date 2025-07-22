import React, { useState } from "react";
import AllSessions from "../sections/AllSessions";
import SelfSessions from "../sections/SelfSessions";
import Profile from "../sections/Profile";
import UserList from "../sections/UsersList";
import DriverList from "../sections/DriversList";
import Bookings from "../sections/AllBookings";
import Areas from "../sections/Areas";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("profile")}>My Profile</button>
        <button onClick={() => setActiveTab("sessions")}>All Sessions</button>
        <button onClick={() => setActiveTab("self")}>My Sessions</button>
        <button onClick={() => setActiveTab("usersList")}>Customers</button>
        <button onClick={() => setActiveTab("driversList")}>Drivers</button>
        <button onClick={() => setActiveTab("bookings")}>Bookings</button>
        <button onClick={() => setActiveTab("areas")}>All Areas</button>
      </div>
      {activeTab === "profile" && <Profile />}
      {activeTab === "sessions" && <AllSessions />}
      {activeTab === "self" && <SelfSessions />}
      {activeTab === "usersList" && <UserList />}
      {activeTab === "driversList" && <DriverList />}
      {activeTab === "bookings" && <Bookings />}
      {activeTab === "areas" && <Areas />}
    </div>
  );
};

export default AdminDashboard;
