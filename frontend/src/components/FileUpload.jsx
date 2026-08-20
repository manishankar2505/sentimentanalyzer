import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

export default function FileUpload({ text, setText, onAnalyze, loading }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      alert('Please upload a .txt file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result || '');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setText('');
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const lineCount = text ? text.split('\n').filter(l => l.trim().length > 0).length : 0;
  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Intro */}
      <div className="text-center space-y-2 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upload & Analyze Call Conversation
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Upload a customer call transcript (.txt) or paste conversation text to analyze sentiment, turn-by-turn emotions, and call KPIs via Cerebras <span className="text-sky-600 font-semibold font-mono">gpt-oss-120b</span>.
        </p>
      </div>

      {/* Upload Zone & Editor */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        {/* Drag Drop Area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-sky-500 bg-sky-50'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <span className="font-semibold text-sm text-sky-600 hover:underline">
                Click to browse
              </span>
              <span className="text-sm text-slate-500"> or drag and drop your .txt conversation file</span>
            </div>
            <p className="text-xs text-slate-400">Supported format: Plain Text (.txt)</p>
          </div>
        </div>

        {/* File Name Tag if uploaded */}
        {fileName && (
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <FileText className="w-4 h-4 text-sky-600" />
              <span className="font-medium">{fileName}</span>
              <span className="text-slate-400">({lineCount} lines, {wordCount} words)</span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Text Area for Direct Editing or Viewing */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Conversation Transcript Text</span>
            <span>{lineCount} lines • {wordCount} words</span>
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Agent: Thank you for calling. How can I help you today?\nCustomer: Hello, I have a question regarding my latest statement...`}
            className="w-full p-4 font-mono text-xs leading-relaxed bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-800 resize-y"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            disabled={loading || !text.trim()}
            onClick={onAnalyze}
            className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing with Cerebras AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Sentiment & KPIs</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
