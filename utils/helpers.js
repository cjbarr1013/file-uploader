function reformatSort(sort) {
  // ACCEPTED FORMATS
  // name,ASC
  // name,DESC
  // size,ASC
  // size,DESC
  // updatedAt,ASC
  // updatedAt,DESC
  // format,ASC
  // format,DESC
  const [col, order] = sort.split(',');

  // Whitelist allowed columns
  const allowedColumns = ['name', 'size', 'updatedAt', 'format'];
  const allowedOrder = ['ASC', 'DESC'];

  const column = allowedColumns.includes(col) ? col : 'updatedAt';
  const direction =
    allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  return [column, direction];
}

module.exports = {
  reformatSort,
};
