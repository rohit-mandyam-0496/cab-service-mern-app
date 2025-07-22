const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const DataTable = ({ data, columns }) => {
  return (
    <table
      border="1 table"
      cellPadding="10"
      cellSpacing="0"
      align="center"
      style={{ width: "100%" }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>No data</td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.key}>{getNestedValue(row, col.key)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DataTable;
