import React, { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';
import History from './components/History';
import { useConversion } from './hooks/useConversion';

function App() {
  const { convertImage, loading, error, dxfUrl } = useConversion();
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [dxfUrl]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent italic">
          TopoConverter
        </h1>
        <p className="text-slate-400 text-lg">Convert your topographic plans from Image to CAD (DXF) in seconds.</p>
      </header>

      <main className="space-y-8">
        <FileUpload onFileSelect={convertImage} disabled={loading} />

        {loading && (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-primary-400 font-medium">Processing contour detection...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {dxfUrl && (
          <div className="glass-morphism p-8 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 text-green-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-2xl font-bold">Conversion Successful!</span>
            </div>
            <a
              href={dxfUrl}
              download
              className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-primary-600/20"
            >
              Download DXF File
            </a>
          </div>
        )}

        <History history={history} />
      </main>

      <footer className="mt-24 text-center text-slate-500 text-sm">
        Built for Professional Topography Workflows
      </footer>
    </div>
  );
}

export default App;
