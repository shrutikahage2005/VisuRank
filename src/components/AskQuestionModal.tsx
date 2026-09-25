import React, { useState } from 'react';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { Sparkles, HelpCircle, Send, BrainCircuit, X, CheckCircle, ArrowRight } from 'lucide-react';
import { generateDiagramSvg } from '../lib/diagramRenderer';
import { DiagramType } from '../types';

interface AskQuestionModalProps {
  onClose: () => void;
  onQuestionGenerated?: (question: any) => void;
}

export const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  onClose,
  onQuestionGenerated,
}) => {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseResult, setResponseResult] = useState<any | null>(null);

  const samplePrompts = [
    'Generate a JEE Advanced question on convex lens real image with focal length 20 cm',
    'Create an electric circuit problem with parallel resistors and 24V DC battery',
    'Generate an incline plane problem with friction and pulley constraint',
    'Show a thermodynamic cyclic P-V indicator diagram and ask for work done',
    'Create an organic chemistry reaction question on electrophilic nitration of benzene',
  ];

  const handleAsk = async (promptToUse?: string) => {
    const text = promptToUse || query;
    if (!text.trim()) return;

    setIsProcessing(true);
    setResponseResult(null);

    try {
      const resp = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic: text,
          difficulty: 'JEE Main',
          questionType: 'mcq_single',
          customPrompt: text,
          forceDiagram: true,
        }),
      });

      const data = await resp.json();
      if (data.question) {
        setResponseResult(data.question);
        if (onQuestionGenerated) {
          onQuestionGenerated(data.question);
        }
      }
    } catch (err) {
      console.error('Ask Question error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Ask Question: Multimodal RAG & Diagram Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Ask any STEM topic or doubt to automatically retrieve concepts and generate questions with synchronized diagrams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input Section */}
        <div className="py-4 space-y-3 overflow-y-auto flex-1">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Target Subject:</label>
            <div className="flex items-center gap-1">
              {(['Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    subject === s
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Ask a question about an inclined plane with friction, or a parallel resistor network across 24V..."
              className="w-full p-3 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              onClick={() => handleAsk()}
              disabled={isProcessing || !query.trim()}
              className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              {isProcessing ? 'Synthesizing...' : 'Generate with Diagram'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Preset Ideas */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Prompt Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleAsk(p);
                  }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 border border-slate-200 rounded-lg text-xs transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Active Generation Loader */}
          {isProcessing && (
            <div className="p-6 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200 my-4">
              <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Executing RAG Multimodal Pipeline...
                </p>
                <p className="text-[11px] text-slate-500">
                  1. RAG Vector Retrieval ➔ 2. Visual Spec Classification ➔ 3. SVG Diagram Generator ➔ 4. Review Agent Validation
                </p>
              </div>
            </div>
          )}

          {/* Response Output Card */}
          {responseResult && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 my-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Generated Multimodal Question
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {responseResult.difficulty} • {responseResult.topic}
                </span>
              </div>

              <div className="text-sm font-medium text-slate-900 leading-relaxed">
                <MathText text={responseResult.questionText} />
              </div>

              {responseResult.diagram && (
                <DiagramViewer diagram={responseResult.diagram} editable={false} />
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {responseResult.options.map((opt: any) => (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-lg border ${
                      opt.isCorrect
                        ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-800'
                    }`}
                  >
                    <span className="font-bold mr-2">({opt.label})</span>
                    <MathText text={opt.text} />
                  </div>
                ))}
              </div>

              {/* Model derivation */}
              <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Derivation & Answer:</div>
                {responseResult.solution.stepByStep.map((s: string, idx: number) => (
                  <p key={idx}><MathText text={s} /></p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
