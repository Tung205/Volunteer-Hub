/**
 * Exports data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 */
export const exportToCSV = (data, filename) => {
    if (!data || !data.length) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(fieldName => {
                // Handle strings with commas or quotes
                const val = row[fieldName];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        )
    ].join('\n');

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Exports Merged Data (Users + Events) to CSV file
 * @param {Array} userData - Array of user objects
 * @param {Array} eventData - Array of event objects
 * @param {String} filename - Name of the file without extension
 */
export const exportMergedToCSV = (userData, eventData, filename) => {
    if ((!userData || !userData.length) && (!eventData || !eventData.length)) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    let csvContent = "";

    // 1. Section: USERS
    if (userData && userData.length > 0) {
        csvContent += "SECTION: USERS\n";
        const userHeaders = Object.keys(userData[0]);
        csvContent += userHeaders.join(',') + "\n";
        csvContent += userData.map(row =>
            userHeaders.map(fieldName => {
                const val = row[fieldName];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        ).join('\n');
        csvContent += "\n\n"; // Separation
    }

    // 2. Section: EVENTS
    if (eventData && eventData.length > 0) {
        csvContent += "SECTION: EVENTS\n";
        const eventHeaders = Object.keys(eventData[0]);
        csvContent += eventHeaders.join(',') + "\n";
        csvContent += eventData.map(row =>
            eventHeaders.map(fieldName => {
                const val = row[fieldName];
                return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
            }).join(',')
        ).join('\n');
    }

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Exports data to JSON file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file without extension
 */
export const exportToJSON = (data, filename) => {
    const isArray = Array.isArray(data);
    const hasData = isArray ? data.length > 0 : data && Object.keys(data).length > 0;

    if (!hasData) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    const jsonContent = JSON.stringify(data, null, 2);

    // Trigger download
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
