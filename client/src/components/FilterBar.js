// import React from "react";

const FilterBar = ({ filters, onFilterChange }) => {
  return (
    <div style={{ marginBottom: 10 }}>
      {Object.entries(filters).map(([key, value]) => (
        <input
          key={key}
          name={key}
          value={value}
          placeholder={`Filter by ${key}`}
          onChange={(e) => onFilterChange(key, e.target.value)}
          style={{ marginRight: 10 }}
        />
      ))}
    </div>
  );
};

export default FilterBar;
