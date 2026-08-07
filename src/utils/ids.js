// Stable id generator for files, collections, and output columns.
// A module-level counter + timestamp — deliberately not a UUID.
let uid = 0;
export const nextId = () => `id${Date.now()}_${uid++}`;
