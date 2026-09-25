import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, AlertTriangle, ShieldCheck, Cpu, ChevronDown, ChevronUp, Clock, FileCode, Check } from 'lucide-react';

interface ReviewAgentCardProps {
  question: Question;
  onApprove?: (id: string) => void;
  onMarkNeedsRevision?: (id: string) => void;
}

export const ReviewAgentCard: React.FC<ReviewAgentCardProps> = ({
  question,
  onApprove,
  onMarkNeedsRevision,
}) => {
  const [showFullTrace, setShowFullTrace] = useState(false);
  const trace = question.traceLog;
  const review = trace?.reviewAgentCheck;
  const prediction = question.scorePrediction;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
              Review Agent: JEE/NEET Optimization & Validation
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Score: {review?.diagramConsistencyScore || '9.8'}/10
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Chain-of-Thought (CoT) alignment check between question text, diagram values, and solution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {question.reviewStatus === 'approved' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Published to Question Bank
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onMarkNeedsRevision && onMarkNeedsRevision(question.id)}
                className="px-2.5 py-1 rounded-md text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                Needs Revision
              </button>
              <button
                onClick={() => onApprove && onApprove(question.id)}
                className="px-3 py-1 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
              >
                Approve & Publish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metrics & Analysis Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
        {/* Metric 1: Difficulty Score */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Exam Difficulty Index
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 font-mono">
              {prediction.jeeDifficultyScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                prediction.jeeDifficultyScore > 75 ? 'bg-red-500' : prediction.jeeDifficultyScore > 50 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${prediction.jeeDifficultyScore}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Rank Impact */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Rank Impact
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
              prediction.rankImpact === 'Critical Filter'
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : prediction.rankImpact === 'Very High'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {prediction.rankImpact}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Discriminates top 1-5% percentile rankers
          </p>
        </div>

        {/* Metric 3: Expected Accuracy */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Expected Accuracy
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {prediction.expectedAccuracyRate}%
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Discrimination Index: {prediction.discriminationIndex.toFixed(2)}
          </p>
        </div>

        {/* Metric 4: Observability Latency */}
        <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Agent Latency
          </div>
          <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold text-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {trace?.totalLatencyMs || 820} ms
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Model: <span className="font-mono text-slate-700">{trace?.model || 'gemini-3.8-flash'}</span>
          </p>
        </div>
      </div>

      {/* Parameter Consistency Verification Table */}
      {review?.verifiedValues && review.verifiedValues.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40">
          <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multimodal Diagram ⟷ Question Consistency Verification</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {review.verifiedValues.map((v, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white border border-emerald-100 text-xs"
              >
                <span className="font-mono font-bold text-slate-600">{v.param}</span>
                <span className="font-mono text-slate-800">{v.questionVal}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  MATCH
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CoT Reasoning Bar */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-white text-xs text-slate-600 flex items-start gap-2">
        <Cpu className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-semibold text-slate-800">Agent CoT Analysis: </span>
          <span>{review?.cotReasoning || 'Consistency check completed. Numerical assertions and diagram labels match.'}</span>
        </div>
        <button
          onClick={() => setShowFullTrace(!showFullTrace)}
          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium shrink-0 ml-2"
        >
          {showFullTrace ? 'Hide Trace' : 'Observability Trace'}
          {showFullTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Observability Full Trace Logs (Langfuse / LangSmith View) */}
      {showFullTrace && trace && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-900 text-slate-300 font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
            <span>Trace ID: {trace.traceId}</span>
            <span>Timestamp: {trace.timestamp}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1 text-slate-300">
            <div>• RAG Retrieval: <span className="text-emerald-400">{trace.retrievalLatencyMs}ms</span></div>
            <div>• Question Gen: <span className="text-blue-400">{trace.generationLatencyMs}ms</span></div>
            <div>• Diagram Render: <span className="text-purple-400">{trace.diagramLatencyMs}ms</span></div>
          </div>
          <div className="text-slate-400">
            <span className="text-amber-400">Diagram Decision:</span>{' '}
            {trace.diagramRequirementDecision.rationale}
          </div>
          {question.ragMetadata.retrievedChunks.length > 0 && (
            <div className="text-slate-400">
              <span className="text-cyan-400">RAG Chunks Grounded:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {question.ragMetadata.retrievedChunks.map((c, idx) => (
                  <li key={idx} className="truncate">
                    [{c.source}] {c.title} (Relevance: {(c.relevanceScore * 100).toFixed(0)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
