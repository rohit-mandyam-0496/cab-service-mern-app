/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import areaService from "../../services/areaService";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Button,
  Modal,
} from "react-bootstrap";

const Areas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const localStorageData = localStorage.getItem("user");
  const user = JSON.parse(localStorageData);
  const token = user?.data?.jwToken;
  const isAdmin = user?.data?.role === "admin";

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    searchField: "name",
    searchValue: "",
    sortField: "createdAt",
    sortOrder: "desc",
  });

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentArea, setCurrentArea] = useState({
    _id: null,
    name: "",
    location: "",
    city: "",
    state: "",
    pinCode: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...queryParams };
      if (!params.searchValue || params.searchValue.trim() === "") {
        delete params.searchValue;
      }
      const data = await areaService.fetchAllAreas(params, token);
      setAreas(data.data || []);
      const count = data.count || 0;
      setTotalCount(count);
      const calculatedPages = Math.max(1, Math.ceil(count / params.limit));
      setTotalPages(calculatedPages);
    } catch (err) {
      setError(err.message || "Error fetching areas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, [queryParams]);

  const handleSearchChange = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      searchValue: e.target.value,
      page: 1,
    }));
  };

  const handleSearchFieldChange = (e) => {
    setQueryParams((prev) => ({
      ...prev,
      searchField: e.target.value,
      page: 1,
    }));
  };

  const handleSortChange = (field) => {
    setQueryParams((prev) => {
      if (prev.sortField === field) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
        };
      } else {
        return {
          ...prev,
          sortField: field,
          sortOrder: "asc",
        };
      }
    });
  };

  const handlePrevPage = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: Math.max(prev.page - 1, 1),
    }));
  };

  const handleNextPage = () => {
    setQueryParams((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, totalPages),
    }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setCurrentArea({
      _id: null,
      name: "",
      location: "",
      city: "",
      state: "",
      pinCode: "",
    });
    setActionError(null);
    setShowModal(true);
  };

  const openEditModal = (area) => {
    setModalMode("edit");
    setCurrentArea({ ...area });
    setActionError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActionError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentArea((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      if (modalMode === "add") {
        await areaService.addArea({
          name: currentArea.name,
          location: currentArea.location,
          city: currentArea.city,
          state: currentArea.state,
          pinCode: currentArea.pinCode,
        }, token);
      } else if (modalMode === "edit") {
        await areaService.updateArea(currentArea._id, {
          name: currentArea.name,
          location: currentArea.location,
          city: currentArea.city,
          state: currentArea.state,
          pinCode: currentArea.pinCode,
        }, token);
      }
      closeModal();
      fetchAreas();
    } catch (err) {
      setActionError(err.message || "Error saving area");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (areaId) => {
    if (!window.confirm("Are you sure you want to delete this area?")) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await areaService.deleteArea(areaId, token);
      fetchAreas();
    } catch (err) {
      setActionError(err.message || "Error deleting area");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <h2>Areas</h2>
      {isAdmin && (
        <Button variant="primary" onClick={openAddModal} style={{ marginBottom: "1rem" }}>
          Add Area
        </Button>
      )}
      <div className="container" style={{ marginBottom: "1rem" }}>
        <label>
          Search Field:{" "}
          <select value={queryParams.searchField} onChange={handleSearchFieldChange}>
            <option value="name">Name</option>
            <option value="location">Location</option>
            <option value="city">City</option>
            <option value="state">State</option>
            <option value="pinCode">Pin Code</option>
          </select>
        </label>
        <input
          type="text"
          placeholder="Search..."
          value={queryParams.searchValue}
          onChange={handleSearchChange}
          style={{ marginLeft: "0.5rem" }}
        />
        <label style={{ marginLeft: "1rem" }}>
          Items per page:{" "}
          <select
            value={queryParams.limit}
            onChange={(e) =>
              setQueryParams((prev) => ({
                ...prev,
                limit: Number(e.target.value),
                page: 1,
              }))
            }
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading areas...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : areas.length === 0 ? (
        <p>No areas found.</p>
      ) : (
        <Table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th onClick={() => handleSortChange("name")}>
                Name{" "}
                {queryParams.sortField === "name"
                  ? queryParams.sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th onClick={() => handleSortChange("location")}>
                Location{" "}
                {queryParams.sortField === "location"
                  ? queryParams.sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th onClick={() => handleSortChange("city")}>
                City{" "}
                {queryParams.sortField === "city"
                  ? queryParams.sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th onClick={() => handleSortChange("state")}>
                State{" "}
                {queryParams.sortField === "state"
                  ? queryParams.sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              <th onClick={() => handleSortChange("pinCode")}>
                Pin Code{" "}
                {queryParams.sortField === "pinCode"
                  ? queryParams.sortOrder === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area._id || area.name}>
                <td>{area.name}</td>
                <td>{area.location}</td>
                <td>{area.city}</td>
                <td>{area.state}</td>
                <td>{area.pinCode}</td>
                {isAdmin && (
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => openEditModal(area)}
                      style={{ marginRight: "0.5rem" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(area._id)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handlePrevPage} disabled={queryParams.page <= 1}>
          Prev
        </button>
        <span style={{ margin: "0 1rem" }}>
          Page {queryParams.page} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={queryParams.page >= totalPages}
        >
          Next
        </button>
      </div>

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "add" ? "Add Area" : "Edit Area"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && <Alert variant="danger">{actionError}</Alert>}
          <Form>
            <Form.Group className="mb-3" controlId="formAreaName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                name="name"
                value={currentArea.name}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAreaLocation">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter location"
                name="location"
                value={currentArea.location}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAreaCity">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter city"
                name="city"
                value={currentArea.city}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAreaState">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter state"
                name="state"
                value={currentArea.state}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formAreaPinCode">
              <Form.Label>Pin Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter pin code"
                name="pinCode"
                value={currentArea.pinCode}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal} disabled={actionLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={actionLoading}>
            {actionLoading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Areas;
