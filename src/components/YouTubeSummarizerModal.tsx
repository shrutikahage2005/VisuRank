import React, { useState } from 'react';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { Question } from '../types';
import {
  Youtube,
  Play,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  BookOpen,
  FileText,
  AlertTriangle,
  Plus,
  ArrowRight,
  Video
} from 'lucide-react';

interface YouTubeSummarizerModalProps {
  onClose: () => void;
  onAddQuestionToBank?: (question: Question) => void;
}

const PRESET_LECTURES = [
  {
    title: 'Rotational Motion & Moment of Inertia — HC Verma',
    subject: 'Physics',
    topic: 'Rotational Dynamics & Torque',
    url: 'https://www.youtube.com/watch?v=hcverma_rotational_dynamics',
  },
  {
    title: 'Thin Lens Formula & Ray Optics Prism Refraction',
    subject: 'Physics',
    topic: 'Ray Optics',
    url: 'https://www.youtube.com/watch?v=ray_optics_lens_formula',
  },
  {
    title: 'First Law of Thermodynamics & PV Work Done',
    subject: 'Physics',
    topic: 'Thermodynamics',
    url: 'https://www.youtube.com/watch?v=thermo_pv_diagrams',
  },
  {
    title: 'Electrophilic Aromatic Substitution & Benzene Mechanisms',
    subject: 'Chemistry',
    topic: 'Organic Chemistry',
    url: 'https://www.youtube.com/watch?v=benzene_nitration_mechanisms',
  },
];

export const YouTubeSummarizerModal: React.FC<YouTubeSummarizerModalProps> = ({
  onClose,
  onAddQuestionToBank,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [topic, setTopic] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [addedQuestionIds, setAddedQuestionIds] = useState<Record<string, boolean>>({});

  const handleSelectPreset = (p: typeof PRESET_LECTURES[0]) => {
    setVideoUrl(p.url);
    setSubject(p.subject as any);
    setTopic(p.topic);
    setSummaryData(null);
    setErrorMsg(null);
  };

  const handleSummarize = async () => {
    if (!videoUrl && !topic) {
      setErrorMsg('Please enter a YouTube video URL or select a lecture topic.');
      return;
    }

    setIsSummarizing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/youtube-summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl || topic,
          subject,
          topic,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to summarize video lecture');
      }

      setSummaryData(data.summary);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error processing lecture summarization');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleAddSingleQuestion = (q: any) => {
    if (!onAddQuestionToBank) return;
    const formattedQuestion: Question = {
      id: q.id || `yt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      subject: (summaryData.subject as any) || subject,
      topic: summaryData.topic || topic || 'Lecture Practice',
      subtopic: 'Video Lecture Synchronized',
      difficulty: 'JEE Main',
      questionType: 'mcq_single',
      questionText: q.questionText,
      requiresDiagram: Boolean(q.diagram),
      diagramType: q.diagramType || 'circuit',
      diagram: q.diagram,
      options: q.options?.map((opt: any, idx: number) => ({
        id: `opt-${idx}`,
        label: opt.label,
        text: opt.text,
        isCorrect: opt.label === q.correctAnswer,
      })) || [],
      correctAnswer: q.correctAnswer,
      solution: q.solution || {
        stepByStep: q.solutionSteps || [],
        finalAnswer: q.finalAnswer || '',
        conceptFormula: summaryData.formulaSheet?.[0] || '',
        diagramInsight: 'Generated from lecture video concept.',
      },
      reviewStatus: 'approved',
      scorePrediction: {
        jeeDifficultyScore: 60,
        discriminationIndex: 0.70,
        expectedAccuracyRate: 55,
        rankImpact: 'High',
        topicWeightage: 'Standard High-Yield Chapter',
      },
      ragMetadata: {
        retrievedChunks: [],
        similarQuestionRef: `Derived from lecture: ${summaryData.lectureTitle}`,
      },
      createdAt: new Date().toISOString(),
    };

    onAddQuestionToBank(formattedQuestion);
    setAddedQuestionIds((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleAddAllQuestions = () => {
    if (!summaryData?.generatedQuestions) return;
    summaryData.generatedQuestions.forEach((q: any) => handleAddSingleQuestion(q));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  YouTube Lecture Summarizer & Practice Generator
                </h3>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  AI Video Synthesis
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Transform competitive lecture videos into concise formula sheets and auto-generated multimodal quizzes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form Controls */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  YouTube Lecture Link or Video Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Video className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or 'HC Verma Ray Optics'"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-red-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject Domain
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-red-500"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
            </div>

            {/* Quick presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Quick high-yield lecture presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_LECTURES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-300 text-slate-700 hover:text-red-700 text-xs font-medium transition-all shadow-2xs"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing || (!videoUrl && !topic)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSummarizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Lecture & Generating Multimodal Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Summarize Lecture & Auto-Generate Multimodal Quiz</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {summaryData && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              {/* Lecture Overview Strip */}
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 uppercase tracking-wider">
                    Lecture Synthesis Ready
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">
                    {summaryData.lectureTitle}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Speaker: {summaryData.channelOrSpeaker || 'Master Faculty'} • Duration: {summaryData.duration || 'approx 35 mins'}
                  </p>
                </div>

                {onAddQuestionToBank && (
                  <button
                    onClick={handleAddAllQuestions}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add All ({summaryData.generatedQuestions?.length || 0}) to Question Bank</span>
                  </button>
                )}
              </div>

              {/* Core Concepts */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Key Lecture Concepts:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {summaryData.keyConcepts?.map((concept: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[10px] font-bold mr-2 mb-1">
                        {idx + 1}
                      </span>
                      {concept}
                    </div>
                  ))}
                </div>
              </div>

              {/* Formula Sheet */}
              {summaryData.formulaSheet && summaryData.formulaSheet.length > 0 && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 block">
                    Lecture Formula Cheat Sheet:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {summaryData.formulaSheet.map((formula: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-indigo-200 text-indigo-950 font-bold"
                      >
                        <MathText text={`$$${formula}$$`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Pitfalls */}
              {summaryData.commonExamMistakes && summaryData.commonExamMistakes.length > 0 && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Common Exam Traps Highlighted in this Lecture:</span>
                  </span>
                  <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                    {summaryData.commonExamMistakes.map((trap: string, idx: number) => (
                      <li key={idx}>{trap}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Auto-Generated Multimodal Questions */}
              <div className="space-y-4 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span>Synchronized Practice Questions Generated from this Lecture:</span>
                </span>

                <div className="space-y-4">
                  {summaryData.generatedQuestions?.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span>Practice Question {idx + 1}</span>
                        </span>

                        {onAddQuestionToBank && (
                          <button
                            onClick={() => handleAddSingleQuestion(q)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1"
                          >
                            {addedQuestionIds[q.id] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add to Bank</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-slate-800 font-medium">
                        <MathText text={q.questionText} />
                      </div>

                      {q.diagram && (
                        <div className="my-2 max-w-sm">
                          <DiagramViewer diagram={q.diagram} editable={false} />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options?.map((opt: any, oIdx: number) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border ${
                              opt.label === q.correctAnswer
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{opt.label}.</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Solution */}
                      {q.solution && (
                        <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 text-slate-600">
                          <strong className="text-slate-900 block text-[11px]">
                            Derivation from Video Principles:
                          </strong>
                          {q.solution.stepByStep?.map((s: string, sIdx: number) => (
                            <p key={sIdx}><MathText text={s} /></p>
                          ))}
                          <p className="text-emerald-700 font-bold mt-1">
                            {q.solution.finalAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
