export function paginate(query, { limit = 25, offset = 0 } = {}) {
    return { ...query, limit, offset };
}
