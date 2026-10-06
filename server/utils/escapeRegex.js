// Makes user text safe to use inside a RegExp (search boxes).
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
