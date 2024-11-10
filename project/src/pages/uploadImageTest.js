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

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch('/api/imageToText', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    setResponse(data);
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
