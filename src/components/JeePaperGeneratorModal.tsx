import React, { useState } from 'react';
import { Question, Subject, TargetExam, AssignedPaper } from '../types';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { generateSubjectWiseCustomPaper, SubjectSelectionConfig } from '../lib/ntaPatternGenerator';
import {
  Sparkles,
  FileText,
  Clock,
  Award,
  CheckCircle2,
  Send,
  Printer,
  X,
  Sliders,
  Check,
  RefreshCw,
  Eye,
  Shuffle,
  Dices,
} from 'lucide-react';

interface JeePaperGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onAssignPaper: (paper: AssignedPaper) => Promise<void>;
  onOpenPaperAssembly: (questionIds: string[]) => void;
}

export interface SubjectSetting {
  subject: Subject;
  total: number;
  diagrams: number;
  text: number;
}

export const JeePaperGeneratorModal: React.FC<JeePaperGeneratorModalProps> = ({
  isOpen,
  onClose,
  questions,
  onAddQuestion,
  onAssignPaper,
  onOpenPaperAssembly,
}) => {
  // Configuration options
  const [targetExam, setTargetExam] = useState<TargetExam>('JEE Main');
  const [paperTitle, setPaperTitle] = useState('JEE Main Official Multimodal Practice Paper 2026');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(60);

  // Subject-wise configuration with diagram vs text distribution
  const [subjectSettings, setSubjectSettings] = useState<SubjectSetting[]>([
    { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
    { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
    { subject: 'Mathematics', total: 10, diagrams: 3, text: 7 },
  ]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaperQuestions, setGeneratedPaperQuestions] = useState<Question[]>([]);
  const [activeSection, setActiveSection] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('all');
  const [formatFilter, setFormatFilter] = useState<'all' | 'diagram' | 'text'>('all');
  const [assignedSuccess, setAssignedSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<'paper' | 'answer_key'>('paper');

  if (!isOpen) return null;

  // Aggregate totals
  const totalQuestions = subjectSettings.reduce((acc, s) => acc + s.total, 0);
  const totalDiagrams = subjectSettings.reduce((acc, s) => acc + s.diagrams, 0);
  const totalText = subjectSettings.reduce((acc, s) => acc + s.text, 0);
  const totalMarks = totalQuestions * 4;

  const handleTargetExamChange = (exam: TargetExam) => {
    setTargetExam(exam);
    if (exam === 'NEET') {
      setPaperTitle('NEET UG Official Multimodal Practice Paper 2026');
      setTimeLimitMinutes(90);
      setSubjectSettings([
        { subject: 'Physics', total: 15, diagrams: 7, text: 8 },
        { subject: 'Chemistry', total: 15, diagrams: 5, text: 10 },
        { subject: 'Biology', total: 30, diagrams: 12, text: 18 },
      ]);
    } else {
      setPaperTitle(`${exam} Official Multimodal Practice Paper 2026`);
      setTimeLimitMinutes(60);
      setSubjectSettings([
        { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
        { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
        { subject: 'Mathematics', total: 10, diagrams: 3, text: 7 },
      ]);
    }
  };

  // Modify total questions for a specific subject
  const updateSubjectTotal = (subj: Subject, newTotal: number) => {
    const val = Math.max(1, newTotal);
    setSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        // Keep diagram ratio roughly proportional
        const currentRatio = s.total > 0 ? s.diagrams / s.total : 0.5;
        const newDiag = Math.min(val, Math.max(0, Math.round(val * currentRatio)));
        return {
          ...s,
          total: val,
          diagrams: newDiag,
          text: val - newDiag,
        };
      })
    );
  };

  // Modify diagram questions for a specific subject
  const updateSubjectDiagrams = (subj: Subject, newDiagrams: number) => {
    setSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const validDiag = Math.max(0, Math.min(s.total, newDiagrams));
        return {
          ...s,
          diagrams: validDiag,
          text: s.total - validDiag,
        };
      })
    );
  };

  // Modify text questions for a specific subject
  const updateSubjectText = (subj: Subject, newText: number) => {
    setSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const validText = Math.max(0, Math.min(s.total, newText));
        return {
          ...s,
          diagrams: s.total - validText,
          text: validText,
        };
      })
    );
  };

  // Randomize diagram and text distribution for a single subject
  const randomizeSingleSubject = (subj: Subject) => {
    setSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        // Pick random diagram percentage between 20% and 80%
        const randomRatio = 0.2 + Math.random() * 0.6;
        const diag = Math.max(0, Math.min(s.total, Math.round(s.total * randomRatio)));
        return {
          ...s,
          diagrams: diag,
          text: s.total - diag,
        };
      })
    );
  };

  // Randomize diagram and text distribution for ALL subjects randomly
  const randomizeAllSubjects = () => {
    setSubjectSettings((prev) =>
      prev.map((s) => {
        const randomRatio = 0.15 + Math.random() * 0.7; // 15% to 85%
        const diag = Math.max(0, Math.min(s.total, Math.round(s.total * randomRatio)));
        return {
          ...s,
          diagrams: diag,
          text: s.total - diag,
        };
      })
    );
  };

  // Apply quick ratio across all subjects
  const applyPresetRatio = (diagramPercentage: number) => {
    setSubjectSettings((prev) =>
      prev.map((s) => {
        const diag = Math.round((s.total * diagramPercentage) / 100);
        return {
          ...s,
          diagrams: diag,
          text: s.total - diag,
        };
      })
    );
  };

  // Apply Standard Competitive Exam Presets
  const applyExamPreset = (preset: 'jee75' | 'neet180' | 'mock30' | 'quick15') => {
    if (preset === 'jee75') {
      setTargetExam('JEE Main');
      setPaperTitle('NTA JEE Main 2026 Full Simulation Paper (75 Questions)');
      setTimeLimitMinutes(180);
      setSubjectSettings([
        { subject: 'Physics', total: 25, diagrams: 12, text: 13 },
        { subject: 'Chemistry', total: 25, diagrams: 8, text: 17 },
        { subject: 'Mathematics', total: 25, diagrams: 5, text: 20 },
      ]);
    } else if (preset === 'neet180') {
      setTargetExam('NEET');
      setPaperTitle('NTA NEET-UG 2026 Full Simulation Examination (180 Questions)');
      setTimeLimitMinutes(200);
      setSubjectSettings([
        { subject: 'Physics', total: 45, diagrams: 20, text: 25 },
        { subject: 'Chemistry', total: 45, diagrams: 12, text: 33 },
        { subject: 'Biology', total: 90, diagrams: 40, text: 50 },
      ]);
    } else if (preset === 'mock30') {
      const isNeet = targetExam === 'NEET';
      setTimeLimitMinutes(60);
      setSubjectSettings(
        isNeet
          ? [
              { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
              { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
              { subject: 'Biology', total: 10, diagrams: 5, text: 5 },
            ]
          : [
              { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
              { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
              { subject: 'Mathematics', total: 10, diagrams: 3, text: 7 },
            ]
      );
    } else if (preset === 'quick15') {
      const isNeet = targetExam === 'NEET';
      setTimeLimitMinutes(30);
      setSubjectSettings(
        isNeet
          ? [
              { subject: 'Physics', total: 5, diagrams: 2, text: 3 },
              { subject: 'Chemistry', total: 5, diagrams: 2, text: 3 },
              { subject: 'Biology', total: 5, diagrams: 3, text: 2 },
            ]
          : [
              { subject: 'Physics', total: 5, diagrams: 3, text: 2 },
              { subject: 'Chemistry', total: 5, diagrams: 2, text: 3 },
              { subject: 'Mathematics', total: 5, diagrams: 1, text: 4 },
            ]
      );
    }
  };

  // Generate Paper with Subject-Wise Configuration
  const handleGenerateJeePaper = async () => {
    setIsGenerating(true);
    setAssignedSuccess(false);

    const subjectConfigs: SubjectSelectionConfig[] = subjectSettings.map((s) => ({
      subject: s.subject,
      totalQuestions: s.total,
      diagramCount: s.diagrams,
      textCount: s.text,
    }));

    try {
      const res = await fetch('/api/papers/generate-subject-wise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetExam,
          title: paperTitle,
          timeLimitMinutes,
          subjectConfigs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.paper && Array.isArray(data.paper.questions) && data.paper.questions.length > 0) {
          setGeneratedPaperQuestions(data.paper.questions);
          return;
        }
      }

      // Deterministic client fallback if server fails
      const fallbackPaper = generateSubjectWiseCustomPaper({
        targetExam,
        title: paperTitle,
        timeLimitMinutes,
        subjectConfigs,
      });
      setGeneratedPaperQuestions(fallbackPaper.questions);
    } catch (e) {
      console.error('Error generating subject-wise paper:', e);
      const fallbackPaper = generateSubjectWiseCustomPaper({
        targetExam,
        title: paperTitle,
        timeLimitMinutes,
        subjectConfigs,
      });
      setGeneratedPaperQuestions(fallbackPaper.questions);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAssignToCohort = async () => {
    if (generatedPaperQuestions.length === 0) return;

    const newAssignedPaper: AssignedPaper = {
      id: `paper-subj-${Date.now()}`,
      title: paperTitle,
      targetExam,
      subject: 'All' as any,
      instructions: `Subject-Configured Official CBT Simulation. Total: ${totalQuestions} Questions (${totalDiagrams} Diagrams, ${totalText} Text-Only). Marking: +4 for correct, -1 for incorrect attempt, 0 for unattempted.`,
      timeLimitMinutes,
      totalMarks: generatedPaperQuestions.length * 4,
      questions: generatedPaperQuestions,
      assignedTo: targetExam,
      assignedToLabel: `${targetExam} Aspirants Batch`,
      assignedBy: 'Prof. Mohini Mohod / Faculty',
      createdAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await onAssignPaper(newAssignedPaper);
    setAssignedSuccess(true);
    setTimeout(() => setAssignedSuccess(false), 3500);
  };

  const filteredPreviewQuestions = generatedPaperQuestions.filter((q) => {
    if (activeSection !== 'all' && q.subject !== activeSection) return false;
    if (formatFilter === 'diagram' && !q.requiresDiagram) return false;
    if (formatFilter === 'text' && q.requiresDiagram) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[94vh]">
        {/* MODAL HEADER */}
        <div className="bg-[#0F172A] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-extrabold text-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight text-white">
                  Subject-Wise Question Paper Studio
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Diagram & Text Customizer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                PiyushAI Edtech • Set exact subject question counts, custom diagram ratios, or randomize on demand
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* EXAM & METADATA CONFIG */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Paper Metadata & Target Exam</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Official NTA +4 / -1 Marking
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Paper Title */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700">Exam Title / Paper Header</label>
                <input
                  type="text"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Target Exam */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Competitive Exam</label>
                <select
                  value={targetExam}
                  onChange={(e) => handleTargetExamChange(e.target.value as TargetExam)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="JEE Main">JEE Main (Physics, Chem, Math)</option>
                  <option value="JEE Advanced">JEE Advanced (High Rigor)</option>
                  <option value="NEET">NEET UG (Physics, Chem, Biology)</option>
                </select>
              </div>
            </div>

            {/* QUICK PRESET BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>Quick Patterns:</span>
                <button
                  type="button"
                  onClick={() => applyExamPreset('jee75')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  Official JEE 75 Qs
                </button>
                <button
                  type="button"
                  onClick={() => applyExamPreset('neet180')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  Official NEET 180 Qs
                </button>
                <button
                  type="button"
                  onClick={() => applyExamPreset('mock30')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  30 Qs Mock
                </button>
                <button
                  type="button"
                  onClick={() => applyExamPreset('quick15')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold shadow-2xs cursor-pointer transition-colors"
                >
                  15 Qs Drill
                </button>
              </div>

              {/* GLOBAL RANDOMIZE / RATIO ACTIONS */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={randomizeAllSubjects}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
                  title="Randomly picks diagram & text distribution across all subjects"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>🎲 Randomize All (Diagram & Text)</span>
                </button>

                <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => applyPresetRatio(50)}
                    className="px-2 py-0.5 hover:bg-slate-100 rounded font-semibold text-slate-700 cursor-pointer"
                  >
                    50/50 Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetRatio(70)}
                    className="px-2 py-0.5 hover:bg-slate-100 rounded font-semibold text-emerald-700 cursor-pointer"
                  >
                    70% Diagrams
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetRatio(30)}
                    className="px-2 py-0.5 hover:bg-slate-100 rounded font-semibold text-indigo-700 cursor-pointer"
                  >
                    70% Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SUBJECT-WISE SELECTION OF QUESTION NUMBER, DIAGRAM & TEXT */}
          {/* ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Subject-Wise Question & Diagram Configuration</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase">
                    Interactive Controls
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select exact question counts for each subject and specify diagram vs text proportions or click 🎲 Randomize.
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500">Exam Duration: </span>
                <select
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-md px-2 py-1 font-bold text-slate-800 text-xs focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                  <option value={180}>180 Minutes (3 Hrs)</option>
                  <option value={200}>200 Minutes (NEET)</option>
                </select>
              </div>
            </div>

            {/* SUBJECT CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjectSettings.map((s) => {
                const diagPercent = s.total > 0 ? Math.round((s.diagrams / s.total) * 100) : 0;
                const textPercent = 100 - diagPercent;

                return (
                  <div
                    key={s.subject}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                  >
                    {/* Subject Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {s.subject === 'Physics' ? '⚛️' : s.subject === 'Chemistry' ? '🧪' : s.subject === 'Mathematics' ? '📐' : '🧬'}
                        </span>
                        <span className="font-extrabold text-sm text-slate-900">{s.subject}</span>
                      </div>

                      {/* Randomize Single Subject Button */}
                      <button
                        type="button"
                        onClick={() => randomizeSingleSubject(s.subject)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold transition-colors cursor-pointer"
                        title={`Randomize diagram vs text for ${s.subject}`}
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>🎲 Randomize</span>
                      </button>
                    </div>

                    {/* Subject Total Questions */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-700">Total {s.subject} Questions:</label>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {s.total} Qs ({s.total * 4} Marks)
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={60}
                        value={s.total}
                        onChange={(e) => updateSubjectTotal(s.subject, Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Diagram vs Text Breakdown */}
                    <div className="bg-slate-50 rounded-lg p-2.5 space-y-2 border border-slate-100 text-xs">
                      {/* Diagram Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Diagrams:</span>
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            {s.diagrams} ({diagPercent}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={s.total}
                          value={s.diagrams}
                          onChange={(e) => updateSubjectDiagrams(s.subject, Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                      </div>

                      {/* Text-Only Slider */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-800">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Text-Only:</span>
                          </span>
                          <span className="font-mono font-bold text-indigo-700">
                            {s.text} ({textPercent}%)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={s.total}
                          value={s.text}
                          onChange={(e) => updateSubjectText(s.subject, Number(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Visual Ratio Progress Bar */}
                      <div className="pt-1">
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${diagPercent}%` }}
                            className="bg-emerald-500 h-full transition-all"
                            title={`${s.diagrams} Diagrams (${diagPercent}%)`}
                          />
                          <div
                            style={{ width: `${textPercent}%` }}
                            className="bg-indigo-500 h-full transition-all"
                            title={`${s.text} Text Only (${textPercent}%)`}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                          <span>{s.diagrams} Visual</span>
                          <span>{s.text} Theory/Numerical</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* LIVE SUMMARY BANNER */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-blue-300 block text-[10px] uppercase font-bold">Total Examination</span>
                  <span className="text-base font-extrabold text-white">
                    {totalQuestions} Questions ({totalMarks} Marks)
                  </span>
                </div>
                <div className="h-8 w-px bg-blue-700/60 hidden sm:block" />
                <div>
                  <span className="text-emerald-300 block text-[10px] uppercase font-bold">Vector Diagrams</span>
                  <span className="text-sm font-bold text-emerald-200">
                    {totalDiagrams} Questions ({totalQuestions > 0 ? Math.round((totalDiagrams / totalQuestions) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-8 w-px bg-blue-700/60 hidden sm:block" />
                <div>
                  <span className="text-indigo-300 block text-[10px] uppercase font-bold">Text-Only Problems</span>
                  <span className="text-sm font-bold text-indigo-200">
                    {totalText} Questions ({totalQuestions > 0 ? Math.round((totalText / totalQuestions) * 100) : 0}%)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateJeePaper}
                disabled={isGenerating || totalQuestions === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Paper...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Configured Paper ({totalQuestions} Qs)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* GENERATED PAPER PREVIEW SECTION */}
          {/* ========================================================= */}
          {generatedPaperQuestions.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Paper Header Ribbon */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                    <span>{targetExam} Simulation Paper</span>
                    <span>•</span>
                    <span>{generatedPaperQuestions.length} Questions</span>
                    <span>•</span>
                    <span>{timeLimitMinutes} Minutes</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mt-1">{paperTitle}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono">
                      {generatedPaperQuestions.filter((q) => q.requiresDiagram).length} Questions with Diagrams
                    </span>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md font-mono">
                      {generatedPaperQuestions.filter((q) => !q.requiresDiagram).length} Text-Only Questions
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
                    <button
                      onClick={() => setPreviewMode('paper')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        previewMode === 'paper' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Question Paper View
                    </button>
                    <button
                      onClick={() => setPreviewMode('answer_key')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                        previewMode === 'answer_key' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Solutions & Rubric
                    </button>
                  </div>

                  <button
                    onClick={handleAssignToCohort}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {assignedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Assigned to Students!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Assign to Students</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onOpenPaperAssembly(generatedPaperQuestions.map((q) => q.id));
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Printable Booklet</span>
                  </button>
                </div>
              </div>

              {/* Subject & Format Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2 text-xs">
                {/* Subject Tabs */}
                <div className="flex flex-wrap gap-1.5">
                  {(['all', ...subjectSettings.map((s) => s.subject)] as const).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setActiveSection(sec as any)}
                      className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        activeSection === sec
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sec === 'all' ? 'All Subjects' : sec}
                    </button>
                  ))}
                </div>

                {/* Format Filter */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setFormatFilter('all')}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      formatFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    All ({generatedPaperQuestions.length})
                  </button>
                  <button
                    onClick={() => setFormatFilter('diagram')}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      formatFilter === 'diagram' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Diagrams ({generatedPaperQuestions.filter((q) => q.requiresDiagram).length})</span>
                  </button>
                  <button
                    onClick={() => setFormatFilter('text')}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      formatFilter === 'text' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-indigo-700'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Text-Only ({generatedPaperQuestions.filter((q) => !q.requiresDiagram).length})</span>
                  </button>
                </div>
              </div>

              {/* QUESTION LIST */}
              <div className="space-y-4">
                {filteredPreviewQuestions.map((q, idx) => {
                  const globalIndex = generatedPaperQuestions.findIndex((gq) => gq.id === q.id) + 1;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Question meta & Format Badge */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                            Q{globalIndex}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Section: {q.subject}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {q.topic}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.requiresDiagram ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Text + Vector Diagram ({q.diagramType})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-300">
                              <FileText className="w-3 h-3 text-indigo-600" />
                              <span>Pure Text-Only ({q.questionType === 'numerical' ? 'Numerical Value' : 'Theory'})</span>
                            </span>
                          )}

                          <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            +4, -1
                          </span>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-sm font-medium text-slate-900 leading-relaxed">
                        <MathText text={q.questionText} />
                      </div>

                      {/* Synchronized Vector Diagram (If diagram question) */}
                      {q.requiresDiagram && q.diagram && (
                        <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200 max-w-xl mx-auto">
                          <DiagramViewer diagram={q.diagram} />
                        </div>
                      )}

                      {/* Options Grid or Numerical Indicator */}
                      {q.questionType === 'numerical' ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs flex items-center justify-between text-blue-900 font-medium">
                          <span>NTA Numerical Value Type Question. Enter decimal or integer value on keypad.</span>
                          {previewMode === 'answer_key' && (
                            <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-300">
                              Correct Value: {q.correctAnswer}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt) => {
                            const isCorrect = opt.label === q.correctAnswer;
                            const showHighlight = previewMode === 'answer_key' && isCorrect;

                            return (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2.5 transition-colors ${
                                  showHighlight
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                    : 'bg-slate-50/50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    showHighlight
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white text-slate-700 border border-slate-300'
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <div className="flex-1">
                                  <MathText text={opt.text} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Solution View (When in Answer Key Mode) */}
                      {previewMode === 'answer_key' && q.solution && (
                        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-amber-900">
                            <span>Step-by-Step Mathematical Derivation</span>
                            <span>Correct Answer: {q.questionType === 'numerical' ? q.correctAnswer : `Option ${q.correctAnswer}`}</span>
                          </div>
                          <div className="space-y-1 text-slate-700">
                            {q.solution.stepByStep.map((step, sIdx) => (
                              <div key={sIdx}>
                                <MathText text={step} />
                              </div>
                            ))}
                          </div>
                          {q.solution.conceptFormula && (
                            <div className="pt-2 border-t border-amber-200 text-amber-950 font-mono">
                              <strong>Key Governing Formula: </strong>
                              <MathText text={q.solution.conceptFormula} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Powered by NTA CBT Engine & Mathematical Vector SVG Schematics
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            {generatedPaperQuestions.length > 0 && (
              <button
                onClick={handleAssignToCohort}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Student Portals</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
