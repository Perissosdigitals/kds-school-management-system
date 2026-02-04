const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(path.join(__dirname, 'test_upload.pdf')));
    formData.append('studentId', '50ce62ed-98fb-408b-85d5-f8e57eadb189');
    formData.append('type', 'Extrait de naissance');
    formData.append('title', 'Test Manual Upload');

    try {
        const response = await axios.post('http://localhost:3002/api/v1/documents/upload', formData, {
            headers: formData.getHeaders()
        });
        console.log('✅ Upload Success:', response.data);
    } catch (error) {
        console.error('❌ Upload Failed:', error.response?.data || error.message);
    }
}

// Create a dummy pdf first
fs.writeFileSync(path.join(__dirname, 'test_upload.pdf'), 'Dummy PDF content');

testUpload();
