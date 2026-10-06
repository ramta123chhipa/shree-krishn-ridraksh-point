export const slugify = (s) =>
  String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

// Returns a slug that no other document of `Model` uses: "ruby", "ruby-2", "ruby-3"...
export const uniqueSlug = async (Model, text, excludeId) => {
  const base = slugify(text) || 'item';
  let slug = base;
  for (let n = 2; await Model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) }); n += 1) slug = `${base}-${n}`;
  return slug;
};
