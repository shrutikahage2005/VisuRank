import React, { useState } from 'react';
import { Question } from '../types';
import { MathText } from './MathText';
import {
  Printer,
  X,
  FileText,
  CheckCircle2,
  Send,
  Download,
  BookOpen,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

interface PaperAssemblyModalProps {
  questions: Question[];
  onClose: () => void;
  onRemoveQuestion: (id: string) => void;
  onAssignPaper?: (paperData: {
    title: string;
    targetExam: any;
    timeLimitMinutes: number;
    totalMarks: number;
    assignedTo: string;
    assignedToLabel: string;
    instructions: string;
  }) => Promise<void>;
}

export const PaperAssemblyModal: React.FC<PaperAssemblyModalProps> = ({
  questions,
  onClose,
  onRemoveQuestion,
  onAssignPaper,
}) => {
  const [paperTitle, setPaperTitle] = useState('ALL INDIA COMPETITIVE ENTRANCE EXAMINATION');
  const [targetExam, setTargetExam] = useState<'JEE Main' | 'JEE Advanced' | 'NEET' | 'CBSE Board'>('JEE Main');
  const [testCode, setTestCode] = useState('TEST-BOOKLET-SET-A-2026');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(180);
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [assignedBatch, setAssignedBatch] = useState('all');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const questionsHtml = questions
      .map((q, idx) => {
        const diagramHtml = q.diagramSvg ? `<div style="text-align:center;margin:15px 0;">${q.diagramSvg}</div>` : '';
        const optionsHtml = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
            <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><strong>(A)</strong> ${q.options.A}</div>
            <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><strong>(B)</strong> ${q.options.B}</div>
            <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><strong>(C)</strong> ${q.options.C}</div>
            <div style="padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;"><strong>(D)</strong> ${q.options.D}</div>
          </div>
        `;
        return `
          <div style="margin-bottom:24px;padding:16px;border:1px solid #cbd5e1;border-radius:8px;page-break-inside:avoid;background:#ffffff;">
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:6px;">
              <span><strong>Q.${idx + 1}</strong> • ${q.subject} [${q.topic}]</span>
              <span>[+4, -1] • ${q.requiresDiagram ? 'Text + Diagram' : 'Text Only'}</span>
            </div>
            <div style="font-size:14px;color:#0f172a;line-height:1.6;font-weight:500;">${q.questionText}</div>
            ${diagramHtml}
            ${optionsHtml}
          </div>
        `;
      })
      .join('');

    const solutionsHtml = includeSolutions
      ? `
        <div style="page-break-before:always;margin-top:40px;">
          <h2 style="text-align:center;font-size:18px;border-bottom:2px solid #0f172a;padding-bottom:8px;margin-bottom:20px;">
            ANSWER KEY & STEP-BY-STEP DERIVATIONS
          </h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:12px;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="border:1px solid #cbd5e1;padding:6px;">Q.No</th>
                <th style="border:1px solid #cbd5e1;padding:6px;">Subject</th>
                <th style="border:1px solid #cbd5e1;padding:6px;">Correct Option</th>
                <th style="border:1px solid #cbd5e1;padding:6px;">Core Concept / Formula</th>
              </tr>
            </thead>
            <tbody>
              ${questions
                .map(
                  (q, idx) => `
                <tr>
                  <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;">Q.${idx + 1}</td>
                  <td style="border:1px solid #cbd5e1;padding:6px;">${q.subject}</td>
                  <td style="border:1px solid #cbd5e1;padding:6px;text-align:center;font-weight:bold;color:#047857;">(${q.correctAnswer})</td>
                  <td style="border:1px solid #cbd5e1;padding:6px;font-family:monospace;font-size:11px;">${q.solution?.conceptFormula || 'N/A'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          ${questions
            .map(
              (q, idx) => `
            <div style="margin-bottom:16px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;">
              <div style="font-weight:bold;color:#0f172a;margin-bottom:4px;">Q.${idx + 1} Solution (Key: ${q.correctAnswer})</div>
              <div style="color:#334155;line-height:1.5;">${q.solution.stepByStep.map((s) => `<div>• ${s}</div>`).join('')}</div>
              <div style="font-weight:bold;color:#047857;margin-top:6px;">${q.solution.finalAnswer}</div>
            </div>
          `
            )
            .join('')}
        </div>
      `
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${paperTitle} - VisuRank</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 40px; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div style="text-align:center;border-bottom:2px solid #0f172a;padding-bottom:12px;margin-bottom:20px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#475569;margin-bottom:4px;">
            PiyushAI Edtech Pvt. Ltd. & P. R. Pote Patil College of Engineering & Management
          </div>
          <h1 style="font-size:20px;margin:0 0 6px 0;text-transform:uppercase;">${paperTitle}</h1>
          <div style="font-size:12px;color:#334155;">
            Target: <strong>${targetExam}</strong> • Total Questions: <strong>${questions.length}</strong> • Max Marks: <strong>${totalMarks}</strong> • Time: <strong>${timeLimitMinutes} mins</strong>
          </div>
        </div>
        ${questionsHtml}
        ${solutionsHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_booklet.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAssign = async () => {
    if (!onAssignPaper) return;
    setIsAssigning(true);
    try {
      const batchLabels: Record<string, string> = {
        all: 'All Enrolled Batches',
        'JEE Main': 'JEE Main Batch',
        'JEE Advanced': 'JEE Advanced Batch',
        'NEET': 'NEET UG Medical Batch',
        'CBSE Board': 'CBSE Class 12 Batch',
      };
      await onAssignPaper({
        title: paperTitle,
        targetExam,
        timeLimitMinutes,
        totalMarks: questions.length * 4,
        assignedTo: assignedBatch,
        assignedToLabel: batchLabels[assignedBatch] || 'Selected Students',
        instructions: `Authentic NTA examination format. Marking Scheme: +4 for correct, -1 for incorrect, 0 for unattempted. Time limit: ${timeLimitMinutes} minutes.`,
      });
      setAssignSuccess(true);
      setTimeout(() => {
        setAssignSuccess(false);
      }, 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };

  const totalMarks = questions.length * 4;

  // Group questions by subject to replicate authentic multi-subject JEE/NEET paper
  const subjects = Array.from(new Set(questions.map((q) => q.subject))) as string[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Controls Header */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>NTA JEE & NEET Examination Paper Formatter</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Print & CBT Ready
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {questions.length} Questions ({questions.filter(q => q.requiresDiagram).length} with Diagrams, {questions.filter(q => !q.requiresDiagram).length} Text-Only) • {totalMarks} Maximum Marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onAssignPaper && (
              <button
                type="button"
                onClick={handleAssign}
                disabled={isAssigning || questions.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {assignSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Assigned Successfully!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isAssigning ? 'Publishing...' : 'Assign to Students'}
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
              title="Download standalone HTML booklet with embedded SVG diagrams"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export HTML</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Booklet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Toolbar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Examination Paper Title
            </label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="w-36">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Exam Target
            </label>
            <select
              value={targetExam}
              onChange={(e) => {
                const val = e.target.value as any;
                setTargetExam(val);
                if (val === 'JEE Main' || val === 'JEE Advanced') {
                  setTimeLimitMinutes(180);
                  setPaperTitle('ALL INDIA JOINT ENTRANCE EXAMINATION (JEE)');
                } else if (val === 'NEET') {
                  setTimeLimitMinutes(200);
                  setPaperTitle('NATIONAL ELIGIBILITY CUM ENTRANCE TEST (NEET UG)');
                } else {
                  setTimeLimitMinutes(180);
                  setPaperTitle('CENTRAL BOARD OF SECONDARY EDUCATION EXAMINATION');
                }
              }}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-medium bg-white"
            >
              <option value="JEE Main">JEE (Main) Format</option>
              <option value="JEE Advanced">JEE (Advanced) Format</option>
              <option value="NEET">NEET (UG) Format</option>
              <option value="CBSE Board">CBSE Board Format</option>
            </select>
          </div>

          <div className="w-32">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Booklet Code
            </label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-mono uppercase bg-white"
            />
          </div>

          <div className="w-24">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Time (Minutes)
            </label>
            <input
              type="number"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded font-medium bg-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-3.5">
            <input
              type="checkbox"
              id="sol-toggle"
              checked={includeSolutions}
              onChange={(e) => setIncludeSolutions(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="sol-toggle" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
              Attach Official Answer Key & Derivations
            </label>
          </div>
        </div>

        {/* REAL NTA JEE / NEET PRINTABLE QUESTION PAPER BOOKLET */}
        <div className="p-4 sm:p-8 md:p-12 flex-1 overflow-y-auto bg-slate-200/70 print:p-0 print:bg-white print:overflow-visible font-serif">
          <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 md:p-12 shadow-md rounded-none border border-slate-300 print:border-none print:shadow-none print:p-0">
            {/* 1. OFFICIAL QUESTION PAPER COVER & INSTRUCTIONS */}
            <div className="border-4 border-slate-900 p-6 mb-8 text-center bg-white space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  NATIONAL TESTING AGENCY (NTA) FORMAT
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 bg-slate-100 px-3 py-1 border border-slate-400">
                  BOOKLET CODE: {testCode}
                </span>
              </div>

              {/* Official Academic & Industry Attribution */}
              <div className="text-[10px] sm:text-[11px] font-sans font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 py-1.5 px-3 border border-slate-300">
                PiyushAI Edtech Pvt. Ltd. • P. R. Pote Patil College of Engineering & Management (Dept. of AI & Data Science) • Project Guide: Prof. Mohini Mohod
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                  {paperTitle}
                </h1>
                <p className="text-xs font-sans font-bold text-slate-600 mt-1 uppercase tracking-wider">
                  Test Target: {targetExam} • Series: SET-A • Academic Session 2026
                </p>
              </div>

              {/* Candidate Details & Invigilator Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-2 border-slate-800 p-4 font-sans text-xs bg-slate-50/50">
                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-600">Candidate's Name:</span>
                    <div className="border-b border-dotted border-slate-400 h-6 mt-0.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-600">Roll Number:</span>
                    <div className="border-b border-dotted border-slate-400 h-6 mt-0.5 font-mono" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-bold text-slate-600">Examination Centre Code:</span>
                    <div className="border-b border-dotted border-slate-400 h-6 mt-0.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Candidate's Sig.</span>
                      <div className="border-b border-slate-300 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Invigilator's Sig.</span>
                      <div className="border-b border-slate-300 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Time & Marks Strip */}
              <div className="flex items-center justify-between font-sans text-xs font-bold border-y-2 border-slate-900 py-2">
                <span>TIME ALLOWED: {timeLimitMinutes} MINUTES ({Math.floor(timeLimitMinutes / 60)} HOURS)</span>
                <span>MAXIMUM MARKS: {totalMarks} MARKS</span>
              </div>

              {/* Official Instructions */}
              <div className="text-left font-sans text-[11px] text-slate-700 space-y-1.5 leading-relaxed bg-slate-50 p-3.5 border border-slate-200">
                <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-1">
                  IMPORTANT INSTRUCTIONS FOR CANDIDATES:
                </h4>
                <p>1. The question paper booklet contains <strong>{questions.length} questions</strong>. All questions are compulsory.</p>
                <p>2. Questions are divided into subjects. Some questions contain pure text, and some questions contain integrated vector diagrams.</p>
                <p>3. <strong>Marking Scheme:</strong> For each correct answer, candidate will be awarded <strong className="text-emerald-700">+4 marks</strong>. For each incorrect answer, <strong className="text-rose-700">-1 mark</strong> will be deducted from the total score. Unattempted questions carry <strong>0 marks</strong>.</p>
                <p>4. Use blue or black ballpoint pen only for filling and darkening circles.</p>
                <p>5. <strong>Space for Rough Work</strong> is provided at the bottom of the examination pages. Rough work should not be done on the answer sheet.</p>
              </div>
            </div>

            {/* 2. QUESTIONS BODY DIVIDED BY SUBJECT */}
            <div className="space-y-10">
              {subjects.map((subj) => {
                const subjectQuestions = questions.filter((q) => q.subject === subj);
                return (
                  <div key={subj} className="space-y-6">
                    {/* Subject Header Banner */}
                    <div className="border-y-2 border-slate-900 py-2 text-center bg-slate-100 font-sans">
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900">
                        PART / SECTION: {subj.toUpperCase()}
                      </h2>
                      <span className="text-[10px] text-slate-600 font-medium">
                        Section A: Multiple Choice Questions (Single Correct Option • Marking: +4, -1)
                      </span>
                    </div>

                    {/* Question Items in this Subject */}
                    <div className="space-y-8">
                      {subjectQuestions.map((q) => {
                        const globalIndex = questions.findIndex((item) => item.id === q.id) + 1;
                        return (
                          <div
                            key={q.id}
                            className="font-sans text-xs space-y-3 pb-6 border-b border-slate-200 print:break-inside-avoid relative"
                          >
                            {/* Question Header & Remove Action */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1">
                                <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-mono">
                                  Q.{globalIndex}
                                </span>
                                <div className="font-medium text-slate-900 text-sm leading-relaxed pt-0.5">
                                  <MathText text={q.questionText} />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveQuestion(q.id)}
                                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 print:hidden shrink-0 border border-rose-200 px-2 py-0.5 rounded hover:bg-rose-50 transition-colors"
                              >
                                Remove
                              </button>
                            </div>

                            {/* DIAGRAM SECTION: Rendered if question requires diagram */}
                            {q.requiresDiagram && q.diagram && (
                              <div className="my-3 p-3 max-w-lg mx-auto bg-slate-50 border border-slate-300 rounded-lg shadow-2xs">
                                <div
                                  className="w-full h-auto flex items-center justify-center"
                                  dangerouslySetInnerHTML={{ __html: q.diagram.svgCode }}
                                />
                                <p className="text-[10px] text-center text-slate-600 font-bold italic mt-1.5">
                                  Figure: {q.diagram.caption || `${q.topic} Schematic Diagram`}
                                </p>
                              </div>
                            )}

                            {/* Format Badge (Text only vs Text + Diagram) */}
                            <div className="flex items-center gap-2 print:hidden">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                q.requiresDiagram ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {q.requiresDiagram ? 'Text + Diagram Question' : 'Text-Only Question'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {q.topic} • {q.difficulty}
                              </span>
                            </div>

                            {/* 4 CHOICES (A, B, C, D) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                              {q.options.map((opt) => (
                                <div
                                  key={opt.id}
                                  className="flex items-start gap-2.5 p-2 rounded border border-slate-200 bg-white"
                                >
                                  <span className="font-bold text-slate-900 font-mono">
                                    ({opt.label})
                                  </span>
                                  <span className="text-slate-800 pt-0.5">
                                    <MathText text={opt.text} />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SPACE FOR ROUGH WORK AT END OF EACH SUBJECT SECTION */}
                    <div className="border-2 border-dashed border-slate-400 p-4 rounded text-center my-6 bg-slate-50/50 print:break-inside-avoid">
                      <span className="font-mono font-bold text-xs uppercase tracking-widest text-slate-500">
                        SPACE FOR ROUGH WORK / ROUGH CALCULATIONS
                      </span>
                      <div className="h-20" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3. OFFICIAL ANSWER KEY & DERIVATIONS SHEET */}
            {includeSolutions && (
              <div className="mt-12 pt-8 border-t-4 border-slate-900 font-sans print:break-before-page space-y-6">
                <div className="text-center border-b-2 border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                    CONFIDENTIAL • EVALUATION DIVISION
                  </span>
                  <h2 className="text-lg font-black uppercase tracking-tight text-slate-900 mt-1">
                    OFFICIAL ANSWER KEY & STEP-BY-STEP DERIVATIONS
                  </h2>
                  <p className="text-xs text-slate-600">
                    Booklet Code: {testCode} • Marking Standard: +4 Marks for Correct Key
                  </p>
                </div>

                {/* Quick Answer Key Matrix Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 font-bold text-slate-800">
                        <th className="border border-slate-300 p-2">Q.No</th>
                        <th className="border border-slate-300 p-2">Subject</th>
                        <th className="border border-slate-300 p-2">Question Type</th>
                        <th className="border border-slate-300 p-2">Correct Option</th>
                        <th className="border border-slate-300 p-2">Concept Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, idx) => (
                        <tr key={q.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 font-mono font-bold">Q.{idx + 1}</td>
                          <td className="border border-slate-300 p-2">{q.subject}</td>
                          <td className="border border-slate-300 p-2">
                            {q.requiresDiagram ? 'Text + Diagram' : 'Text Only'}
                          </td>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-emerald-700">
                            ({q.correctAnswer})
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-600 font-mono text-[10px]">
                            {q.solution?.conceptFormula || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Step-by-step Detailed Derivations */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Detailed Step-by-Step Derivations:
                  </h3>
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          Q.{idx + 1} Solution — Correct Key: ({q.correctAnswer})
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {q.subject} • {q.topic}
                        </span>
                      </div>
                      <div className="text-xs text-slate-700 space-y-1">
                        {q.solution.stepByStep.map((step, sIdx) => (
                          <div key={sIdx}>
                            <MathText text={step} />
                          </div>
                        ))}
                      </div>
                      <div className="text-xs font-bold text-emerald-700 pt-1">
                        {q.solution.finalAnswer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
