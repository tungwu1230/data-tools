// $collection_name$ — exact syntax check, case-insensitive name lookup
export function parseCollectionSyntax(value) {
  const m = value.match(/^\$(.+)\$$/);
  if (!m) return null;
  const name = m[1].trim();
  return name || null;
}
