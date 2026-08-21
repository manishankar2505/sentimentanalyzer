import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Smile, Users, Info, Sparkles } from 'lucide-react';

const SENTIMENT_COLORS = {
  Positive: '#10b981', // emerald-500
  Negative: '#f43f5e', // rose-500
  Neutral: '#f59e0b',  // amber-500
};

const EMOTION_COLOR_MAP = {
  joy: '#10b981',
  satisfaction: '#0ea5e9',
  relief: '#06b6d4',
  confusion: '#a855f7',
  frustration: '#f59e0b',
  anger: '#ef4444',
  neutral: '#64748b'
};

// Custom Tooltip for Progression Arc
const ProgressionTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const isPos = d.sentiment === 'Positive';
    const isNeg = d.sentiment === 'Negative';
    const emotionColor = EMOTION_COLOR_MAP[d.emotion.toLowerCase()] || '#6366f1';

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/60 text-xs space-y-2 max-w-sm backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-100">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isPos ? '#10b981' : isNeg ? '#f43f5e' : '#f59e0b' }} />
            <span>Turn #{d.turn} • {d.speaker}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
            isPos ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            isNeg ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}>
            {d.sentiment} ({d.score > 0 ? `+${d.score}` : d.score})
          </span>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed italic bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
          "{d.text}"
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span>Detected Emotion:</span>
          <span className="font-semibold px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: `${emotionColor}40`, border: `1px solid ${emotionColor}80` }}>
            {d.emotion}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Dot Component with dynamic sentiment color
const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;

  let dotColor = '#f59e0b';
  if (payload.sentiment === 'Positive') dotColor = '#10b981';
  else if (payload.sentiment === 'Negative') dotColor = '#f43f5e';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={dotColor}
      stroke="#ffffff"
      strokeWidth={2}
      className="transition-all hover:scale-125 cursor-pointer shadow-md"
    />
  );
};

