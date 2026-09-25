import React, { useState } from 'react';
import {
  BrainCircuit,
  Database,
  ImageIcon,
  CheckCircle,
  ArrowDown,
  ArrowRight,
  GitFork,
  FileCheck,
  FileText,
  BarChart3,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface WorkflowPipelineProps {
  currentStage?: 'idle' | 'input' | 'filter' | 'rag' | 'question_gen' | 'diagram_decision' | 'diagram_gen' | 'answer_key' | 'teacher_review' | 'paper_assembly' | 'class_analytics' | 'student_receive' | 'student_attempt' | 'auto_check' | 'results' | 'completed';
  compact?: boolean;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentStage = 'completed',
  compact = false,
}) => {
  const [showFullModal, setShowFullModal] = useState(false);

  // Flowchart definition matching WhatsApp Image 2026-08-31 at 2.21.17 PM.jpeg
  const legend = [
    { label: 'Gemini AI', color: 'bg-blue-600 text-white border-blue-700' },
    { label: 'Firebase / Store', color: 'bg-indigo-700 text-white border-indigo-800' },
    { label: 'Decision Logic', color: 'bg-amber-700 text-white border-amber-800' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold text-slate-800 tracking-wide">
            VisuRank Dual-Path Architecture Pipeline
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Gemini
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-indigo-700 inline-block" /> Firebase
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-700 inline-block" /> Decision
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowFullModal(true)}
            className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Flowchart</span>
          </button>
        </div>
      </div>

      {/* Horizontal Quick Pipeline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { id: 'input', title: 'Teacher Input', desc: 'Subject, Topic, Difficulty', tag: 'Input' },
          { id: 'filter', title: 'Filter Selection', desc: 'Cascading Dropdowns', tag: 'Firebase' },
          { id: 'rag', title: 'RAG Retrieval', desc: 'NCERT / PYQ Chunks', tag: 'Firebase' },
          { id: 'question_gen', title: 'Question Gen', desc: 'Gemini Writes Question', tag: 'Gemini' },
          { id: 'diagram_decision', title: 'Diagram Needed?', desc: 'Visual Requirement', tag: 'Decision' },
          { id: 'answer_key', title: 'Answer Key', desc: 'KaTeX Derivations', tag: 'Gemini' },
          { id: 'dual_path', title: 'Teacher & Student Paths', desc: 'Assembly & CBT Analytics', tag: 'Dual Path' },
        ].map((step, idx) => {
          const isActive = currentStage === step.id || currentStage === 'completed';
          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                isActive
                  ? 'border-blue-300 bg-blue-50/30'
                  : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-400 font-bold">0{idx + 1}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  step.tag === 'Gemini' ? 'bg-blue-100 text-blue-800' :
                  step.tag === 'Firebase' ? 'bg-indigo-100 text-indigo-800' :
                  step.tag === 'Decision' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {step.tag}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-[11px] truncate">{step.title}</div>
              <div className="text-[10px] text-slate-500 truncate">{step.desc}</div>
            </div>
          );
        })}
      </div>

      {/* FULL ARCHITECTURE FLOWCHART MODAL - EXACTLY MATCHING USER'S UPLOADED FLOWCHART */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-600" />
                  <span>System Architecture: Dual-Path Multimodal RAG Engine</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Full architectural flow matching official VisuRank specifications
                </p>
              </div>
              <button
                onClick={() => setShowFullModal(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Close Flowchart
              </button>
            </div>

            {/* Modal Body - Visual Flowchart */}
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1 space-y-4 font-sans text-xs">
              {/* Legend row */}
              <div className="flex items-center justify-center gap-6 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#1D4ED8]" />
                  <span className="text-xs font-semibold text-slate-700">Gemini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#4338CA]" />
                  <span className="text-xs font-semibold text-slate-700">Firebase</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#9A3412]" />
                  <span className="text-xs font-semibold text-slate-700">Decision</span>
                </div>
              </div>

              {/* Node 1: Teacher input */}
              <div className="max-w-md mx-auto">
                <div className="bg-[#334155] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">Teacher input</div>
                  <div className="text-[11px] text-slate-300">Topic, subject, difficulty</div>
                </div>
                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Node 2: Filter selection (Firebase) */}
                <div className="bg-[#4338CA] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">Filter selection</div>
                  <div className="text-[11px] text-indigo-200">Subject to topic dropdowns</div>
                </div>
                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Node 3: RAG retrieval (Firebase) */}
                <div className="bg-[#4338CA] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">RAG retrieval</div>
                  <div className="text-[11px] text-indigo-200">Content plus similar questions</div>
                </div>
                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Node 4: Question generation (Gemini) */}
                <div className="bg-[#1D4ED8] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">Question generation</div>
                  <div className="text-[11px] text-blue-200">Gemini writes the question</div>
                </div>
                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Node 5: Diagram needed? (Decision) */}
                <div className="bg-[#9A3412] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">Diagram needed?</div>
                  <div className="text-[11px] text-amber-200">Classify visual requirement</div>
                </div>

                {/* Branch: Yes vs No */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Yes Branch (Gemini) */}
                  <div>
                    <div className="text-center text-[10px] font-bold text-slate-500 mb-1">yes ↓</div>
                    <div className="bg-[#1D4ED8] text-white p-3 rounded-xl shadow-xs text-center h-full flex flex-col justify-center">
                      <div className="font-bold text-xs">Generate diagram</div>
                      <div className="text-[10px] text-blue-200">Matched to question</div>
                    </div>
                  </div>

                  {/* No Branch (Text only) */}
                  <div>
                    <div className="text-center text-[10px] font-bold text-slate-500 mb-1">no ↓</div>
                    <div className="bg-[#334155] text-white p-3 rounded-xl shadow-xs text-center h-full flex flex-col justify-center">
                      <div className="font-bold text-xs">Skip diagram</div>
                      <div className="text-[10px] text-slate-300">Text-only question</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center my-1 text-slate-400">
                  <ArrowDown className="w-4 h-4" />
                </div>

                {/* Node 6: Answer key (Gemini) */}
                <div className="bg-[#1D4ED8] text-white p-3 rounded-xl shadow-xs text-center">
                  <div className="font-bold text-sm">Answer key</div>
                  <div className="text-[11px] text-blue-200">Gemini generates model answer</div>
                </div>
              </div>

              {/* DUAL PATH FORK */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                {/* TEACHER PATH */}
                <div className="space-y-2">
                  <div className="bg-[#065F46] text-white p-2.5 rounded-xl text-center shadow-xs">
                    <div className="font-bold text-xs uppercase tracking-wider">Teacher path</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#334155] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Review and edit</div>
                    <div className="text-[10px] text-slate-300">Filter, review, edit</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#4338CA] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Paper assembly</div>
                    <div className="text-[10px] text-indigo-200">Export PDF, assign students</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#4338CA] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Class analytics</div>
                    <div className="text-[10px] text-indigo-200">View performance data</div>
                  </div>
                </div>

                {/* STUDENT PATH */}
                <div className="space-y-2">
                  <div className="bg-[#881337] text-white p-2.5 rounded-xl text-center shadow-xs">
                    <div className="font-bold text-xs uppercase tracking-wider">Student path</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#334155] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Receive paper</div>
                    <div className="text-[10px] text-slate-300">Assigned or mock test</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#334155] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Attempt questions</div>
                    <div className="text-[10px] text-slate-300">Including diagrams</div>
                  </div>
                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#1D4ED8] text-white p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="font-bold text-xs">Auto checking</div>
                    <div className="text-[10px] text-blue-200">Text plus diagram match</div>
                  </div>
                </div>
              </div>

              {/* COMMON ENDPOINT: Results and analytics */}
              <div className="max-w-md mx-auto pt-1">
                <div className="flex justify-center text-slate-400 mb-1">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div className="bg-[#4338CA] text-white p-3 rounded-xl text-center shadow-md">
                  <div className="font-bold text-sm">Results and analytics</div>
                  <div className="text-[11px] text-indigo-200">Shown to student and teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
