/**
 * Parses a simple CSV text into an array of objects.
 * This is a basic parser and does not handle all CSV edge cases like newlines or commas within quoted fields.
 * It assumes a simple comma-separated format.
 * @param csvText The raw CSV string.
 * @returns An array of objects.
 */
export const parseCSV = <T extends Record<string, any>>(csvText: string): T[] => {
    // Normalize line endings and remove BOM if present
    const normalizedText = csvText.trim().replace(/^\uFEFF/, '');
    const lines = normalizedText.split(/\r?\n/);
    
    if (lines.length < 2) {
        throw new Error("Le fichier CSV est vide ou ne contient que les en-têtes.");
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data: T[] = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines

        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`Ligne ${i + 1} ignorée : le nombre de colonnes (${values.length}) ne correspond pas aux en-têtes (${headers.length}).`);
            continue;
        }

        const entry: Record<string, any> = {};
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        data.push(entry as T);
    }
    return data;
};
