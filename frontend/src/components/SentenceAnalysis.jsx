import React, { useState } from 'react';
import { MessageSquare, Search, Filter, HelpCircle, User, Headset, ChevronDown, ChevronUp } from 'lucide-react';

export default function SentenceAnalysis({ sentences }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!sentences || sentences.length === 0) return null;

  const filteredSentences = sentences.filter((s) => {
    const matchesSearch = s.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.reasoning && s.reasoning.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpeaker = speakerFilter === 'ALL' ||
      (speakerFilter === 'AGENT' && s.speaker.toLowerCase().includes('agent')) ||
      (speakerFilter === 'CUSTOMER' && (s.speaker.toLowerCase().includes('customer') || s.speaker.toLowerCase().includes('caller') || s.speaker.toLowerCase().includes('client')));

    const matchesSentiment = sentimentFilter === 'ALL' ||
      s.sentiment.toUpperCase() === sentimentFilter;

    return matchesSearch && matchesSpeaker && matchesSentiment;
  });

  const getSentimentBadge = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'negative':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getEmotionBadge = (emotion) => {
    const e = emotion?.toLowerCase();
    if (e === 'joy' || e === 'satisfaction') return 'bg-emerald-100 text-emerald-800';
    if (e === 'frustration' || e === 'anger') return 'bg-rose-100 text-rose-800';
    if (e === 'relief') return 'bg-sky-100 text-sky-800';
    if (e === 'confusion') return 'bg-amber-100 text-amber-800';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sentence-Level Sentiment Analysis</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn-by-turn sentiment classification with AI reasoning and emotion labels
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white w-36 sm:w-44"
            />
          </div>

          {/* Speaker Filter */}
          <select
            value={speakerFilter}
            onChange={(e) => setSpeakerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Speakers</option>
            <option value="CUSTOMER">Customer Only</option>
            <option value="AGENT">Agent Only</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="ALL">All Sentiments</option>
            <option value="POSITIVE">Positive</option>
            <option value="NEGATIVE">Negative</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-400 font-medium">
        Showing {filteredSentences.length} of {sentences.length} turns
      </div>

      {/* List of Sentences */}
      <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
        {filteredSentences.map((s, idx) => {
          const isAgent = s.speaker?.toLowerCase().includes('agent');
          const isExpanded = expandedIndex === s.index;

          return (
            <div
              key={s.index || idx}
              className={`p-3.5 rounded-xl border transition-all ${
                isAgent
                  ? 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left Speaker & Text */}
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isAgent
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isAgent ? <Headset className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {s.speaker}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Turn #{s.index}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-sans">
                      "{s.text}"
                    </p>
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getSentimentBadge(s.sentiment)}`}>
                    {s.sentiment}
                  </span>

                  {s.emotion && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getEmotionBadge(s.emotion)}`}>
                      {s.emotion}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : s.index)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Toggle AI Reasoning"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible AI Reasoning */}
              {isExpanded && s.reasoning && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 text-xs text-slate-600 bg-sky-50/50 p-2.5 rounded-lg flex items-start gap-2">
                  <span className="font-semibold text-sky-700 shrink-0">AI Reasoning:</span>
                  <span>{s.reasoning}</span>
                </div>
              )}
            </div>
          );
        })}

        {filteredSentences.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs">
            No sentences matching current search and filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
