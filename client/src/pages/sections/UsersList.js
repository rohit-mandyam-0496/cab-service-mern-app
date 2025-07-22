/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-sequences */
import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../../components/DataTable";
import Pagination from "../../components/pagination";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { Search, ArrowClockwise } from "react-bootstrap-icons";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    searchField: "name",
    searchValue: "",
    sortField: "createdAt",
    sortOrder: "desc",
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const localStorageData = localStorage.getItem("user");
  const user = JSON.parse(localStorageData);
  const token = user?.data?.jwToken;
  const totalPages = Math.ceil(totalRecords / filters.pageSize);
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };
  const handlePageSizeChange = (newSize) => {
    const newPage =
      Math.floor(((filters.page - 1) * filters.pageSize) / newSize) + 1;

    setFilters((prev) => ({
      ...prev,
      pageSize: newSize,
      page: newPage,
    }));
  };
  const fetchUsers = async () => {
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
      };
      // Add search parameters if search value exists
      if (filters.searchValue) {
        params.searchField = filters.searchField;
        params.searchValue = filters.searchValue;
      }
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/v1/${user.data.role}/userListing`;
      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });
      // console.log("user data", res.data.data);
      const response = res.data.data.map((s) => ({
        ...s,
        _id: s._id.toUpperCase(),
        name: s.name,
        email: s.email,
        role: s.role,
        phone: s.phone,
        verifiedEmail: s.verifiedEmail ? "Yes" : "No",
        loggedOut: s.loggedOut ? "Yes" : "No",
        loginCount: s.loginCount,
        logoutCount: s.logoutCount,
      }));
      // console.log("response", response);
      setUsers(response);
      setTotalRecords(res.data.count);
    } catch (err) {
      console.log(err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };
  const resetFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
      searchField: "name",
      searchValue: "",
      sortField: "createdAt",
      sortOrder: "desc",
    });
  };
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  return (
    <div className="container-fluid p-4">
      <h1>Customer List</h1>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <InputGroup style={{ width: "500px" }}>
          <Form.Select
            value={filters.searchField}
            onChange={(e) => handleFilterChange("searchField", e.target.value)}
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="role">Role</option>
            <option value="phone">Phone</option>
          </Form.Select>
          <Form.Control
            placeholder="Search..."
            value={filters.searchValue}
            onChange={(e) => handleFilterChange("searchValue", e.target.value)}
          />
          <Button variant="outline-secondary">
            <Search style={{ color: "white" }} />
          </Button>
        </InputGroup>

        <Button variant="outline-secondary" onClick={resetFilters}>
          <ArrowClockwise style={{ color: "white" }} /> Reset
        </Button>
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
      <DataTable
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          margin: "auto",
        }}
        data={users}
        columns={[
          { key: "_id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "role", label: "Role" },
          { key: "loggedOut", label: "Logged Out" },
          { key: "verifiedEmail", label: "Verified Email" },
          { key: "loginCount", label: "Login Count" },
          { key: "logoutCount", label: "Logout Count" },
        ]}
      />
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
    </div>
  );
};

export default UsersList;
