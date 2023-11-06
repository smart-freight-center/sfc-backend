type PaginationMeta = {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
};

type PaginationQueryInput = {
  page: number;
  perPage: number;
  total: number;
};

type PaginationResult<T> = {
  data: T[];
  meta: PaginationMeta;
};

export function calculateOffsetAndLmit(page: number, perPage: number) {
  const offset = (page - 1) * perPage;

  return { offset, limit: perPage };
}

export function paginate<T>(
  dataArray: T[],
  query: PaginationQueryInput
): PaginationResult<T> {
  const { page: currentPage, perPage, total } = query;
  const totalPages = Math.ceil(total / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  const paginatedData = dataArray.slice(startIndex, endIndex);

  const paginationMeta: PaginationMeta = {
    currentPage: Math.min(totalPages + 1, currentPage),
    perPage,
    totalPages,
    totalItems: total,
  };

  const paginationResult: PaginationResult<T> = {
    data: paginatedData,
    meta: paginationMeta,
  };

  return paginationResult;
}
