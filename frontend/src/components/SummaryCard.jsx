import React from 'react';
import { FileText, CheckSquare, Tag, Sparkles } from 'lucide-react';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const { headline, overview, keyTopics, actionItems } = summary;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Conversation Summary & Insights</h3>
      </div>

      {headline && (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block mb-1">Key Takeaway</span>
          <p className="text-sm font-semibold text-slate-800">{headline}</p>
        </div>
      )}

      {overview && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Executive Overview</span>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            {overview}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Topics */}
        {keyTopics && keyTopics.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Key Topics & Intents</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {keyTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-100 rounded-lg text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {actionItems && actionItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Recommended Action Items</span>
            </span>
            <div className="space-y-1.5">
              {actionItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/50 border border-emerald-100 p-2 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
