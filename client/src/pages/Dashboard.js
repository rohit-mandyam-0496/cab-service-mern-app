import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import CustomerDashboard from "./dashboards/CustomerDashboard";
import DriverDashboard from "./dashboards/DriverDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <h2>Please Log In</h2>;
  // console.log(user.data);
  if (user.data.role === "admin") return <AdminDashboard />;
  if (user.data.role === "driver") return <DriverDashboard />;
  if (user.data.role === "customer") return <CustomerDashboard />;

  return <h2>Unknown role</h2>;
};

export default Dashboard;
