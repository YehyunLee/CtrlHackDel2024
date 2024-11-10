import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const SIMPLETEX_API_TOKEN = process.env.SIMPLETEX_API_TOKEN; // Access the token from .env
  const apiUrl = "https://server.simpletex.cn/api/simpletex_ocr"; // Replace with the actual API endpoint

  try {
    const formData = new FormData();
    formData.append("file", req.files.file[0].buffer, {
      filename: req.files.file[0].originalname,
    });

    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(), // Sets the correct 'Content-Type' for form-data
        "token": SIMPLETEX_API_TOKEN, // Add the token to headers
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
}
