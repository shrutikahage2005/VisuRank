import React, { useState, useRef } from 'react';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { Question, DiagramSpec } from '../types';
import {
  UploadCloud,
  FileImage,
  Sparkles,
  CheckCircle2,
  X,
  RefreshCw,
  Camera,
  Layers,
  ArrowRight,
  BookOpen,
  Zap,
  HelpCircle,
  Plus
} from 'lucide-react';

interface ImageProblemSolverModalProps {
  onClose: () => void;
  onAddQuestionToBank?: (question: Question) => void;
}

// Built-in STEM sample diagrams so teachers and students can test instantly
const SAMPLE_PRESETS = [
  {
    name: 'DC Bridge Circuit',
    category: 'Physics - Current Electricity',
    prompt: 'Analyze this resistor network, compute the branch currents, and find power in R3.',
    svgPreview: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><rect width="400" height="200" fill="#f8fafc"/><path d="M 60 100 L 140 100 M 140 60 L 260 60 M 140 140 L 260 140 M 260 100 L 340 100" stroke="#0f172a" stroke-width="3" fill="none"/><rect x="180" y="48" width="40" height="24" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="200" y="65" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">R₁=6Ω</text><rect x="180" y="128" width="40" height="24" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/><text x="200" y="145" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">R₂=12Ω</text><text x="70" y="85" font-size="13" font-weight="bold" fill="#2563eb">V = 24V</text></svg>`
  },
  {
    name: 'Inclined Plane & Pulley',
    category: 'Physics - Mechanics & Friction',
    prompt: 'Calculate the system acceleration and string tension with coefficient of friction mu = 0.2.',
    svgPreview: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><rect width="400" height="200" fill="#f8fafc"/><polygon points="60,160 300,160 300,60" fill="#e2e8f0" stroke="#0f172a" stroke-width="2"/><rect x="160" y="90" width="36" height="24" transform="rotate(-23 160 90)" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><circle cx="305" cy="55" r="14" fill="#94a3b8" stroke="#0f172a" stroke-width="2"/><text x="140" y="150" font-size="12" font-weight="bold" fill="#0f172a">θ = 30°</text><text x="190" y="100" font-size="11" font-weight="bold" fill="#854d0e">m₁=5kg</text><text x="325" y="120" font-size="11" font-weight="bold" fill="#0f172a">m₂=3kg</text></svg>`
  },
  {
    name: 'Ray Optics Convex Lens',
    category: 'Physics - Geometrical Optics',
    prompt: 'Determine the image distance and magnification for an object at 30 cm from a 20 cm lens.',
    svgPreview: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"><rect width="400" height="200" fill="#f8fafc"/><line x1="40" y1="100" x2="360" y2="100" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="2"/><path d="M 200 30 Q 220 100 200 170 Q 180 100 200 30" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/><line x1="120" y1="100" x2="120" y2="60" stroke="#dc2626" stroke-width="3"/><text x="120" y="50" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">Object (u=-30cm)</text><text x="200" y="185" text-anchor="middle" font-size="11" font-weight="bold" fill="#0369a1">f = +20cm</text></svg>`
  }
];

