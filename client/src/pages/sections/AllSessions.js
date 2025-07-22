/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Search, ArrowClockwise } from "react-bootstrap-icons";
import sessionService from "../../services/sessionService";
import Pagination from "../../components/pagination";

const AllSessions = () => {
  // State management
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter and pagination state
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20, // Default page size set to 20
    searchField: "email",
    searchValue: "",
    sortField: "loginTime",
    sortOrder: "desc",
    roleFilter: null,
  });
  // Get user token from local storage
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.data?.jwToken;

  const totalPages = Math.ceil(totalRecords / filters.pageSize);

  // Fetch session data
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: filters.page,
        limit: filters.pageSize,
        sortField: filters.sortField,
        sortOrder: filters.sortOrder,
      };
      // Add search parameters if search value exists
      if (filters.searchValue) {
        params.searchField = filters.searchField;
        params.searchValue = filters.searchValue;
      }
      // Add additional filters if present
      if (filters.roleFilter) {
        params.role = filters.roleFilter;
      }
      const response = await sessionService.fetchAllSessions(params, token);
      const formattedSessions = response.data.map((session) => ({
        key: session._id,
        ...session,
        loginTime: new Date(session.loginTime).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
        logoutTime:
          session.logoutTime === "Not logged out"
            ? (session.logoutTime = "Active")
            : (session.logoutTime = new Date(session.logoutTime).toLocaleString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              )),
        activities: session.activities.join(", "),
        sessionTime:
          session.sessionTime === "0 minutes" ? "Ongoing" : session.sessionTime,
      }));
      setSessions(formattedSessions);
      setTotalRecords(response.count);
      // console.log("totalRecords", totalRecords);
      // console.log("setTotalRecords", setTotalRecords);
      // console.log("totalPages", totalPages);
    } catch (err) {
      setError("Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters change
  useEffect(() => {
    fetchSessions();
  }, [filters]);

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
      searchField: "email",
      searchValue: "",
      sortField: "loginTime",
      sortOrder: "desc",
      roleFilter: null,
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Sessions</h1>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <InputGroup style={{ width: "500px" }}>
            <Form.Select
              value={filters.searchField}
              onChange={(e) =>
                handleFilterChange("searchField", e.target.value)
              }
            >
              <option value="email">Email</option>
              <option value="name">Name</option>
              <option value="role">Role</option>
              <option value="phone">Phone</option>
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
          <p className="mt-2">Loading sessions...</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th onClick={() => handleSort("email")}>
                    Email{" "}
                    {filters.sortField === "email" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Name{" "}
                    {filters.sortField === "name" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("role")}>
                    Role{" "}
                    {filters.sortField === "role" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("phone")}>
                    Phone{" "}
                    {filters.sortField === "phone" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th style={{ width: "800px" }}>Activities</th>
                  <th onClick={() => handleSort("loginTime")}>
                    Login Time{" "}
                    {filters.sortField === "loginTime" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th onClick={() => handleSort("logoutTime")}>
                    Logout Time{" "}
                    {filters.sortField === "logoutTime" &&
                      (filters.sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Duration Time</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <tr key={session._id}>
                      <td>{session.email}</td>
                      <td>{session.name}</td>
                      <td>{session.role}</td>
                      <td>{session.phone}</td>
                      <td>{session.activities}</td>
                      <td>{session.loginTime}</td>
                      <td>{session.logoutTime}</td>
                      <td>{session.sessionTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No sessions found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {sessions.length > 0 && (
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

export default AllSessions;
