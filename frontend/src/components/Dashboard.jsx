import React from 'react';
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react';
import KpiCards from './KpiCards';
import SentimentCharts from './SentimentCharts';
import SentenceAnalysis from './SentenceAnalysis';

export default function Dashboard({ data, onNewAnalysis }) {
  if (!data) return null;

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `sentiment_analysis_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportText = () => {
    let report = `=================================================\n`;
    report += `CALL SENTIMENT & KPI INTELLIGENCE REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `=================================================\n\n`;

    report += `[OVERALL SENTIMENT]: ${data.overall?.sentiment?.toUpperCase()} (${data.overall?.confidence}% Confidence)\n`;
    report += `Reasoning: ${data.overall?.reasoning}\n\n`;

    report += `[CALL KPIS]:\n`;
    report += `- CSAT Score: ${data.kpis?.csatScore} / 5.0\n`;
    report += `- Speakers Involved: ${data.kpis?.numSpeakers || 2} persons (${data.kpis?.talkToListenRatio})\n`;
    report += `- Resolution Status: ${data.kpis?.resolutionStatus}\n`;
    report += `- Escalation Risk: ${data.kpis?.escalationRisk}\n`;
    report += `- Call Summary: ${data.kpis?.summaryHeadline || data.summary?.headline}\n\n`;

    report += `[EXECUTIVE SUMMARY]:\n`;
    report += `${data.kpis?.summaryOverview || data.summary?.overview}\n\n`;

    report += `[SENTENCE-LEVEL BREAKDOWN]:\n`;
    (data.sentences || []).forEach((s) => {
      report += `Turn #${s.index} [${s.speaker}]: "${s.text}" -> [${s.sentiment} - ${s.emotion}] (${s.reasoning})\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `sentiment_report_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Upload Another Call</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Text Report</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors border border-sky-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* 1. KPI Cards (Includes Sentiment, Call Summary KPI, Speakers & Talk Share %, Resolution/Risk) */}
      <KpiCards data={data} />

      {/* 2. Visual Charts (Sentiment Progression Arc with clear X/Y axes, Donut, Emotions, Speaker polarities) */}
      <SentimentCharts data={data} />

      {/* 3. Detailed Sentence-by-Sentence Breakdown */}
      <SentenceAnalysis sentences={data.sentences} />
    </div>
  );
}
