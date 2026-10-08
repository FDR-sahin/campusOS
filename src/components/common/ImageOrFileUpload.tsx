import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, FileText, X, CheckCircle2, Link as LinkIcon, Smartphone, Laptop } from 'lucide-react';

interface ImageOrFileUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  placeholder?: string;
  helperText?: string;
  isImageOnly?: boolean;
}

export const ImageOrFileUpload: React.FC<ImageOrFileUploadProps> = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  placeholder = 'https://... or upload from your device',
  helperText = 'Supports JPG, PNG, WEBP, PDF from your phone or PC',
  isImageOnly = false,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'url'>(value && value.startsWith('http') ? 'url' : 'upload');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    // Check size limit: max 5MB for base64 storage
    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please choose a smaller file.');
      return;
    }

    setFileName(file.name);
    const sizeKb = Math.round(file.size / 1024);
    setFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImageValue = value && (value.startsWith('data:image') || value.match(/\.(jpeg|jpg|gif|png|webp)/i) || value.includes('images.unsplash.com'));

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px]">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              inputMode === 'upload' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Phone / PC</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-2 py-0.5 rounded flex items-center gap-1 transition-all ${
              inputMode === 'url' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL Link</span>
          </button>
        </div>
      </div>

      {inputMode === 'upload' ? (
        <div className="space-y-2">
          {value ? (
            /* Selected File / Image Preview */
            <div className="relative p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center gap-3 animate-fadeIn">
              {isImageValue ? (
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>File Selected & Attached</span>
                </div>
                <p className="text-xs font-medium text-white truncate">{fileName || 'Attached Document / Image'}</p>
                {fileSize && <p className="text-[10px] font-mono text-slate-400">{fileSize}</p>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-[11px] font-medium text-sky-300 hover:text-white bg-slate-700/80 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Dropzone / Upload area */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 group ${
                dragActive
                  ? 'border-sky-500 bg-sky-950/40 text-sky-300'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800/80 text-slate-400'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-sky-400 transition-colors shadow-inner">
                <UploadCloud className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-200 group-hover:text-white">
                  Click to choose from Phone or PC, or drag file here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* URL Input Mode */
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

