const filterQueries = ({ arrQueries, filterColumn, table }) => {
  if (arrQueries.length > 0) {
    const whereClauses = arrQueries
      .filter((query, index) => filterColumn.includes(query))
      .map((query, index) => {
        const operator =
          query === "id" || query?.includes("_id") ? "=" : "LIKE";
        return `${table}.${query} ${operator} ?`;
      });

    if (whereClauses.length > 0) {
      return "WHERE " + whereClauses.join(" AND ");
    }
  }

  return "";
};

const prepareQueryParamValues = (query, filterColumn) => {
  return filterColumn
    .map((column) => {
      const operator =
        column === "id" || column?.includes("_id") ? "=" : "LIKE";

      return column in query && query[column] !== undefined
        ? operator === "LIKE"
          ? `%${query[column]}%`
          : query[column]
        : null;
    })
    .filter((value) => value !== null);
};

module.exports = {
  prepareQueryParamValues,
  filterQueries,
};
