import React from 'react';
import { Smile, Frown, Meh, CheckCircle2, Users, FileText } from 'lucide-react';

export default function KpiCards({ data }) {
  if (!data) return null;

  const { overall, kpis, summary } = data;

  const getSentimentConfig = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          icon: Smile,
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50/70',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      case 'negative':
        return {
          icon: Frown,
          bg: 'bg-rose-500',
          lightBg: 'bg-rose-50/70',
          border: 'border-rose-200',
          text: 'text-rose-700',
          badge: 'bg-rose-100 text-rose-800'
        };
      default:
        return {
          icon: Meh,
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50/70',
          border: 'border-amber-200',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-800'
        };
    }
  };

  const sentimentConfig = getSentimentConfig(overall?.sentiment);
  const SentimentIcon = sentimentConfig.icon;

  const getResolutionBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'escalated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high':
      case 'medium-high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const numSpeakers = kpis?.numSpeakers || (kpis?.speakersBreakdown?.length || 2);
  const speakersList = kpis?.speakersBreakdown || [
    { speaker: 'Agent', percentage: 56, words: 120, turns: 6 },
    { speaker: 'Customer', percentage: 44, words: 95, turns: 5 }
  ];

  const summaryHeadline = kpis?.summaryHeadline || summary?.headline;
  const summaryText = kpis?.summaryOverview || summary?.overview || overall?.reasoning;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {/* KPI 1: Overall Sentiment & CSAT */}
      <div className={`p-5 rounded-2xl border ${sentimentConfig.border} ${sentimentConfig.lightBg} shadow-xs flex flex-col justify-between`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Sentiment & CSAT
          </span>
          <div className={`p-2 rounded-xl text-white ${sentimentConfig.bg} shadow-sm`}>
            <SentimentIcon className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black ${sentimentConfig.text}`}>
              {overall?.sentiment || 'Neutral'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({overall?.confidence || 85}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-3 pt-2.5 border-t border-slate-200/60">
            <span className="text-slate-600 font-medium">CSAT Score:</span>
            <span className="font-bold text-slate-900">{kpis?.csatScore ? Number(kpis.csatScore).toFixed(1) : '4.5'} / 5.0</span>
          </div>
        </div>
      </div>

      {/* KPI 2: Call Summary (Shown in Full) */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Call Summary
          </span>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1.5 flex-1">
          {summaryHeadline && (
            <div className="text-xs font-bold text-slate-900 leading-snug">
              {summaryHeadline}
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {summaryText}
          </p>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
          <span>Est. Duration: {kpis?.estimatedCallDuration || '2 min'}</span>
          <span>{kpis?.totalTurns || 0} Turns</span>
        </div>
      </div>

      {/* KPI 3: Persons Involved & Percentage of Talk */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Speakers & Talk Share
          </span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-3 flex-1">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-500 font-medium">Persons Involved:</span>
            <span className="font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs">
              {numSpeakers} {numSpeakers === 1 ? 'Person' : 'Persons'}
            </span>
          </div>

          {/* Speaker Percentage Breakdown */}
          <div className="space-y-2">
            {speakersList.map((sb, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700">
                  <span>{sb.speaker} ({sb.turns} turns)</span>
                  <span className="font-bold text-sky-700">{sb.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${idx === 0 ? 'bg-sky-500' : 'bg-indigo-500'}`}
                    style={{ width: `${sb.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
          <span>Dialogue Balance Active</span>
        </div>
      </div>

      {/* KPI 4: Resolution Status & Escalation Risk */}
      <div className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Resolution & Risk
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Resolution Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getResolutionBadge(kpis?.resolutionStatus)}`}>
              {kpis?.resolutionStatus || 'Resolved'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Escalation Risk:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadge(kpis?.escalationRisk)}`}>
              {kpis?.escalationRisk || 'Low'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Agent Empathy:</span>
            <span className="font-bold text-slate-800">{kpis?.agentEmpathyScore ? Number(kpis.agentEmpathyScore).toFixed(1) : '4.8'} / 5.0</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
          <span>Support Quality Metric</span>
        </div>
      </div>
    </div>
  );
}
