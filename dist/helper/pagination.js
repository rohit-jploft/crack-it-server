"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = exports.parseCurrentPage = exports.parseLimit = exports.parseTotalPages = void 0;
const parseTotalPages = (totalCount, limit) => {
    return Math.ceil(totalCount / limit);
};
exports.parseTotalPages = parseTotalPages;
/**
 * parse Query Limit
 * @param queryLimit
 */
const parseLimit = (queryLimit) => {
    return queryLimit && queryLimit !== 0 ? queryLimit : 10;
};
exports.parseLimit = parseLimit;
/**
 * Parse current page
 * @param queryPage
 */
const parseCurrentPage = (queryPage) => {
    return queryPage && queryPage !== 0 ? queryPage : 1;
};
exports.parseCurrentPage = parseCurrentPage;
/**
 * Pagination Object
 * @param {Number} totalCount - Total counts
 * @param {Number}  page  - Current Page
 * @param  {Number} queryLimit - limit
 */
const pagination = (totalCount, page, queryLimit = 10) => {
    const limit = (0, exports.parseLimit)(queryLimit);
    const currentPage = (0, exports.parseCurrentPage)(page);
    const totalPages = (0, exports.parseTotalPages)(totalCount, limit);
    // Returns data for pagination
    return {
        totalCount,
        totalPages,
        currentPage: currentPage,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        prevPage: currentPage <= totalPages && currentPage !== 1
            ? currentPage - 1
            : null,
    };
};
exports.pagination = pagination;
