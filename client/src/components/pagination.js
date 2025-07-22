/* eslint-disable no-unused-vars */
const DynamicPagination = ({ currentPage, totalPages, onPageChange }) => {
  console.log("Page info", {
    currentPage,
    totalPages,
  });
  const handlePageChange = (pageNumber) => {
    if (
      pageNumber !== currentPage &&
      pageNumber >= 1 &&
      pageNumber <= totalPages
    ) {
      onPageChange(pageNumber);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages === 0) return null;

  return (
    <div>
      {/* Pagination Controls */}
      <div className="pagination-controls">
        <button onClick={handlePrevious} disabled={currentPage === 1}>
          &laquo; Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}

        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next &raquo;
        </button>
      </div>
    </div>
  );
};

export default DynamicPagination;
