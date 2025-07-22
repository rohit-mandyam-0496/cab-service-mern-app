/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import areaService from "../../services/areaService";

const BookingForm = () => {
  const { user, login } = useContext(AuthContext);
  const [booking, setBooking] = useState({
    from: "",
    to: "",
    pickupTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const navigate = useNavigate();

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const token = user?.data?.jwToken;

  const fetchAreaSuggestions = async (query, setSuggestions) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const params = {
        page: 1,
        limit: 10,
        searchField: "name",
        searchValue: query,
      };
      const data = await areaService.fetchAllAreas(params, token);
      const filtered = data.data || data;
      console.log("filtered fetchAreaSuggestions", filtered);
      setSuggestions(filtered);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
    if (e.target.name === "from") {
      fetchAreaSuggestions(e.target.value, setFromSuggestions);
      console.log("fromSuggestions", fromSuggestions);
    } else if (e.target.name === "to") {
      fetchAreaSuggestions(e.target.value, setToSuggestions);
      console.log("toSuggestions", toSuggestions);
    }
  };

  const handleSuggestionClick = (name, field) => {
    setBooking({ ...booking, [field]: name });
    if (field === "from") {
      setFromSuggestions([]);
    } else if (field === "to") {
      setToSuggestions([
        //   {
        //   name: name
        // }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/booking/create`;
      const res = await axios.post(endpoint, booking, {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(res.data);
      alert(res.data.message);
      login(user);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Booking creation failed");
      alert(err?.message || "Booking creation failed");
    } finally {
      setLoading(false);
    }
  };

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setFromSuggestions([]);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setToSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="container">
      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          className="mb-3"
        >
          <Alert.Heading>Error loading data</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <div
          className="form-group"
          ref={fromRef}
          style={{ position: "relative" }}
        >
          <label>Current Location:</label>
          <input
            type="text"
            name="from"
            value={booking.from}
            onChange={handleChange}
            className="form-control"
            autoComplete="on"
            required
          />
          {fromSuggestions.length > 0 && (
            <ul
              className="list-group"
              style={{ position: "absolute", zIndex: 1000, width: "100%" }}
            >
              {fromSuggestions.map((area) => (
                <li
                  key={area._id || area.name}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSuggestionClick(area.name, "from")}
                  style={{ cursor: "pointer" }}
                >
                  {area.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div
          className="form-group"
          ref={toRef}
          style={{ position: "relative" }}
        >
          <label>Destination:</label>
          <input
            type="text"
            name="to"
            value={booking.to}
            onChange={handleChange}
            className="form-control"
            autoComplete="on"
            required
          />
          {toSuggestions.length > 0 && (
            <ul
              className="list-group"
              style={{ position: "absolute", zIndex: 1000, width: "100%" }}
            >
              {toSuggestions.map((area) => (
                <li
                  key={area._id || area.name}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSuggestionClick(area.name, "to")}
                  style={{ cursor: "pointer" }}
                >
                  {area.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="form-group">
          <label>Pickup Time:</label>
          <input
            type="datetime-local"
            name="pickupTime"
            value={booking.pickupTime}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <Button type="submit" className="btn btn-primary" disabled={loading}>
          Book Now
        </Button>
      </Form>
    </div>
  );
};

export default BookingForm;
