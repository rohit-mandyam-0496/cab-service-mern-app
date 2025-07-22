import React, { useState } from "react";
import Profile from "../sections/Profile";
import Areas from "../sections/Areas";
import BookingForm from "../sections/BookingForm";
import MyBookings from "../sections/UserBookings";

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  return (
    <div style={{ padding: 20 }}>
      <h2>Customer Dashboard</h2>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("profile")}>My Profile</button>
        <button onClick={() => setActiveTab("areas")}>Servicable Areas</button>
        <button onClick={() => setActiveTab("addBooking")}>Book a Cab</button>
        <button onClick={() => setActiveTab("myBookings")}>My Bookings</button>
      </div>
      {activeTab === "profile" && <Profile />}
      {activeTab === "areas" && <Areas />}
      {activeTab === "addBooking" && <BookingForm />}
      {activeTab === "myBookings" && <MyBookings />}
    </div>
  );
};
export default CustomerDashboard;
