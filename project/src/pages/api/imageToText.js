import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js's body parser to use formidable
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const SIMPLETEX_API_TOKEN = process.env.SIMPLETEX_API_TOKEN;
  const apiUrl = "https://server.simpletex.cn/api/simpletex_ocr"; // Replace with actual API endpoint

  const form = formidable({
    multiples: false, // Only a single file is expected
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'File parsing error', error: err.message });
    }

    // Access the file - handle it as an array or object
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || !file.filepath) {
      return res.status(400).json({ message: 'No file uploaded or file path is missing' });
    }

    const fileStream = fs.createReadStream(file.filepath);

    try {
      const formData = new FormData();
      formData.append("file", fileStream, file.originalFilename);

      const response = await axios.post(apiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          "token": SIMPLETEX_API_TOKEN,
        },
      });

      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error processing request', error: error.message });
    }
  });
}