export default function SentimentCharts({ data }) {
  if (!data) return null;

  const { overall, emotions, sentences, speakerComparison } = data;
  const [selectedTurn, setSelectedTurn] = useState(null);

  // 1. Sentiment Pie Data
  const breakdown = overall?.breakdown || { positive: 60, negative: 10, neutral: 30 };
  const pieData = [
    { name: 'Positive', value: breakdown.positive || 0, color: SENTIMENT_COLORS.Positive },
    { name: 'Negative', value: breakdown.negative || 0, color: SENTIMENT_COLORS.Negative },
    { name: 'Neutral', value: breakdown.neutral || 0, color: SENTIMENT_COLORS.Neutral },
  ].filter(d => d.value > 0);

  // 2. Progression Timeline Data
  const timelineData = (sentences || []).map((s, idx) => {
    let numericScore = 0.0;
    if (s.sentiment === 'Positive') numericScore = s.score ? (s.score >= 0.5 ? s.score : 0.8) : 0.8;
    else if (s.sentiment === 'Negative') numericScore = s.score ? (s.score <= 0.5 ? -(1.0 - s.score) : -0.8) : -0.8;
    else numericScore = 0.0;

    return {
      turn: s.index || idx + 1,
      turnLabel: `Turn ${s.index || idx + 1}`,
      speaker: s.speaker,
      score: Number(numericScore.toFixed(2)),
      sentiment: s.sentiment,
      emotion: s.emotion || 'Neutral',
      text: s.text
    };
  });

  // Calculate Net Emotional Shift
  const startSentiment = timelineData[0]?.sentiment || 'Neutral';
  const endSentiment = timelineData[timelineData.length - 1]?.sentiment || 'Neutral';
  const startScore = timelineData[0]?.score || 0;
  const endScore = timelineData[timelineData.length - 1]?.score || 0;
  const netShift = Number((endScore - startScore).toFixed(2));

  // 3. Emotion Bar Data
  const emotionData = (emotions || []).slice(0, 6).map((e) => {
    const emotionKey = e.emotion.toLowerCase();
    return {
      name: e.emotion,
      count: e.count,
      percentage: e.percentage,
      fill: EMOTION_COLOR_MAP[emotionKey] || '#6366f1'
    };
  });

  // 4. Speaker Breakdown
  const speakerData = [
    {
      name: 'Customer',
      Positive: speakerComparison?.customer?.positiveTurns || 0,
      Negative: speakerComparison?.customer?.negativeTurns || 0,
    },
    {
      name: 'Agent',
      Positive: speakerComparison?.agent?.positiveTurns || 0,
      Negative: speakerComparison?.agent?.negativeTurns || 0,
    }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Main Prominent Chart: Sentiment Progression Arc */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col">
        {/* Header with Stats Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 mb-3 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-2xl border border-sky-100">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Sentiment Progression Arc</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  {timelineData.length} Turns Analyzed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time emotional trajectory & turn-by-turn polarity shifts</p>
            </div>
          </div>

          {/* Quick Shift Summary Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-200 font-medium text-slate-600">
              <span>Start:</span>
              <span className={`font-bold ${startSentiment === 'Positive' ? 'text-emerald-600' : startSentiment === 'Negative' ? 'text-rose-600' : 'text-amber-600'}`}>
                {startSentiment}
              </span>
              <span className="text-slate-400">➔</span>
              <span>End:</span>
              <span className={`font-bold ${endSentiment === 'Positive' ? 'text-emerald-600' : endSentiment === 'Negative' ? 'text-rose-600' : 'text-amber-600'}`}>
                {endSentiment}
              </span>
            </div>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <span className="flex items-center gap-1 font-medium text-emerald-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Positive (+1)
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Neutral (0)
              </span>
              <span className="flex items-center gap-1 font-medium text-rose-700 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Negative (-1)
              </span>
            </div>
          </div>
        </div>

        {/* Progression Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timelineData}
              margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedTurn(e.activePayload[0].payload);
                }
              }}
            >
              <defs>
                <linearGradient id="sentimentAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.35} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              {/* X-Axis */}
              <XAxis
                dataKey="turn"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => `Turn ${val}`}
                label={{
                  value: 'Dialogue Turn Number (Chronological Sequence)',
                  position: 'insideBottom',
                  offset: -20,
                  fontSize: 12,
                  fontWeight: 600,
                  fill: '#475569'
                }}
              />

              {/* Y-Axis */}
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, 0, 1]}
                tickFormatter={(val) => {
                  if (val === 1) return 'Positive (+1)';
                  if (val === -1) return 'Negative (-1)';
                  return 'Neutral (0)';
                }}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                width={105}
                label={{
                  value: 'Sentiment Polarity Level',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                  fontSize: 12,
                  fontWeight: 600,
                  fill: '#475569'
                }}
              />

              <ReferenceLine
                y={0}
                stroke="#cbd5e1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{ value: 'Neutral Baseline', position: 'right', fill: '#94a3b8', fontSize: 11 }}
              />

              <Tooltip content={<ProgressionTooltip />} />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#0284c7"
                strokeWidth={3}
                fill="url(#sentimentAreaGradient)"
                dot={<CustomizedDot />}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 3, fill: '#0369a1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Click Inspector Box */}
        {selectedTurn && (
          <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start justify-between gap-3 text-xs animate-fadeIn">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-900">Inspecting Turn #{selectedTurn.turn} ({selectedTurn.speaker}): </span>
                <span className="text-slate-700 italic">"{selectedTurn.text}"</span>
                <div className="mt-1 flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-slate-600">Sentiment: <b className="text-slate-900">{selectedTurn.sentiment} ({selectedTurn.score})</b></span>
                  <span>•</span>
                  <span className="font-semibold text-slate-600">Emotion: <b className="text-slate-900">{selectedTurn.emotion}</b></span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedTurn(null)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. Grid of Secondary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart A: Sentiment Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sentiment Distribution</h3>
              <p className="text-[11px] text-slate-400">Total conversation polarity share</p>
            </div>
          </div>

          <div className="h-60 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={82}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Emotion Detection Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Emotion Expressions</h3>
              <p className="text-[11px] text-slate-400">Frequency across primary emotional tones</p>
            </div>
          </div>

          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} turns (${item.payload.percentage}%)`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {emotionData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Customer vs Agent Sentiment Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Speaker Polarities</h3>
              <p className="text-[11px] text-slate-400">Turn polarity comparison by participant role</p>
            </div>
          </div>

          <div className="h-60 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speakerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={32} formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>} />
                <Bar dataKey="Positive" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Negative" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
