import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import { api } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sentiment_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [text, setText] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('sentiment_api_key') || 'csk-45dcwn5dh492n3f489w9t9ynxf46dec9253wcvt94fxvtjjv';
  });

  const [model, setModel] = useState(() => {
    return localStorage.getItem('sentiment_model') || 'gpt-oss-120b';
  });

  // Verify stored token on startup
  useEffect(() => {
    const token = localStorage.getItem('sentiment_auth_token');
    if (token && !user) {
      api.getMe()
        .then((res) => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('sentiment_user', JSON.stringify(res.user));
          }
        })
        .catch(() => {
          localStorage.removeItem('sentiment_auth_token');
          localStorage.removeItem('sentiment_user');
          setUser(null);
        });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('sentiment_auth_token');
    localStorage.removeItem('sentiment_user');
    setUser(null);
    setAnalysisData(null);
    setText('');
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please provide or upload conversation text to analyze.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.analyzeText(text, apiKey, model);
      if (response && response.success) {
        setAnalysisData(response.data);
      } else {
        setError('Failed to process sentiment analysis. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Error occurred while connecting to AI backend.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100/60 font-sans">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-700 text-sm shadow-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!analysisData ? (
          <FileUpload
            text={text}
            setText={setText}
            onAnalyze={handleAnalyze}
            loading={loading}
          />
        ) : (
          <Dashboard
            data={analysisData}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Sentiment Analyzer • Full-Stack Assignment Solution</span>
          <span>Engine: Cerebras <code className="font-mono text-slate-600">gpt-oss-120b</code></span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
      />
    </div>
  );
}