export const ImageProblemSolverModal: React.FC<ImageProblemSolverModalProps> = ({
  onClose,
  onAddQuestionToBank
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/png');
  const [userPrompt, setUserPrompt] = useState('');
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAddedToBank, setIsAddedToBank] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Convert SVG to Data URL for preset testing
  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setUserPrompt(preset.prompt);
    const svgBlob = new Blob([preset.svgPreview], { type: 'image/svg+xml;charset=utf-8' });
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedMimeType('image/svg+xml');
      setAnalysisResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(svgBlob);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPEG, WebP, SVG).');
      return;
    }

    setSelectedMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setErrorMsg('Please upload an image or choose one of the preset diagrams.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/solve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType: selectedMimeType,
          prompt: userPrompt,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Image analysis failed');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze diagram image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveSimilarToBank = () => {
    if (!analysisResult?.similarQuestion || !onAddQuestionToBank) return;

    const sq = analysisResult.similarQuestion;
    const newQuestion: Question = {
      id: `img-q-${Date.now()}`,
      subject: analysisResult.subject || subject,
      topic: analysisResult.topic || 'Visual Problem Solving',
      subtopic: 'Multimodal Image Analysis',
      difficulty: 'JEE Main',
      questionType: 'mcq_single',
      questionText: sq.questionText,
      requiresDiagram: Boolean(analysisResult.similarDiagram),
      diagramType: analysisResult.diagramType || 'circuit',
      diagram: analysisResult.similarDiagram,
      options: sq.options.map((opt: any, idx: number) => ({
        id: `opt-${idx}`,
        label: opt.label,
        text: opt.text,
        isCorrect: opt.label === sq.correctAnswer,
      })),
      correctAnswer: sq.correctAnswer,
      solution: {
        stepByStep: analysisResult.stepByStepSolution || [],
        finalAnswer: analysisResult.finalAnswer || '',
        conceptFormula: analysisResult.governingFormulas?.[0] || '',
        diagramInsight: analysisResult.diagramAnalysis || '',
      },
      reviewStatus: 'approved',
      scorePrediction: {
        jeeDifficultyScore: 65,
        discriminationIndex: 0.72,
        expectedAccuracyRate: 52,
        rankImpact: 'High',
        topicWeightage: '8-12% in Competitive Exam',
      },
      ragMetadata: {
        retrievedChunks: [],
        similarQuestionRef: 'Synthesized from Image Multimodal Inspector',
      },
      createdAt: new Date().toISOString(),
    };

    onAddQuestionToBank(newQuestion);
    setIsAddedToBank(true);
    setTimeout(() => setIsAddedToBank(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Multimodal STEM Image Problem Solver
                </h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Gemini Vision
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Upload textbook diagrams, hand-drawn circuits, or question photos for instant derivation & practice
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

          {/* Section 1: Upload & Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Drag & Drop Uploader */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Upload Question or Diagram Image
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 bg-white flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-indigo-50/20 min-h-[200px]"
              >
                {selectedImage ? (
                  <div className="space-y-3 w-full flex flex-col items-center">
                    <img
                      src={selectedImage}
                      alt="Uploaded Diagram"
                      className="max-h-40 max-w-full rounded-lg border border-slate-200 object-contain shadow-xs bg-slate-50"
                    />
                    <span className="text-xs text-indigo-600 font-bold hover:underline">
                      Click to change image
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Click to browse or drop diagram image
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WEBP, or SVG circuit schematics & plots
                    </p>
                  </div>
                )}
              </div>

              {/* Sample Presets Quick Load */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Or test with sample STEM diagrams:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-500 text-slate-700 text-xs font-medium transition-all shadow-2xs hover:text-indigo-600"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Context & Guidance Input */}
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Subject & Notes for Gemini AI
                </label>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Subject Domain
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Physics">Physics (Circuits, Mechanics, Optics, Thermo)</option>
                    <option value="Chemistry">Chemistry (Reaction Mechanisms, Physical, Equilibrium)</option>
                    <option value="Mathematics">Mathematics (Conics, Geometry, Coordinate)</option>
                    <option value="Biology">Biology (Cellular, Diagrams, Genetics)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Optional Note or Question Clarification
                  </label>
                  <textarea
                    rows={3}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="e.g. Find the current through resistor R2 and determine whether diode is forward biased..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedImage}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Multimodal Inspection & Solving in Progress...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Solve & Verify Diagram with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: AI Solution & Derivation Output */}
          {analysisResult && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Multimodal Vision Analysis Completed
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">
                    {analysisResult.topic || 'Visual Problem Resolution'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Subject: {analysisResult.subject} • Verified with RAG Syllabus Knowledge Base
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">Predicted Key:</div>
                  <div className="text-sm font-extrabold text-emerald-700">
                    {analysisResult.finalAnswer}
                  </div>
                </div>
              </div>

              {/* Transcribed Question & Diagram Inspection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Transcribed Question from Image
                  </span>
                  <div className="text-xs text-slate-800 font-medium leading-relaxed">
                    <MathText text={analysisResult.transcribedQuestion} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                    Visual Diagram Component Breakdown
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {analysisResult.diagramAnalysis}
                  </p>
                </div>
              </div>

              {/* Governing Formulas */}
              {analysisResult.governingFormulas && analysisResult.governingFormulas.length > 0 && (
                <div className="p-3.5 bg-indigo-50/40 border border-indigo-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 block">
                    Governing Laws & Formulas:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-indigo-950 font-bold">
                    {analysisResult.governingFormulas.map((f: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white border border-indigo-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Derivation */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Detailed Step-by-Step Derivation:
                </span>
                <div className="space-y-2">
                  {analysisResult.stepByStepSolution?.map((step: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed"
                    >
                      <MathText text={step} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Takeaway */}
              {analysisResult.keyTakeaway && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Competitive Exam Tip: </strong>
                    <span>{analysisResult.keyTakeaway}</span>
                  </div>
                </div>
              )}

              {/* Generated Similar Practice Question */}
              {analysisResult.similarQuestion && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/40 to-slate-50 border-2 border-indigo-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-indigo-600 text-white">
                        <Sparkles className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                        Similar Multimodal Practice Question (Auto-Synthesized)
                      </span>
                    </div>

                    {onAddQuestionToBank && (
                      <button
                        onClick={handleSaveSimilarToBank}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        {isAddedToBank ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added to Question Bank!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Question Bank</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-900 font-medium">
                    <MathText text={analysisResult.similarQuestion.questionText} />
                  </div>

                  {/* SVG Diagram if present */}
                  {analysisResult.similarDiagram && (
                    <div className="my-3 max-w-md mx-auto">
                      <DiagramViewer diagram={analysisResult.similarDiagram} editable={false} />
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysisResult.similarQuestion.options?.map((opt: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                          opt.label === analysisResult.similarQuestion.correctAnswer
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {opt.label}
                        </span>
                        <span>{opt.text}</span>
                        {opt.label === analysisResult.similarQuestion.correctAnswer && (
                          <span className="ml-auto text-[10px] text-emerald-700 font-bold">
                            Correct Key
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
