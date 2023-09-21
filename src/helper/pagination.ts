export const parseTotalPages = (totalCount: number, limit: number): number => {
    return Math.ceil(totalCount / limit);
  };
  
  /**
   * parse Query Limit
   * @param queryLimit
   */
  export const parseLimit = (queryLimit: number | undefined): number => {
    return queryLimit && queryLimit !== 0 ? queryLimit : 10
    
  };
  
  /**
   * Parse current page
   * @param queryPage
   */
  export const parseCurrentPage = (queryPage: number | undefined): number => {
    return  queryPage && queryPage !== 0 ? queryPage : 1
    
  };
  
  /**
   * Pagination Object
   * @param {Number} totalCount - Total counts
   * @param {Number}  page  - Current Page
   * @param  {Number} queryLimit - limit
   */
  
  export const pagination = (
    totalCount: number,
    page: number | undefined,
    queryLimit: number | undefined = 10
  ): {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
  } => {
    const limit = parseLimit(queryLimit);
    const currentPage = parseCurrentPage(page);
    const totalPages = parseTotalPages(totalCount, limit);
    // Returns data for pagination
    return {
      totalCount,
      totalPages,
      currentPage: currentPage,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      prevPage:
        currentPage <= totalPages && currentPage !== 1
          ? currentPage - 1
          : null,
    };
  };
  