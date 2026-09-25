import React, { useState } from 'react';
import {
  Question,
  KnowledgeDoc,
  StudentRegistration,
  Subject,
  Difficulty,
  QuestionType,
  DiagramType,
  AuthUser,
  AssignedPaper,
  TargetExam,
} from '../types';
import { QuestionCard } from './QuestionCard';
import { KnowledgeBaseExplorer } from './KnowledgeBaseExplorer';
import { TeacherStudentDirectory } from './TeacherStudentDirectory';
import { PaperAssemblyModal } from './PaperAssemblyModal';
import { WorkflowPipeline } from './WorkflowPipeline';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { ImageProblemSolverModal } from './ImageProblemSolverModal';
import { YouTubeSummarizerModal } from './YouTubeSummarizerModal';
import { DoubtSolverChatModal } from './DoubtSolverChatModal';
import { JeePaperGeneratorModal } from './JeePaperGeneratorModal';
import {
  Sparkles,
  Layers,
  BrainCircuit,
  FileText,
  Users,
  Database,
  Printer,
  ChevronRight,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  LogOut,
  UserCheck,
  BarChart3,
  BookOpen,
  Filter,
  Check,
  Edit3,
  Trash2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  FileCheck,
  Camera,
  Youtube,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Dices,
  Shuffle,
} from 'lucide-react';
import { generateSubjectWiseCustomPaper, SubjectSelectionConfig } from '../lib/ntaPatternGenerator';
import { SubjectSetting } from './JeePaperGeneratorModal';

