// pages/api/upload.js
import { IncomingForm } from 'formidable';  // Correct way to import IncomingForm
import fs from 'fs';
import path from 'path';

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

const handler = (req, res) => {
  const form = new IncomingForm();  // Now correctly using IncomingForm
  form.uploadDir = uploadDir;  // Set the upload directory
  form.keepExtensions = true;  // Keep file extensions

  form.parse(req, (err, fields, files) => {
    console.log("Files:");
    console.log(files)
    if (err) {
      console.error('Error during file parsing:', err);
      return res.status(500).json({ error: 'Something went wrong while uploading the file.' });
    }

    const uploadedFile = files.file[0];  // Assuming the file is at index 0
    const newFilePath = path.join(uploadDir, uploadedFile.originalFilename);

    // Rename the file and store it in the desired location
    fs.renameSync(uploadedFile.filepath, newFilePath);

    res.status(200).json({ message: 'File uploaded successfully!', file: uploadedFile });
  });
};

export default handler;
