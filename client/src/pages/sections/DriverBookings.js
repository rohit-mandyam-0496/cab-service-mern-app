/* eslint-disable no-restricted-globals */
/* eslint-disable no-unused-vars */
/* eslint-disable no-sequences */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { Search, ArrowClockwise } from "react-bootstrap-icons";
import Pagination from "../../components/pagination";

const BookingsList = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    searchField: "driverName",
    searchValue: "",
    sortField: "pickupTime",
    sortOrder: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const localStorageData = localStorage.getItem("user");
  const user = JSON.parse(localStorageData);
  const token = user.data.jwToken;

  const totalPages = Math.ceil(totalRecords / filters.pageSize);

  const fetchAllBookings = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      if (!token) {
        // Redirect to login or handle error
        return <div>Please log in again.</div>;
      }
      const params = {
        page: filters.page,
        limit: filters.pageSize,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
        searchField: filters.searchField,
        searchValue: filters.searchValue,
      };
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/booking/getDriverBookings`;
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      res.data.data.map(
        (s) => (
          // eslint-disable-next-line no-sequences
          (s.pickupTime = new Date(s.pickupTime).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })),
          (!s.driverName || s.driverName === null) &&
            (s.driverName = "Not assigned yet"),
          (!s.driverPhone || s.driverPhone === null) &&
            (s.driverPhone = "Not assigned yet")
        )
      );
      // console.log("user data", res.data.data);
      setUsers(res.data.data);
      setTotalRecords(res.data.count);
      //navigate("/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings(filters);
  }, [filters]);

  const updateStatus = async (elem) => {
    // e.preventDefault();
    try {
      let statusPrompt = prompt(
        "Update the status: (Valid values: on-the-way, completed)"
      );
      if (statusPrompt) {
        const res = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/v1/booking/updateStatus`,
          {
            bookingId: elem._id,
            status: statusPrompt,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        alert(res.data.message);
      }
      fetchAllBookings(filters);
    } catch (err) {
      alert(err?.message || "Failed");
    }
  };

  const viewMore = async (id) => {
    // e.preventDefault();
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/v1/booking/single/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      //   console.log("viewMore res", res);
      const data = res.data.data;
      return alert(`
            Booking Id: ${data._id.toUpperCase()}\n
            Driver Name: ${data.driver.name}\n
            Driver Phone: ${data.driver.phone}\n
            Customer Name: ${data.customer.name}\n
            Customer Phone: ${data.customer.phone}\n
            Pickup Time: ${new Date(data.pickupTime).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}\n
            Pickup Location: ${
              data.from.name +
              ", " +
              data.from.location +
              ", " +
              data.from.city +
              ", " +
              data.from.state +
              ", " +
              data.from.pinCode
            }\n
            Drop Location: ${
              data.to.name +
              ", " +
              data.to.location +
              ", " +
              data.to.city +
              ", " +
              data.to.state +
              ", " +
              data.to.pinCode
            }\n
            Status: ${data.status}\n
            `);
      //return alert(JSON.stringify(data));
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      searchField: "driverName",
      searchValue: "",
      sortField: "pickupTime",
      sortOrder: "desc",
    });
  };

  // Sort handler
  const handleSort = (field) => {
    setFilters((prev) => {
      if (prev.sortField === field) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === "desc" ? "asc" : "desc",
        };
      }
      return {
        ...prev,
        sortField: field,
        sortOrder: "desc",
      };
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // Handle items per page change
  const handlePageSizeChange = (newSize) => {
    const newPage =
      Math.floor(((filters.page - 1) * filters.pageSize) / newSize) + 1;

    setFilters((prev) => ({
      ...prev,
      pageSize: newSize,
      page: newPage,
    }));
  };

  return (
    <div className="container-fluid p-4">
      <div className="mb-4">
        <h1>Assigned bookings List</h1>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup style={{ width: "500px" }}>
            <Form.Select
              value={filters.searchField}
              onChange={(e) =>
                handleFilterChange("searchField", e.target.value)
              }
            >
              <option value="driverName">Driver Name</option>
              <option value="customerName">Customer Name</option>
              <option value="customerPhone">Customer Phone</option>
              <option value="driverPhone">Driver Phone</option>
              <option value="FromPlace">From Place</option>
              <option value="FromPinCode">From PinCode</option>
              <option value="ToPlace">To Place</option>
              <option value="ToPinCode">To PinCode</option>
              <option value="status">Status</option>
            </Form.Select>
            <Form.Control
              placeholder="Search..."
              value={filters.searchValue}
              onChange={(e) =>
                handleFilterChange("searchValue", e.target.value)
              }
            />
            <Button variant="outline-secondary">
              <Search style={{ color: "white" }} />
            </Button>
          </InputGroup>

          <Button variant="outline-secondary" onClick={resetFilters}>
            <ArrowClockwise style={{ color: "white" }} /> Reset
          </Button>
        </div>
      </div>
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
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading data...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th scope="col" onClick={() => handleSort("driverName")}>
                    Driver Name{" "}
                    {filters.sortField === "driverName" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th scope="col" onClick={() => handleSort("driverPhone")}>
                    Driver Phone{" "}
                    {filters.sortField === "driverPhone" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th scope="col" onClick={() => handleSort("customerName")}>
                    Customer Name
                  </th>
                  <th scope="col" onClick={() => handleSort("customerPhone")}>
                    Customer Phone{" "}
                    {filters.sortField === "customerPhone" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th scope="col" onClick={() => handleSort("pickupTime")}>
                    Pickup Time{" "}
                    {filters.sortField === "pickupTime" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th scope="col">Pickup Location</th>
                  <th scope="col">Drop Location</th>
                  <th scope="col" onClick={() => handleSort("status")}>
                    Status{" "}
                    {filters.sortField === "status" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((elem) => (
                  <tr key={elem._id}>
                    <td>{elem.driverName}</td>
                    <td>{elem.driverPhone}</td>
                    <td>{elem.customerName}</td>
                    <td>{elem.customerPhone}</td>
                    <td>{elem.pickupTime}</td>
                    <td>
                      {elem.FromName}
                      {", "}
                      {elem.FromLocation}
                      {", "}
                      {elem.FromCity}
                      {", "}
                      {elem.FromPinCode}
                    </td>
                    <td>
                      {elem.ToName}
                      {", "}
                      {elem.ToLocation}
                      {", "}
                      {elem.ToCity}
                      {", "}
                      {elem.ToPinCode}
                    </td>
                    <td>{elem.status}</td>
                    <td style={{ display: "table-cell" }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => viewMore(elem._id)}
                      >
                        View
                      </button>
                      {(elem.status === "assigned" ||
                        elem.status === "on-the-way") && (
                        <button
                          className="btn btn-success"
                          onClick={() => updateStatus(elem)}
                        >
                          Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {users.length > 0 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
              <Form.Select
                value={filters.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{ width: "150px" }}
                className="mb-2 mb-md-0"
              >
                <option value="20">20 per page</option>
                <option value="40">40 per page</option>
                <option value="60">60 per page</option>
                <option value="100">100 per page</option>
              </Form.Select>

              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <div className="text">
                {totalRecords > 0
                  ? `Showing ${
                      (filters.page - 1) * filters.pageSize + 1
                    }-${Math.min(
                      filters.page * filters.pageSize,
                      totalRecords
                    )} of ${totalRecords} records`
                  : "No records found"}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingsList;