interface TeacherDashboardProps {
  questions: Question[];
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  knowledgeDocs: KnowledgeDoc[];
  onAddKnowledgeDoc: (doc: any) => Promise<void>;
  students: StudentRegistration[];
  onAddStudent: (studentData: any) => Promise<void>;
  onUpdateStudent: (id: string, updates: any) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
  assignedPapers: AssignedPaper[];
  onAssignPaper: (paperData: any) => Promise<void>;
  currentUser: AuthUser;
  onSwitchToStudent: () => void;
  onLogout: () => void;
  onOpenAskModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  knowledgeDocs,
  onAddKnowledgeDoc,
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  assignedPapers,
  onAssignPaper,
  currentUser,
  onSwitchToStudent,
  onLogout,
  onOpenAskModal,
}) => {
  // Navigation tabs for teacher (now driven by vertical sidebar)
  const [activeTab, setActiveTab] = useState<'generator' | 'jee_paper' | 'review' | 'assembly' | 'analytics' | 'knowledge' | 'architecture'>('generator');

  // Sidebar Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dedicated JEE Paper Generator State
  const [isJeePaperModalOpen, setIsJeePaperModalOpen] = useState(false);
  const [jeeExamType, setJeeExamType] = useState<TargetExam>('JEE Main');
  const [jeePaperTitle, setJeePaperTitle] = useState('NTA JEE Multimodal Comprehensive Examination');
  const [jeeTimeLimit, setJeeTimeLimit] = useState<number>(60);
  const [jeeSubjectSettings, setJeeSubjectSettings] = useState<SubjectSetting[]>([
    { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
    { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
    { subject: 'Mathematics', total: 10, diagrams: 3, text: 7 },
  ]);
  const [jeePaperQuestions, setJeePaperQuestions] = useState<Question[]>([]);
  const [jeeActiveSectionFilter, setJeeActiveSectionFilter] = useState<'all' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('all');
  const [jeeFormatFilter, setJeeFormatFilter] = useState<'all' | 'diagram' | 'text'>('all');
  const [isJeeGenerating, setIsJeeGenerating] = useState(false);
  const [jeeAssignedSuccess, setJeeAssignedSuccess] = useState(false);
  const [jeePreviewTab, setJeePreviewTab] = useState<'paper' | 'solutions'>('paper');

  // Question Generator State
  const [subject, setSubject] = useState<Subject>('Physics');
  const [topic, setTopic] = useState('Current Electricity & Kirchhoff\'s Laws');
  const [difficulty, setDifficulty] = useState<string>('JEE Main');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq_single');
  const [forceDiagram, setForceDiagram] = useState(true);
  const [generationOutputMode, setGenerationOutputMode] = useState<'both' | 'diagram' | 'text_only'>('both');
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState<number>(2);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<'idle' | 'input' | 'filter' | 'rag' | 'question_gen' | 'diagram_decision' | 'diagram_gen' | 'answer_key' | 'completed'>('completed');
  const [generatedPreview, setGeneratedPreview] = useState<Question | null>(null);
  const [generatedBothPreviews, setGeneratedBothPreviews] = useState<{ textOnly: Question; withDiagram: Question } | null>(null);
  const [generatedBatchQuestions, setGeneratedBatchQuestions] = useState<Question[]>([]);
  const [batchFilterTab, setBatchFilterTab] = useState<'all' | 'text_only' | 'diagram'>('all');
  const [previewDisplayTab, setPreviewDisplayTab] = useState<'all' | 'text_only' | 'diagram'>('all');

  // Filter & Search State for Question Bank
  const [filterSubject, setFilterSubject] = useState<string>('All');
  const [filterTopic, setFilterTopic] = useState<string>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [filterDiagram, setFilterDiagram] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Paper Assembly Selection
  const [selectedForPaper, setSelectedForPaper] = useState<string[]>([]);
  const [isPaperModalOpen, setIsPaperModalOpen] = useState(false);

  // New Modals for VisuRank Brief
  const [isImageSolverOpen, setIsImageSolverOpen] = useState(false);
  const [isYouTubeSummarizerOpen, setIsYouTubeSummarizerOpen] = useState(false);
  const [isDoubtChatOpen, setIsDoubtChatOpen] = useState(false);

  // Edit Question Modal State
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Preset curriculum concepts
  const topicPresets: Record<Subject, string[]> = {
    Physics: [
      'Current Electricity & Kirchhoff\'s Laws',
      'Newton’s Laws & Friction On Incline',
      'Geometrical Ray Optics & Lens Formula',
      'Thermodynamic Indicator P-V Cycles',
      'Kinematics & Velocity-Time Graphs',
      'Electromagnetic Induction & Faraday Loops',
    ],
    Chemistry: [
      'Electrophilic Aromatic Benzene Nitration',
      'Coordination Complexes & Crystal Field',
      'Chemical Kinetics & Arrhenius Equation',
      'Electrochemistry & Nernst Half-Cells',
    ],
    Mathematics: [
      'Conic Sections: Parabola & Tangents',
      'Definite Integrals & Area Under Curves',
      'Vectors & 3D Straight Lines',
      'Differential Equations & Orthogonal Curves',
    ],
    Biology: [
      'Eukaryotic Cell Organelles & Mitochondria',
      'DNA Double Helix & Replication Fork',
      'Nephron Structure & Counter-Current',
    ],
  };

  const handleToggleSelectForPaper = (qId: string) => {
    setSelectedForPaper((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleJeeExamTypeChange = (exam: TargetExam) => {
    setJeeExamType(exam);
    if (exam === 'NEET') {
      setJeePaperTitle('NEET-UG Official Multimodal Practice Examination');
      setJeeTimeLimit(90);
      setJeeSubjectSettings([
        { subject: 'Physics', total: 15, diagrams: 7, text: 8 },
        { subject: 'Chemistry', total: 15, diagrams: 5, text: 10 },
        { subject: 'Biology', total: 30, diagrams: 12, text: 18 },
      ]);
    } else {
      setJeePaperTitle(`${exam} Multimodal Comprehensive Examination`);
      setJeeTimeLimit(60);
      setJeeSubjectSettings([
        { subject: 'Physics', total: 10, diagrams: 5, text: 5 },
        { subject: 'Chemistry', total: 10, diagrams: 4, text: 6 },
        { subject: 'Mathematics', total: 10, diagrams: 3, text: 7 },
      ]);
    }
  };

  const updateJeeSubjectTotal = (subj: Subject, newTotal: number) => {
    const val = Math.max(1, newTotal);
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const currentRatio = s.total > 0 ? s.diagrams / s.total : 0.5;
        const newDiag = Math.min(val, Math.max(0, Math.round(val * currentRatio)));
        return { ...s, total: val, diagrams: newDiag, text: val - newDiag };
      })
    );
  };

  const updateJeeSubjectDiagrams = (subj: Subject, newDiagrams: number) => {
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const validDiag = Math.max(0, Math.min(s.total, newDiagrams));
        return { ...s, diagrams: validDiag, text: s.total - validDiag };
      })
    );
  };

  const updateJeeSubjectText = (subj: Subject, newText: number) => {
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const validText = Math.max(0, Math.min(s.total, newText));
        return { ...s, diagrams: s.total - validText, text: validText };
      })
    );
  };

  const randomizeJeeSubject = (subj: Subject) => {
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        if (s.subject !== subj) return s;
        const randomRatio = 0.2 + Math.random() * 0.6;
        const diag = Math.max(0, Math.min(s.total, Math.round(s.total * randomRatio)));
        return { ...s, diagrams: diag, text: s.total - diag };
      })
    );
  };

  const randomizeAllJeeSubjects = () => {
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        const randomRatio = 0.15 + Math.random() * 0.7;
        const diag = Math.max(0, Math.min(s.total, Math.round(s.total * randomRatio)));
        return { ...s, diagrams: diag, text: s.total - diag };
      })
    );
  };

  const applyJeePresetRatio = (diagramPercentage: number) => {
    setJeeSubjectSettings((prev) =>
      prev.map((s) => {
        const diag = Math.round((s.total * diagramPercentage) / 100);
        return { ...s, diagrams: diag, text: s.total - diag };
      })
    );
  };

  const applyJeeExamPreset = (preset: 'jee75' | 'neet180' | 'mock30' | 'quick15') => {
    if (preset === 'jee75') {
      setJeeExamType('JEE Main');
      setJeePaperTitle('NTA JEE Main 2026 Full Simulation Paper (75 Questions)');
      setJeeTimeLimit(180);
      setJeeSubjectSettings([
        { subject: 'Physics', total: 25, diagrams: 12, text: 13 },
        { subject: 'Chemistry', total: 25, diagrams: 8, text: 17 },
        { subject: 'Mathematics', total: 25, diagrams: 5, text: 20 },
      ]);
    } else if (preset === 'neet180') {
      setJeeExamType('NEET');
      setJeePaperTitle('NTA NEET-UG 2026 Full Simulation Examination (180 Questions)');
      setJeeTimeLimit(200);
      setJeeSubjectSettings([
        { subject: 'Physics', total: 45, diagrams: 20, text: 25 },
        { subject: 'Chemistry', total: 45, diagrams: 12, text: 33 },
        { subject: 'Biology', total: 90, diagrams: 40, text: 50 },
      ]);
    } else if (preset === 'mock30') {
      const isNeet = jeeExamType === 'NEET';
      setJeeTimeLimit(60);
      setJeeSubjectSettings(
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
      const isNeet = jeeExamType === 'NEET';
      setJeeTimeLimit(30);
      setJeeSubjectSettings(
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

  // Dedicated JEE Paper Generator Logic with Subject-Wise Configuration
  const handleGenerateJeePaperInline = async () => {
    setIsJeeGenerating(true);
    setJeeAssignedSuccess(false);

    const subjectConfigs: SubjectSelectionConfig[] = jeeSubjectSettings.map((s) => ({
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
          targetExam: jeeExamType,
          title: jeePaperTitle,
          timeLimitMinutes: jeeTimeLimit,
          subjectConfigs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.paper && Array.isArray(data.paper.questions) && data.paper.questions.length > 0) {
          setJeePaperQuestions(data.paper.questions);
          return;
        }
      }

      // Client-side fallback
      const generated = generateSubjectWiseCustomPaper({
        targetExam: jeeExamType,
        title: jeePaperTitle,
        timeLimitMinutes: jeeTimeLimit,
        subjectConfigs,
      });
      setJeePaperQuestions(generated.questions);
    } catch (e) {
      console.error(e);
      const generated = generateSubjectWiseCustomPaper({
        targetExam: jeeExamType,
        title: jeePaperTitle,
        timeLimitMinutes: jeeTimeLimit,
        subjectConfigs,
      });
      setJeePaperQuestions(generated.questions);
    } finally {
      setIsJeeGenerating(false);
    }
  };

  const handleAssignJeePaperToCohort = async () => {
    if (jeePaperQuestions.length === 0) return;

    const newPaper: AssignedPaper = {
      id: `paper-jee-${Date.now()}`,
      title: `${jeeExamType} Multimodal Comprehensive Examination`,
      targetExam: jeeExamType,
      subject: 'All' as any,
      instructions: `Official NTA Simulation. Contains both Text-Only conceptual questions and synchronized Vector Diagram questions. Scheme: +4 for correct, -1 for incorrect attempt.`,
      timeLimitMinutes: jeeTimeLimit,
      totalMarks: jeePaperQuestions.length * 4,
      questions: jeePaperQuestions,
      assignedTo: jeeExamType,
      assignedToLabel: `${jeeExamType} Aspirants Batch`,
      assignedBy: currentUser?.name || 'Prof. Mohini Mohod',
      createdAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await onAssignPaper(newPaper);
    setJeeAssignedSuccess(true);
    setTimeout(() => setJeeAssignedSuccess(false), 3000);
  };

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    setGenerationStage('rag');

    try {
      // Flowchart Step: Filter selection & RAG retrieval
      await new Promise((r) => setTimeout(r, 600));
      setGenerationStage('question_gen');

      // Flowchart Step: Question generation with Gemini
      await new Promise((r) => setTimeout(r, 700));
      setGenerationStage('diagram_decision');

      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionType,
          customPrompt,
          generationMode: generationOutputMode,
          forceDiagram: generationOutputMode !== 'text_only',
          count: numQuestionsToGenerate,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();

      setGenerationStage('answer_key');
      await new Promise((r) => setTimeout(r, 400));

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setGeneratedBatchQuestions(data.questions);
        data.questions.forEach((q: Question) => {
          onAddQuestion(q);
          if (!selectedForPaper.includes(q.id)) {
            setSelectedForPaper((prev) => [q.id, ...prev]);
          }
        });

        if (data.questionTextOnly && data.questionWithDiagram) {
          setGeneratedBothPreviews({
            textOnly: data.questionTextOnly,
            withDiagram: data.questionWithDiagram
          });
        }
        setGeneratedPreview(data.question || data.questions[0]);
      } else if (data.question) {
        setGeneratedBatchQuestions([data.question]);
        onAddQuestion(data.question);
        setGeneratedBothPreviews(null);
        setGeneratedPreview(data.question);
        if (!selectedForPaper.includes(data.question.id)) {
          setSelectedForPaper((prev) => [data.question.id, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      setGenerationStage('completed');
    }
  };

  // Extract unique topics from questions for dropdown filter
  const availableTopics = Array.from(
    new Set(questions.map((q) => q.topic).filter(Boolean))
  );

  const filteredQuestions = questions.filter((q) => {
    if (filterSubject !== 'All' && q.subject !== filterSubject) return false;
    if (filterTopic !== 'All' && q.topic.toLowerCase() !== filterTopic.toLowerCase()) return false;
    if (filterDifficulty !== 'All' && q.difficulty !== filterDifficulty) return false;
    if (filterDiagram === 'Diagrams Only' && !q.requiresDiagram) return false;
    if (filterDiagram === 'Text Only' && q.requiresDiagram) return false;
    if (searchQuery.trim()) {
      const qText = (q.questionText + ' ' + q.topic + ' ' + q.subtopic).toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const paperQuestions = questions.filter((q) => selectedForPaper.includes(q.id));

  // Compute live cohort statistics
  const totalStudents = students.length;
  const totalSubmissions = students.reduce((acc, s) => acc + (s.recentAttempts?.length || 0), 0);
  const averageCohortScore = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + (s.averageScore || 0), 0) / students.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased">
      {/* ========================================================= */}
      {/* DESKTOP VERTICAL SIDEBAR (REPLACING TOP TASK BAR) */}
      {/* ========================================================= */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        } bg-[#0F172A] text-slate-300 flex-shrink-0 flex flex-col border-r border-slate-800 transition-all duration-200 hidden md:flex sticky top-0 h-screen z-30 select-none`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-bold shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">VisuRank</span>
                  <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded-full font-bold uppercase">
                    Faculty
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  PiyushAI & P.R. Pote Patil
                </p>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <div className="p-2 border-b border-slate-800 flex justify-center">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {!isSidebarCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Core Faculty Navigation
            </div>
          )}

          {[
            {
              id: 'generator',
              label: 'Question Generator Studio',
              sublabel: 'RAG Multimodal AI',
              icon: <Sparkles className="w-4 h-4" />,
            },
            {
              id: 'jee_paper',
              label: 'NTA JEE Paper Generator',
              sublabel: 'Text + Diagram Mix',
              icon: <Award className="w-4 h-4 text-amber-400" />,
              badge: 'JEE Paper',
              badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
            },
            {
              id: 'review',
              label: 'Question Bank Review',
              sublabel: `${questions.length} Questions`,
              icon: <FileCheck className="w-4 h-4 text-emerald-400" />,
              count: questions.length,
            },
            {
              id: 'assembly',
              label: 'Paper Assembly & Booklet',
              sublabel: `${selectedForPaper.length} Selected`,
              icon: <Printer className="w-4 h-4 text-blue-400" />,
              count: selectedForPaper.length,
            },
            {
              id: 'analytics',
              label: 'Class Analytics & Roster',
              sublabel: `${students.length} Candidates`,
              icon: <BarChart3 className="w-4 h-4 text-purple-400" />,
              count: students.length,
            },
            {
              id: 'knowledge',
              label: 'RAG Knowledge Base',
              sublabel: `${knowledgeDocs.length} Syllabus Chunks`,
              icon: <Database className="w-4 h-4 text-teal-400" />,
              count: knowledgeDocs.length,
            },
            {
              id: 'architecture',
              label: 'Architecture Flowchart',
              sublabel: 'System Pipeline',
              icon: <Layers className="w-4 h-4 text-indigo-400" />,
            },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full text-left rounded-xl transition-all flex items-center gap-3 ${
                  isSidebarCollapsed ? 'p-3 justify-center' : 'px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className="shrink-0">{item.icon}</div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <div className="text-xs truncate">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[10px] text-slate-400 truncate font-normal">
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ml-1 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && !item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                          isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Multimodal Quick Tools in Sidebar */}
          {!isSidebarCollapsed && (
            <div className="pt-4 mt-3 border-t border-slate-800/80 space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Multimodal AI Lab
              </div>
              <button
                onClick={() => setIsImageSolverOpen(true)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
              >
                <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">Snap & Solve Image</span>
              </button>
              <button
                onClick={() => setIsYouTubeSummarizerOpen(true)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
              >
                <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                <span className="truncate">YouTube Lecture Tool</span>
              </button>
              <button
                onClick={() => setIsDoubtChatOpen(true)}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Ask Syllabus AI Tutor</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'AT'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name || 'Dr. Aris Thorne'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser.designation || 'Senior Faculty'}
                </div>
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onSwitchToStudent}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                title="Switch to Student CBT View"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student View</span>
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE SIDEBAR DRAWER */}
      {/* ========================================================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 z-10 h-full p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">VisuRank</div>
                  <div className="text-[10px] text-slate-400">Faculty Navigation</div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {[
                { id: 'generator', label: '1. Question Generator Studio', icon: <Sparkles className="w-4 h-4" /> },
                { id: 'jee_paper', label: '2. NTA JEE Paper Generator', icon: <Award className="w-4 h-4 text-amber-400" />, badge: 'Text+Diag' },
                { id: 'review', label: `3. Question Bank (${questions.length})`, icon: <FileCheck className="w-4 h-4" /> },
                { id: 'assembly', label: `4. Paper Assembly (${selectedForPaper.length})`, icon: <Printer className="w-4 h-4" /> },
                { id: 'analytics', label: `5. Class Analytics (${students.length})`, icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'knowledge', label: `6. Knowledge Base (${knowledgeDocs.length})`, icon: <Database className="w-4 h-4" /> },
                { id: 'architecture', label: 'Architecture Flowchart', icon: <Layers className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
                    activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white">{currentUser?.name}</span>
              <button onClick={onLogout} className="text-xs text-rose-400 font-semibold">
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP COMMAND BAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                title="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  {activeTab === 'generator' && 'Multimodal Question Generator Studio'}
                  {activeTab === 'jee_paper' && 'NTA JEE Paper Generator (Text + Diagram Mix)'}
                  {activeTab === 'review' && 'Question Bank Review & Verification'}
                  {activeTab === 'assembly' && 'Examination Paper Assembly & Print'}
                  {activeTab === 'analytics' && 'Class Performance Analytics & Roster'}
                  {activeTab === 'knowledge' && 'Syllabus RAG Knowledge Base'}
                  {activeTab === 'architecture' && 'VisuRank System Architecture'}
                </h1>
                <p className="text-[11px] text-slate-500">
                  PiyushAI Edtech Pvt. Ltd. & P. R. Pote Patil College of Engineering (Dept. of AI & Data Science)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick JEE Paper Modal Button */}
              <button
                onClick={() => setIsJeePaperModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant JEE Paper (Modal)</span>
              </button>

              <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
                <span className="text-slate-600">Cohort: <strong>{totalStudents}</strong></span>
                <span>•</span>
                <span className="text-slate-600">Bank: <strong>{questions.length}</strong> Qs</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Avg: {averageCohortScore}%</span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN FACULTY BODY */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Institutional & Industry Partnership Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[11px] uppercase tracking-wider">
              Project Brief
            </span>
            <div>
              <span className="font-bold text-slate-900">
                PiyushAI Edtech Pvt. Ltd. & P. R. Pote Patil College of Engineering & Management
              </span>
              <span className="text-slate-500 hidden md:inline">
                {' '}• Dept. of AI & Data Science • Guide: Prof. Mohini Mohod
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                RAG-Based Multimodal AI Question Generation with Automatic Diagram Generation (Extends jeeneet.piyushai.com/quiz)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImageSolverOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Solve Diagram Image</span>
            </button>
            <button
              onClick={() => setIsYouTubeSummarizerOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Lecture Tool</span>
            </button>
            <button
              onClick={() => setIsDoubtChatOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Syllabus AI Tutor</span>
            </button>
          </div>
        </div>

        {/* Top Architecture Workflow Bar */}
        <WorkflowPipeline currentStage={generationStage} />

        {/* TAB 1: QUESTION GENERATOR STUDIO */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Input and Configuration Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Teacher Input & Filter Selection
                    </h2>
                    <p className="text-xs text-slate-500">
                      RAG retrieves educational knowledge context • Gemini synthesizes synchronized question and diagram
                    </p>
                  </div>
                </div>

                {/* Modality Capabilities Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Multimodal Engine: Text-Only & Diagram</span>
                  </span>
                </div>
              </div>

              {/* Output Generation Mode Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Question Generation Mode (Choose Output Format)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGenerationOutputMode('both');
                      setForceDiagram(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      generationOutputMode === 'both'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Both Types Simultaneously</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                        Dual Mode
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Generates <strong>1 pure text-only concept problem</strong> AND <strong>1 text + vector diagram question</strong> in a single call.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenerationOutputMode('diagram');
                      setForceDiagram(true);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      generationOutputMode === 'diagram'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Text + Vector Diagram</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        SVG Visual
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Generates authentic question with integrated SVG diagram (circuits, ray optics, FBD, thermo P-V, etc.).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenerationOutputMode('text_only');
                      setForceDiagram(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      generationOutputMode === 'text_only'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pure Text-Only</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        Theory / Math
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Generates pure theoretical, formula derivation, or multi-step algebraic problem with <strong>zero diagram</strong> dependencies.
                    </p>
                  </button>
                </div>
              </div>

              {/* Quantity / Number of Questions Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Number of Questions to Generate
                  </label>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                    {generationOutputMode === 'both'
                      ? `${numQuestionsToGenerate} Questions (${Math.floor(numQuestionsToGenerate / 2)} Text-Only + ${Math.ceil(numQuestionsToGenerate / 2)} Diagram)`
                      : `${numQuestionsToGenerate} ${generationOutputMode === 'text_only' ? 'Text-Only' : 'Text + Diagram'} Question${numQuestionsToGenerate > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 5, 10, 15, 20, 25, 30, 50].map((countVal) => (
                    <button
                      key={countVal}
                      type="button"
                      onClick={() => setNumQuestionsToGenerate(countVal)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        numQuestionsToGenerate === countVal
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {countVal} Q
                    </button>
                  ))}

                  {/* Stepper counter & Direct Number Input up to 50 */}
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white ml-auto">
                    <button
                      type="button"
                      onClick={() => setNumQuestionsToGenerate(Math.max(1, numQuestionsToGenerate - 1))}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      title="Decrease question count"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={numQuestionsToGenerate}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setNumQuestionsToGenerate(Math.min(50, Math.max(1, val)));
                        }
                      }}
                      className="w-12 text-center py-1 text-xs font-extrabold text-slate-900 border-x border-slate-200 focus:outline-none focus:bg-blue-50/50"
                      title="Enter custom count (1 to 50)"
                    />
                    <button
                      type="button"
                      onClick={() => setNumQuestionsToGenerate(Math.min(50, numQuestionsToGenerate + 1))}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                      title="Increase question count (up to 50)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Subject Selection
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['Physics', 'Chemistry', 'Mathematics', 'Biology'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSubject(s);
                        setTopic(topicPresets[s][0]);
                      }}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        subject === s
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Preset Dropdown & Custom Field */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  2. Curriculum Concept / Topic Selection
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {topicPresets[subject]?.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        topic === p
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Or enter a specific topic..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Difficulty and Question Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    3. Target Exam / Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="JEE Advanced">JEE Advanced (High Rigor & Multiple Traps)</option>
                    <option value="JEE Main">JEE Main (Formulaic & Conceptual)</option>
                    <option value="NEET">NEET UG (Medical Recall & Speed)</option>
                    <option value="CBSE Board">CBSE Class 11/12 Board Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    4. Question Format
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="mcq_single">Single Correct Option (4 Choices, +4 / -1)</option>
                    <option value="numerical">Numerical Integer / Decimal Value</option>
                    <option value="mcq_multiple">One or More Options Correct (Advanced)</option>
                  </select>
                </div>
              </div>

              {/* Additional Teacher Prompt Guidance */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  5. Custom Pedagogical Notes / Specific Focus (Optional)
                </label>
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Include a 30V battery with parallel branch, or emphasize Lenz's Law sign convention..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Generation Button */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>RAG Knowledge Base connected ({knowledgeDocs.length} curriculum documents)</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateQuestion}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isGenerating
                      ? `Synthesizing ${numQuestionsToGenerate} Question${numQuestionsToGenerate > 1 ? 's' : ''} with Gemini 3.8...`
                      : generationOutputMode === 'both'
                      ? `Generate ${numQuestionsToGenerate} Questions (${Math.floor(numQuestionsToGenerate / 2)} Text + ${Math.ceil(numQuestionsToGenerate / 2)} Diagram)`
                      : generationOutputMode === 'text_only'
                      ? `Generate ${numQuestionsToGenerate} Pure Text-Only Question${numQuestionsToGenerate > 1 ? 's' : ''}`
                      : `Generate ${numQuestionsToGenerate} Text + Diagram Question${numQuestionsToGenerate > 1 ? 's' : ''}`}
                  </span>
                </button>
              </div>
            </div>

            {/* Generated Question Result Cards (Batch Support) */}
            {generatedBatchQuestions.length > 0 ? (
              <div className="space-y-4">
                {/* Batch Result Banner & View Switcher */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-xl border border-blue-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                      {generatedBatchQuestions.length}x
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>Batch Generation Complete: {generatedBatchQuestions.length} Questions</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Added to Bank & Paper
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600">
                        <span>
                          <strong>{generatedBatchQuestions.filter((q) => q.requiresDiagram).length}</strong> Text + Diagram
                        </span>
                        <span>•</span>
                        <span>
                          <strong>{generatedBatchQuestions.filter((q) => !q.requiresDiagram).length}</strong> Pure Text-Only
                        </span>
                        <span>•</span>
                        <span>Grounding: RAG Knowledge Context</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 bg-white/80 p-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setBatchFilterTab('all')}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          batchFilterTab === 'all'
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        All ({generatedBatchQuestions.length})
                      </button>
                      {generatedBatchQuestions.some((q) => q.requiresDiagram) && (
                        <button
                          onClick={() => setBatchFilterTab('diagram')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                            batchFilterTab === 'diagram'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          <span>Diagram ({generatedBatchQuestions.filter((q) => q.requiresDiagram).length})</span>
                        </button>
                      )}
                      {generatedBatchQuestions.some((q) => !q.requiresDiagram) && (
                        <button
                          onClick={() => setBatchFilterTab('text_only')}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                            batchFilterTab === 'text_only'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>Text-Only ({generatedBatchQuestions.filter((q) => !q.requiresDiagram).length})</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Select/Deselect All For Paper */}
                    <button
                      onClick={() => {
                        const allSelected = generatedBatchQuestions.every((q) => selectedForPaper.includes(q.id));
                        if (allSelected) {
                          setSelectedForPaper((prev) =>
                            prev.filter((id) => !generatedBatchQuestions.some((bq) => bq.id === id))
                          );
                        } else {
                          setSelectedForPaper((prev) => {
                            const newIds = generatedBatchQuestions
                              .map((bq) => bq.id)
                              .filter((id) => !prev.includes(id));
                            return [...newIds, ...prev];
                          });
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                    >
                      {generatedBatchQuestions.every((q) => selectedForPaper.includes(q.id))
                        ? 'Remove All from Paper'
                        : 'Add All to Paper'}
                    </button>
                  </div>
                </div>

                {/* List of Batch Questions */}
                <div className="space-y-4">
                  {generatedBatchQuestions
                    .filter((q) => {
                      if (batchFilterTab === 'diagram') return q.requiresDiagram;
                      if (batchFilterTab === 'text_only') return !q.requiresDiagram;
                      return true;
                    })
                    .map((q, qIdx) => (
                      <div key={q.id} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              Question #{qIdx + 1}
                            </span>
                            {q.requiresDiagram ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Eye className="w-3 h-3 text-emerald-600" />
                                <span>Text + Vector Diagram ({q.diagramType})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                                <FileText className="w-3 h-3 text-indigo-600" />
                                <span>Pure Text-Only (Formula / Theory)</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {q.subject} • {q.difficulty}
                          </span>
                        </div>

                        <QuestionCard
                          question={q}
                          isSelectedForPaper={selectedForPaper.includes(q.id)}
                          onToggleSelectForPaper={() => handleToggleSelectForPaper(q.id)}
                          onEdit={() => setEditingQuestion(q)}
                          onDelete={() => onDeleteQuestion(q.id)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ) : generatedBothPreviews ? (
              <div className="space-y-4">
                {/* Dual Result Banner & View Switcher */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 rounded-xl border border-blue-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      2x
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Dual Question Generation Complete</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          Both Added to Bank & Paper
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-600">
                        Generated 1 pure text-only concept problem and 1 synchronized text + diagram question from RAG knowledge.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setPreviewDisplayTab('all')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        previewDisplayTab === 'all'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Show Both (2)
                    </button>
                    <button
                      onClick={() => setPreviewDisplayTab('text_only')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        previewDisplayTab === 'text_only'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Text-Only</span>
                    </button>
                    <button
                      onClick={() => setPreviewDisplayTab('diagram')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                        previewDisplayTab === 'diagram'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Text + Diagram</span>
                    </button>
                  </div>
                </div>

                {/* Render Text-Only Card */}
                {(previewDisplayTab === 'all' || previewDisplayTab === 'text_only') && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span>Type 1: Pure Text-Only (Theoretical / Derivation)</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">No diagram dependencies</span>
                    </div>

                    <QuestionCard
                      question={generatedBothPreviews.textOnly}
                      isSelectedForPaper={selectedForPaper.includes(generatedBothPreviews.textOnly.id)}
                      onToggleSelectForPaper={() => handleToggleSelectForPaper(generatedBothPreviews.textOnly.id)}
                      onEdit={() => setEditingQuestion(generatedBothPreviews.textOnly)}
                      onDelete={() => onDeleteQuestion(generatedBothPreviews.textOnly.id)}
                    />
                  </div>
                )}

                {/* Render Text + Diagram Card */}
                {(previewDisplayTab === 'all' || previewDisplayTab === 'diagram') && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Type 2: Text + Vector Diagram (SVG Schematic)</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Synchronized with {generatedBothPreviews.withDiagram.diagramType} diagram
                      </span>
                    </div>

                    <QuestionCard
                      question={generatedBothPreviews.withDiagram}
                      isSelectedForPaper={selectedForPaper.includes(generatedBothPreviews.withDiagram.id)}
                      onToggleSelectForPaper={() => handleToggleSelectForPaper(generatedBothPreviews.withDiagram.id)}
                      onEdit={() => setEditingQuestion(generatedBothPreviews.withDiagram)}
                      onDelete={() => onDeleteQuestion(generatedBothPreviews.withDiagram.id)}
                    />
                  </div>
                )}
              </div>
            ) : generatedPreview ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Latest Generated Question & Model Answer Key</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('review')}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>View all {questions.length} questions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <QuestionCard
                  question={generatedPreview}
                  isSelectedForPaper={selectedForPaper.includes(generatedPreview.id)}
                  onToggleSelectForPaper={() => handleToggleSelectForPaper(generatedPreview.id)}
                  onEdit={() => setEditingQuestion(generatedPreview)}
                  onDelete={() => onDeleteQuestion(generatedPreview.id)}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: DEDICATED NTA JEE PAPER GENERATOR (SUBJECT-WISE DIAGRAM & TEXT SELECTION) */}
        {/* ========================================================= */}
        {activeTab === 'jee_paper' && (
          <div className="space-y-6">
            {/* Control & Configuration Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        Subject-Wise Question Paper Generator
                      </h2>
                      <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Diagram & Text Randomizer
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Configure question counts per subject, set custom diagram vs text proportions, or randomize on demand
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsJeePaperModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open in Fullscreen Modal</span>
                  </button>
                </div>
              </div>

              {/* Metadata & Quick Pattern Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Exam Title / Header</label>
                  <input
                    type="text"
                    value={jeePaperTitle}
                    onChange={(e) => setJeePaperTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Target Examination</label>
                  <select
                    value={jeeExamType}
                    onChange={(e) => handleJeeExamTypeChange(e.target.value as TargetExam)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="JEE Main">JEE Main (Physics, Chem, Math)</option>
                    <option value="JEE Advanced">JEE Advanced (High Rigor)</option>
                    <option value="NEET">NEET UG (Physics, Chem, Biology)</option>
                  </select>
                </div>
              </div>

              {/* Quick Exam Patterns & Global Randomization */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyJeeExamPreset('jee75')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                  >
                    Official JEE 75 Qs
                  </button>
                  <button
                    type="button"
                    onClick={() => applyJeeExamPreset('neet180')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold shadow-2xs cursor-pointer transition-colors"
                  >
                    Official NEET 180 Qs
                  </button>
                  <button
                    type="button"
                    onClick={() => applyJeeExamPreset('mock30')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold shadow-2xs cursor-pointer transition-colors"
                  >
                    30 Qs Mock
                  </button>
                  <button
                    type="button"
                    onClick={() => applyJeeExamPreset('quick15')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold shadow-2xs cursor-pointer transition-colors"
                  >
                    15 Qs Drill
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={randomizeAllJeeSubjects}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>🎲 Randomize All (Diagram & Text)</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => applyJeePresetRatio(50)}
                      className="px-2 py-0.5 hover:bg-white rounded font-semibold text-slate-700 cursor-pointer"
                    >
                      50/50 Balanced
                    </button>
                    <button
                      type="button"
                      onClick={() => applyJeePresetRatio(70)}
                      className="px-2 py-0.5 hover:bg-white rounded font-semibold text-emerald-700 cursor-pointer"
                    >
                      70% Diagrams
                    </button>
                    <button
                      type="button"
                      onClick={() => applyJeePresetRatio(30)}
                      className="px-2 py-0.5 hover:bg-white rounded font-semibold text-indigo-700 cursor-pointer"
                    >
                      70% Text
                    </button>
                  </div>
                </div>
              </div>

              {/* SUBJECT-WISE CARDS GRID */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Subject-Wise Question Breakdown & Ratio Customization:
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Exam Time Limit:</span>
                    <select
                      value={jeeTimeLimit}
                      onChange={(e) => setJeeTimeLimit(Number(e.target.value))}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value={15}>15 Minutes</option>
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                      <option value={180}>180 Minutes (JEE Full)</option>
                      <option value={200}>200 Minutes (NEET Full)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {jeeSubjectSettings.map((s) => {
                    const diagPercent = s.total > 0 ? Math.round((s.diagrams / s.total) * 100) : 0;
                    const textPercent = 100 - diagPercent;

                    return (
                      <div
                        key={s.subject}
                        className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 shadow-2xs hover:bg-white transition-all space-y-3"
                      >
                        {/* Header & Randomize Button */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">
                              {s.subject === 'Physics' ? '⚛️' : s.subject === 'Chemistry' ? '🧪' : s.subject === 'Mathematics' ? '📐' : '🧬'}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900">{s.subject}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => randomizeJeeSubject(s.subject)}
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
                            <label className="font-bold text-slate-700">Total {s.subject} Qs:</label>
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {s.total} Questions ({s.total * 4} Marks)
                            </span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={60}
                            value={s.total}
                            onChange={(e) => updateJeeSubjectTotal(s.subject, Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                        </div>

                        {/* Diagram vs Text Breakdown */}
                        <div className="bg-white rounded-lg p-2.5 space-y-2 border border-slate-200 text-xs">
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
                              onChange={(e) => updateJeeSubjectDiagrams(s.subject, Number(e.target.value))}
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
                              onChange={(e) => updateJeeSubjectText(s.subject, Number(e.target.value))}
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
              </div>

              {/* LIVE SUMMARY BANNER WITH GENERATE BUTTON */}
              {(() => {
                const totalQuestions = jeeSubjectSettings.reduce((acc, s) => acc + s.total, 0);
                const totalDiagrams = jeeSubjectSettings.reduce((acc, s) => acc + s.diagrams, 0);
                const totalText = jeeSubjectSettings.reduce((acc, s) => acc + s.text, 0);
                const totalMarks = totalQuestions * 4;

                return (
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div>
                        <span className="text-blue-300 block text-[10px] uppercase font-bold">Total Examination</span>
                        <span className="text-base font-extrabold text-white">
                          {totalQuestions} Questions ({totalMarks} Marks)
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                      <div>
                        <span className="text-emerald-300 block text-[10px] uppercase font-bold">Vector Diagrams</span>
                        <span className="text-sm font-bold text-emerald-200">
                          {totalDiagrams} Questions ({totalQuestions > 0 ? Math.round((totalDiagrams / totalQuestions) * 100) : 0}%)
                        </span>
                      </div>
                      <div className="h-8 w-px bg-slate-700 hidden sm:block" />
                      <div>
                        <span className="text-indigo-300 block text-[10px] uppercase font-bold">Text-Only Problems</span>
                        <span className="text-sm font-bold text-indigo-200">
                          {totalText} Questions ({totalQuestions > 0 ? Math.round((totalText / totalQuestions) * 100) : 0}%)
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateJeePaperInline}
                      disabled={isJeeGenerating || totalQuestions === 0}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isJeeGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Configured Paper...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Paper Now ({totalQuestions} Questions)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Generated Paper Section */}
            {jeePaperQuestions.length > 0 ? (
              <div className="space-y-4">
                {/* Paper Status Bar */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] font-bold text-blue-300 uppercase tracking-wider">
                      <span>{jeeExamType} Official Paper Format</span>
                      <span>•</span>
                      <span>{jeePaperQuestions.length} Questions</span>
                      <span>•</span>
                      <span>{jeePaperQuestions.length * 4} Marks (+4, -1)</span>
                      <span>•</span>
                      <span>{jeeTimeLimit} Minutes</span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {jeePaperTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-300 mt-2">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono">
                        {jeePaperQuestions.filter((q) => q.requiresDiagram).length} Questions with Diagrams
                      </span>
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-md font-mono">
                        {jeePaperQuestions.filter((q) => !q.requiresDiagram).length} Text-Only Questions
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 text-xs">
                      <button
                        onClick={() => setJeePreviewTab('paper')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                          jeePreviewTab === 'paper' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Question Paper View
                      </button>
                      <button
                        onClick={() => setJeePreviewTab('solutions')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                          jeePreviewTab === 'solutions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Answer Key & Rubrics
                      </button>
                    </div>

                    <button
                      onClick={handleAssignJeePaperToCohort}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {jeeAssignedSuccess ? (
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
                        setSelectedForPaper(jeePaperQuestions.map((q) => q.id));
                        setIsPaperModalOpen(true);
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
                    {(['all', ...jeeSubjectSettings.map((s) => s.subject)] as const).map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setJeeActiveSectionFilter(sec as any)}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                          jeeActiveSectionFilter === sec
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
                      onClick={() => setJeeFormatFilter('all')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        jeeFormatFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      All ({jeePaperQuestions.length})
                    </button>
                    <button
                      onClick={() => setJeeFormatFilter('diagram')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        jeeFormatFilter === 'diagram' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Diagrams ({jeePaperQuestions.filter((q) => q.requiresDiagram).length})</span>
                    </button>
                    <button
                      onClick={() => setJeeFormatFilter('text')}
                      className={`px-2.5 py-0.5 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        jeeFormatFilter === 'text' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-indigo-700'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>Text-Only ({jeePaperQuestions.filter((q) => !q.requiresDiagram).length})</span>
                    </button>
                  </div>
                </div>

                {/* Question Cards in Official Paper Order */}
                <div className="space-y-4">
                  {jeePaperQuestions
                    .filter((q) => {
                      if (jeeActiveSectionFilter !== 'all' && q.subject !== jeeActiveSectionFilter) return false;
                      if (jeeFormatFilter === 'diagram' && !q.requiresDiagram) return false;
                      if (jeeFormatFilter === 'text' && q.requiresDiagram) return false;
                      return true;
                    })
                    .map((q) => {
                      const globalIdx = jeePaperQuestions.findIndex((gq) => gq.id === q.id) + 1;
                      return (
                        <div
                          key={q.id}
                          className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4"
                        >
                          {/* Meta Header with Question Type Tagging */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs">
                                Q{globalIdx}
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
                                  <span>Pure Text-Only ({q.questionType === 'numerical' ? 'Numerical' : 'Theory'})</span>
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

                          {/* Diagram Container (If Diagram Question) */}
                          {q.requiresDiagram && q.diagram && (
                            <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200 max-w-xl mx-auto">
                              <DiagramViewer diagram={q.diagram} />
                            </div>
                          )}

                          {/* Numerical or Options Grid */}
                          {q.questionType === 'numerical' ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs flex items-center justify-between text-blue-900 font-medium">
                              <span>NTA Numerical Value Type Question. Enter numerical value on on-screen keypad.</span>
                              {jeePreviewTab === 'solutions' && (
                                <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-300">
                                  Correct Value: {q.correctAnswer}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {q.options.map((opt) => {
                                const isCorrect = opt.label === q.correctAnswer;
                                const showHighlight = jeePreviewTab === 'solutions' && isCorrect;

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

                          {/* Solutions on Answer Key Mode */}
                          {jeePreviewTab === 'solutions' && q.solution && (
                            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
                              <div className="flex items-center justify-between font-bold text-amber-900">
                                <span>Step-by-Step Derivation & Analysis</span>
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
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <Award className="w-12 h-12 text-blue-500 mx-auto opacity-70" />
                <h3 className="text-base font-bold text-slate-900">No Examination Paper Generated Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select your target examination pattern (JEE 75 questions, NEET 180 questions, or custom counts), customize the diagram and text split per subject, or click <strong>"🎲 Randomize All"</strong>, then press <strong>"Generate Paper Now"</strong>.
                </p>
                <button
                  onClick={handleGenerateJeePaperInline}
                  disabled={isJeeGenerating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Configured Exam Paper</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVIEW AND EDIT WORKSHOP */}
        {activeTab === 'review' && (
          <div className="space-y-5">
            {/* Header & Filter Controls */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Question Bank Review & Edit Workshop
                  </h2>
                  <p className="text-xs text-slate-500">
                    Filter, inspect diagrams, modify parameters, and approve exam items
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Subject Filter Dropdown */}
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="All">All Subjects</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>

                {/* Topic-Wise Filter Dropdown (Per Project Brief) */}
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium max-w-[200px] truncate"
                >
                  <option value="All">All Topics ({availableTopics.length})</option>
                  {availableTopics.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="All">All Difficulties</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET">NEET UG</option>
                  <option value="CBSE Board">CBSE Board</option>
                </select>

                <select
                  value={filterDiagram}
                  onChange={(e) => setFilterDiagram(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="All">All Formats</option>
                  <option value="Diagrams Only">Diagrams Only</option>
                  <option value="Text Only">Text Only</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search question text..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* List of Questions */}
            <div className="space-y-4">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isSelectedForPaper={selectedForPaper.includes(q.id)}
                    onToggleSelectForPaper={() => handleToggleSelectForPaper(q.id)}
                    onEdit={() => setEditingQuestion(q)}
                    onDelete={() => onDeleteQuestion(q.id)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                  <p className="text-sm font-semibold">No questions match your current filters.</p>
                  <p className="text-xs text-slate-400">Try resetting filters or generate new questions in the Studio.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAPER ASSEMBLY & ASSIGNMENT HUB */}
        {activeTab === 'assembly' && (
          <div className="space-y-6">
            {/* Paper Assembly Toolbar Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Examination Paper Assembly & Assignment Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Selected Questions: <strong className="text-blue-600">{selectedForPaper.length}</strong> • Total Marks: <strong className="text-slate-800">{selectedForPaper.length * 4}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPaperModalOpen(true)}
                  disabled={selectedForPaper.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-40"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview, Print & Assign Paper</span>
                </button>
              </div>
            </div>

            {/* List of Published & Assigned Papers */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span>Published & Assigned Examination Papers ({assignedPapers.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  Visible to students in their "Receive Paper" portal
                </span>
              </div>

              <div className="space-y-3">
                {assignedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{paper.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {paper.targetExam}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Assigned: {paper.assignedToLabel || 'All Students'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-3">
                        <span>{paper.questions?.length || 4} Questions</span>
                        <span>•</span>
                        <span>{paper.totalMarks || 16} Marks</span>
                        <span>•</span>
                        <span>{paper.timeLimitMinutes || 20} Minutes</span>
                        <span>•</span>
                        <span>Assigned by {paper.assignedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedForPaper(paper.questions.map((q) => q.id));
                          setIsPaperModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Sheet</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Currently Selected Questions Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Questions in Active Paper ({paperQuestions.length})
              </h3>
              {paperQuestions.length > 0 ? (
                paperQuestions.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    isSelectedForPaper={true}
                    onToggleSelectForPaper={() => handleToggleSelectForPaper(q.id)}
                    onEdit={() => setEditingQuestion(q)}
                    onDelete={() => onDeleteQuestion(q.id)}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                  <p className="text-sm font-semibold">No questions currently selected.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select questions from the Studio or Question Bank to assemble an exam paper.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CLASS ANALYTICS & STUDENT ROSTER */}
        {activeTab === 'analytics' && (
          <TeacherStudentDirectory
            students={students}
            onAddStudent={onAddStudent}
            onUpdateStudent={onUpdateStudent}
            onDeleteStudent={onDeleteStudent}
          />
        )}

        {/* TAB 5: KNOWLEDGE BASE (RAG LIBRARY) */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer
            docs={knowledgeDocs}
            onAddDoc={onAddKnowledgeDoc}
          />
        )}

        {/* TAB 6: ARCHITECTURE FLOWCHART */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                VisuRank Official System Architecture
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Dual-Path Multimodal RAG Engine with Decision Logic & Live Vector SVG Generation
              </p>
              <WorkflowPipeline currentStage="completed" />
            </div>
          </div>
        )}
      </main>

      {/* PAPER ASSEMBLY MODAL (Export PDF & Assign to Students) */}
      {isPaperModalOpen && (
        <PaperAssemblyModal
          questions={paperQuestions}
          onClose={() => setIsPaperModalOpen(false)}
          onRemoveQuestion={(id) => handleToggleSelectForPaper(id)}
          onAssignPaper={async (paperData) => {
            await onAssignPaper({
              ...paperData,
              subject,
              questions: paperQuestions,
            });
            setIsPaperModalOpen(false);
          }}
        />
      )}

      {/* EDIT QUESTION MODAL */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Examination Item</span>
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Question Text (supports LaTeX math)
                </label>
                <textarea
                  rows={4}
                  value={editingQuestion.questionText}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Topic & Subtopic
                </label>
                <input
                  type="text"
                  value={editingQuestion.subtopic}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, subtopic: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Correct Answer Key
                </label>
                <select
                  value={editingQuestion.correctAnswer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, correctAnswer: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Review Status
                </label>
                <select
                  value={editingQuestion.reviewStatus}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      reviewStatus: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option value="approved">Approved for Examination</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="needs_revision">Needs Revision</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateQuestion(editingQuestion);
                  setEditingQuestion(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal Image Problem Solver Modal */}
      {isImageSolverOpen && (
        <ImageProblemSolverModal
          onClose={() => setIsImageSolverOpen(false)}
          onAddQuestionToBank={(q) => {
            onAddQuestion(q);
          }}
        />
      )}

      {/* YouTube Video Lecture Summarizer Modal */}
      {isYouTubeSummarizerOpen && (
        <YouTubeSummarizerModal
          onClose={() => setIsYouTubeSummarizerOpen(false)}
          onAddQuestionToBank={(q) => {
            onAddQuestion(q);
          }}
        />
      )}

      {/* Syllabus AI Doubt Resolver Modal */}
      {isDoubtChatOpen && (
        <DoubtSolverChatModal
          onClose={() => setIsDoubtChatOpen(false)}
          initialSubject={subject}
        />
      )}

      {/* Dedicated NTA JEE Multimodal Paper Generator Modal */}
      {isJeePaperModalOpen && (
        <JeePaperGeneratorModal
          isOpen={isJeePaperModalOpen}
          onClose={() => setIsJeePaperModalOpen(false)}
          questions={questions}
          onAddQuestion={onAddQuestion}
          onAssignPaper={onAssignPaper}
          onOpenPaperAssembly={(qIds) => {
            setSelectedForPaper(qIds);
            setIsPaperModalOpen(true);
          }}
        />
      )}
      </div>
    </div>
  );
};
