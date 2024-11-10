'use client'
import { useState } from 'react';

export default function UploadImage() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!file) return;
    console.log(file);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const res = await fetch('/api/imageToText', {
        method: 'POST',
        body: formData,
      });
  
      if (!res.ok) {
        // Handle HTTP errors
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error("Error:", error.message);
      setResponse({ message: "Error processing request", error: error.message });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {response && <div>Response: {JSON.stringify(response)}</div>}
    </div>
  );
}
