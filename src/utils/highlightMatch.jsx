export function highlightMatch(header, filterMode) {
  if (filterMode && filterMode.mode === "text" && filterMode.text) {
    const t = filterMode.text;
    if (header.toLowerCase().startsWith(t.toLowerCase())) {
      return (
        <>
          <span className="match">{header.slice(0, t.length)}</span>
          {header.slice(t.length)}
        </>
      );
    }
  }
  return header;
}
