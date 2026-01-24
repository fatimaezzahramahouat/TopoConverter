import React, { useCallback } from 'react';

const FileUpload = ({ onFileSelect, disabled }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`glass-morphism p-12 text-center border-2 border-dashed border-primary-500/30 hover:border-primary-500 transition-all cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
        disabled={disabled}
      />
      <label htmlFor="fileInput" className="cursor-pointer">
        <div className="flex flex-col items-center gap-4">
          <svg className="w-16 h-16 text-primary-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-xl font-medium text-slate-200">Drag & Drop your topographic plan</p>
          <p className="text-sm text-slate-400">or click to browse (PNG, JPG, BMP)</p>
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
