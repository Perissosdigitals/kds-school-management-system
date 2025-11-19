// A reusable utility function to export an array of objects to a CSV file.

export const exportToCSV = <T extends Record<string, any>>(data: T[], filename: string, selectedHeaders?: string[]): void => {
    if (data.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }

    const headers = selectedHeaders && selectedHeaders.length > 0 ? selectedHeaders : Object.keys(data[0]);
    
    if (headers.length === 0) {
        alert("Veuillez sélectionner au moins une colonne à exporter.");
        return;
    }

    const csvRows = [
        headers.join(','), // header row
        ...data.map(row => 
            headers.map(fieldName => {
                const fieldValue = row[fieldName];
                if (fieldValue === null || fieldValue === undefined) {
                    return '';
                }
                let stringValue = String(fieldValue);
                // Escape commas, quotes, and newlines
                if (/[",\n]/.test(stringValue)) {
                    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ];

    const bom = '\uFEFF'; // BOM for Excel compatibility with UTF-8
    const csvContent = bom + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL
};

/**
 * Exports a CSV file containing only the headers, to be used as a template for data import.
 * @param headers The array of header strings.
 * @param filename The desired name of the file (without extension).
 */
export const exportCSVTemplate = (headers: string[], filename: string): void => {
    if (headers.length === 0) {
        alert("Aucun en-tête à exporter pour le modèle.");
        return;
    }
    
    const csvContent = headers.join(',');
    const bom = '\uFEFF'; // BOM for Excel compatibility with UTF-8
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};