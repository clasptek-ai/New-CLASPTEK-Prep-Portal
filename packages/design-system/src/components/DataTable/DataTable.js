import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export function DataTable({ data, columns, keyExtractor, className = '' }) {
  return _jsx('div', {
    className: `w-full overflow-x-auto border border-[#c3c6d2] rounded-xl bg-white shadow-sm ${className}`,
    children: _jsxs('table', {
      className: 'w-full text-left text-sm text-[#191c1e] border-collapse',
      children: [
        _jsx('thead', {
          className:
            'bg-[#eceef0] text-[#434750] uppercase tracking-wider text-xs font-semibold border-b border-[#c3c6d2]',
          children: _jsx('tr', {
            children: columns.map((col, idx) =>
              _jsx('th', { className: 'px-4 py-3.5', children: col.header }, idx)
            ),
          }),
        }),
        _jsx('tbody', {
          className: 'divide-y divide-[#eceef0]',
          children: data.map((row) =>
            _jsx(
              'tr',
              {
                className: 'h-14 hover:bg-[#f2f4f6] transition-colors',
                children: columns.map((col, idx) =>
                  _jsx(
                    'td',
                    {
                      className: 'px-4 py-3.5 align-middle',
                      children: col.cell
                        ? col.cell(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey])
                          : null,
                    },
                    idx
                  )
                ),
              },
              keyExtractor(row)
            )
          ),
        }),
      ],
    }),
  });
}
