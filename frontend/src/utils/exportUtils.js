export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        console.warn("No data to export");
        return;
    }

    // Extract all unique keys as headers to ensure we don't miss fields
    const headersSet = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(key => headersSet.add(key));
    });
    const headers = Array.from(headersSet);

    // Create CSV string
    const csvRows = [];
    csvRows.push(headers.map(h => `"${(h || '').toString().replace(/"/g, '""')}"`).join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] !== null && row[header] !== undefined ? row[header] : '';
            // Escape quotes by doubling them, wrap each field in quotes
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};
