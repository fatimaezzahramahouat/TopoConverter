import { useState } from 'react';

export const useConversion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dxfUrl, setDxfUrl] = useState(null);

  const convertImage = async (file) => {
    setLoading(true);
    setError(null);
    setDxfUrl(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDxfUrl(data.dxfUrl);
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      setError('Connection to server failed');
    } finally {
      setLoading(false);
    }
  };

  return { convertImage, loading, error, dxfUrl };
};
