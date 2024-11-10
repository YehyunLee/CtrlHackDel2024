import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

export async function simpletexHandler(files) {
  const SIMPLETEX_API_TOKEN = process.env.SIMPLETEX_API_TOKEN;
  const apiUrl = "https://server.simpletex.cn/api/simpletex_ocr";

  const file = Array.isArray(files.file) ? files.file[0] : files.file;
  if (!file || !file.filepath) {
    return res.status(400).json({ message: 'No file uploaded or file path is missing' });
  }
  const fileStream = fs.createReadStream(file.filepath);

  const formData = new FormData();
  formData.append("file", fileStream, file.originalFilename);
  const response = await axios.post(apiUrl, formData, {
    headers: {
      ...formData.getHeaders(),
      token: SIMPLETEX_API_TOKEN,
    },
  });

  return response.data;
}
