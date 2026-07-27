export interface PaginationResult {
    total: number;
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
}

export const getPaginationData = (total: number, page: number, limit: number): PaginationResult => {
    const pages = Math.ceil(total / limit);
    const hasNextPage = page < pages;
    const hasPrevPage = page > 1;

    return {
        total,
        page,
        limit,
        pages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : undefined,
        prevPage: hasPrevPage ? page - 1 : undefined
    };
};
