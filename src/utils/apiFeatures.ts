export class APIFeatures {
    query: any;
    queryString: any;

    constructor(query: any, queryString: any) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'month', 'year', 'period'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced filtering: gte, gt, lte, lt
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    search(searchFields: string[] = ['name']) {
        if (this.queryString.search) {
            const searchTerms = this.queryString.search.trim().split(/\s+/);
            const searchQueries = searchTerms.map((term: string) => {
                const searchRegex = new RegExp(term, 'i');
                const fieldQueries = searchFields.map(field => ({ [field]: searchRegex }));
                return { $or: fieldQueries };
            });
            this.query = this.query.find({ $and: searchQueries });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // Default sort by newest
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); // Exclude mongoose internal version
        }

        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page as string, 10) || 1;
        const limit = parseInt(this.queryString.limit as string, 10) || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
