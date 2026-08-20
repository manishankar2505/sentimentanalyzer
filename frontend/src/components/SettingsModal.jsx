import React, { useState } from 'react';
import { X, Key, Cpu, Check, RotateCcw } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey, model, setModel }) {
  if (!isOpen) return null;

  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const [tempModel, setTempModel] = useState(model || 'gpt-oss-120b');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(tempApiKey);
    setModel(tempModel);
    localStorage.setItem('sentiment_api_key', tempApiKey);
    localStorage.setItem('sentiment_model', tempModel);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    const defaultKey = 'csk-45dcwn5dh492n3f489w9t9ynxf46dec9253wcvt94fxvtjjv';
    const defaultModel = 'gpt-oss-120b';
    setTempApiKey(defaultKey);
    setTempModel(defaultModel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cerebras AI Settings</h3>
              <p className="text-xs text-slate-500">Configure LLM parameters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Cerebras API Key</span>
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="csk-..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Default pre-configured key from assignment.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Cerebras Model</span>
            </label>
            <input
              type="text"
              value={tempModel}
              onChange={(e) => setTempModel(e.target.value)}
              placeholder="gpt-oss-120b"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Target model for high-throughput inference (e.g. <code className="font-mono text-slate-600">gpt-oss-120b</code>).
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
