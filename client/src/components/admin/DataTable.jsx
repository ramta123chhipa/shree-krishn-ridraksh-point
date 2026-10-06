// Simple responsive table. columns: [{ key, header, render?(row), className? }]
export default function DataTable({ caption, columns, rows, loading, empty = 'Nothing to show yet.', rowKey = '_id' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gold-300 bg-white">
      <table className="w-full min-w-[640px] text-left">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-gold-300 bg-cream-100 text-sm text-maroon-800">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 font-semibold ${c.className || ''}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gold-300/50">
          {loading && !rows?.length && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-ink/60">Loading...</td></tr>}
          {!loading && !rows?.length && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-ink/60">{empty}</td></tr>}
          {rows?.map((row) => (
            <tr key={row[rowKey]} className={loading ? 'opacity-60' : ''}>
              {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
