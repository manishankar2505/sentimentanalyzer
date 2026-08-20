import React from 'react';
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
  LineChart,
  Line,
  ReferenceLine,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, Smile, Users } from 'lucide-react';

const SENTIMENT_COLORS = {
  Positive: '#10b981', // emerald-500
  Negative: '#f43f5e', // rose-500
  Neutral: '#f59e0b',  // amber-500
};

const EMOTION_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e'];

export default function SentimentCharts({ data }) {
  if (!data) return null;

  const { overall, emotions, sentences, speakerComparison } = data;

  // 1. Sentiment Pie Data
  const breakdown = overall?.breakdown || { positive: 60, negative: 10, neutral: 30 };
  const pieData = [
    { name: 'Positive', value: breakdown.positive || 0, color: SENTIMENT_COLORS.Positive },
    { name: 'Negative', value: breakdown.negative || 0, color: SENTIMENT_COLORS.Negative },
    { name: 'Neutral', value: breakdown.neutral || 0, color: SENTIMENT_COLORS.Neutral },
  ].filter(d => d.value > 0);

  // 2. Progression Timeline Data (Scaled from -1.0 to +1.0 for true intuitive polarity)
  const timelineData = (sentences || []).map((s, idx) => {
    let numericScore = 0.0;
    if (s.sentiment === 'Positive') numericScore = s.score ? (s.score >= 0.5 ? s.score : 0.8) : 0.8;
    else if (s.sentiment === 'Negative') numericScore = s.score ? (s.score <= 0.5 ? - (1.0 - s.score) : -0.8) : -0.8;
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

  // 3. Emotion Bar Data
  const emotionData = (emotions || []).slice(0, 6).map((e, index) => ({
    name: e.emotion,
    count: e.count,
    percentage: e.percentage,
    fill: EMOTION_COLORS[index % EMOTION_COLORS.length]
  }));

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
      {/* 1. Main Prominent Chart: Sentiment Progression Arc (Full Width with clear X & Y Axes) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sentiment Progression Arc</h3>
              <p className="text-xs text-slate-500">Tracks real-time emotional shifts across every dialogue turn</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Positive Zone (+1)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Neutral (0)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Negative Zone (-1)
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 20, right: 30, left: 40, bottom: 30 }}>
              <defs>
                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              
              {/* X-Axis with Clear Title & Labels */}
              <XAxis
                dataKey="turn"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(val) => `Turn ${val}`}
                label={{
                  value: 'Dialogue Turn Number (Sequence of Conversation)',
                  position: 'insideBottom',
                  offset: -20,
                  fontSize: 12,
                  fontWeight: 600,
                  fill: '#475569'
                }}
              />

              {/* Y-Axis with Clear Labels and Title */}
              <YAxis
                domain={[-1, 1]}
                ticks={[-1, 0, 1]}
                tickFormatter={(val) => {
                  if (val === 1) return 'Positive (+1)';
                  if (val === -1) return 'Negative (-1)';
                  return 'Neutral (0)';
                }}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                width={100}
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

              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Neutral Baseline', position: 'right', fill: '#94a3b8', fontSize: 10 }} />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const isPos = d.sentiment === 'Positive';
                    const isNeg = d.sentiment === 'Negative';
                    return (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xl text-xs space-y-1.5 max-w-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">Turn #{d.turn} ({d.speaker})</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            isPos ? 'bg-emerald-100 text-emerald-800' :
                            isNeg ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {d.sentiment} ({d.score > 0 ? `+${d.score}` : d.score})
                          </span>
                        </div>
                        <p className="text-slate-600 italic line-clamp-3">"{d.text}"</p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          Detected Emotion: <span className="font-semibold text-slate-800">{d.emotion}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="url(#sentimentGradient)"
                dot={{ r: 5, fill: '#0284c7', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7, fill: '#0369a1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart A: Sentiment Distribution Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Sentiment Distribution</h3>
          </div>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Smile className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Emotion Expressions</h3>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [`${val} turns (${item.payload.percentage}%)`, 'Count']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {emotionData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart C: Customer vs Agent Sentiment Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Customer vs Agent Polarities</h3>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speakerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={32} formatter={(val) => <span className="text-xs font-semibold text-slate-700">{val}</span>} />
                <Bar dataKey="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
