const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../data_src');
const OUT_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuote) {
            if (char === '"') {
                if (line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuote = false;
                }
            } else {
                current += char;
            }
        } else {
            if (char === '"') {
                inQuote = true;
            } else if (char === ',') {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
    }
    result.push(current);
    return result;
}

function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const obj = {};

        headers.forEach((header, index) => {
            // Skip columns starting with _ or (note)
            if (header.startsWith('_') || header.startsWith('(note)')) return;

            let value = values[index] || '';

            // Handle nested properties (e.g. links_Spotify -> links: { Spotify: ... })
            if (header.includes('_')) {
                const parts = header.split('_');
                const root = parts[0];
                const sub = parts.slice(1).join('_'); // join back if multiple underscores

                if (!obj[root]) obj[root] = {};
                if (value) obj[root][sub] = value;
            }
            // Handle arrays (e.g. tags split by |)
            else if (header === 'tags') {
                obj[header] = value ? value.split('|').map(s => s.trim()) : [];
            }
            else {
                obj[header] = value;
            }
        });

        if (Object.keys(obj).length > 0) {
            data.push(obj);
        }
    }
    return data;
}

const files = [
    { name: 'artists.csv', out: 'artists.json', type: 'simple' },
    { name: 'news.csv', out: 'news.json', type: 'simple' },
    { name: 'music.csv', out: 'music.json', type: 'music' }, // structure needed: { sections: [...] } or just flat?
    // Previous JSON structure was { sections: [ { items: [] } ] } for music, novels, stamps.
    // We will flatten it for simplicity in JSON, or recreate the structure.
    // The frontend main.js I wrote earlier expects state.music as flat array? 
    // Wait, my main.js earlier did: state.music = musicData.sections.flatMap(...)
    // So I should keep the structure compatible or update main.js.
    // Let's keep structure compatible for robustness.
    { name: 'novels.csv', out: 'novels.json', type: 'section' },
    { name: 'stamps.csv', out: 'stamps.json', type: 'section' }
];

files.forEach(file => {
    const csvPath = path.join(SRC_DIR, file.name);
    if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf-8');
        const items = parseCSV(csvContent);

        let outputData;
        if (file.type === 'simple') {
            outputData = { items: items };
        } else {
            // Wrap in sections for compatibility
            // We can just put all items in one "All" section
            outputData = {
                sections: [
                    {
                        title: "All",
                        items: items
                    }
                ]
            };
        }

        fs.writeFileSync(path.join(OUT_DIR, file.out), JSON.stringify(outputData, null, 2));
        console.log(`Generated ${file.out} from ${file.name}`);
    } else {
        console.warn(`Source file not found: ${file.name}`);
    }
});
