import { createContext, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      let res;
      if (user?.data?.jwToken) {
        res = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/v1/${user?.data?.role}/logout`,
          { email: user?.data?.email },
          {
            headers: {
              Authorization: `Bearer ${user?.data?.jwToken}`,
            },
          }
        );
      }
      alert(res.data.message || "Logout successful!");
    } catch (err) {
      console.error("Logout failed:", err.message);
    } finally {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
