
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3002; // Use a different port than Vite

app.use(cors());
app.use(express.json());

const XML_FILE_PATH = path.join(__dirname, 'user_details.xml');
const BACKUP_XML_FILE_PATH = path.join(__dirname, 'user_details_backup.xml');

// Function to update XML file
const updateXmlFile = (filePath, customerData) => {
    let content = '';
    if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
    }

    if (!content || content.trim() === '') {
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<customers>\n</customers>`;
    }

    const newCustomerXml = `
  <customer>
    <id>${Date.now()}</id>
    <name>${customerData.emailOrPhone.split('@')[0]}</name>
    <email>${customerData.emailOrPhone}</email>
    <password>${customerData.password}</password>
    <provider>direct</provider>
    <timestamp>${new Date().toISOString()}</timestamp>
  </customer>`;

    // Insert before </customers>
    if (content.includes('</customers>')) {
        content = content.replace('</customers>', `${newCustomerXml}\n</customers>`);
    } else {
        content = `<?xml version="1.0" encoding="UTF-8"?>\n<customers>${newCustomerXml}\n</customers>`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
};

app.post('/api/save-customer', (req, res) => {
    const customerData = req.body;
    console.log('Received customer data:', customerData);

    try {
        updateXmlFile(XML_FILE_PATH, customerData);
        updateXmlFile(BACKUP_XML_FILE_PATH, customerData);
        res.status(200).json({ message: 'Saved successfully' });
    } catch (error) {
        console.error('Error saving XML:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
