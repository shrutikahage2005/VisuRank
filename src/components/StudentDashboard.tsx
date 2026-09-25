import React, { useState } from 'react';
import {
  StudentRegistration,
  Question,
  TargetExam,
  StudentGrade,
  AuthUser,
  AssignedPaper,
  StudentAttemptHistory,
} from '../types';
import { StudentTestView } from './StudentTestView';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { ImageProblemSolverModal } from './ImageProblemSolverModal';
import { YouTubeSummarizerModal } from './YouTubeSummarizerModal';
import { DoubtSolverChatModal } from './DoubtSolverChatModal';
import {
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  HelpCircle,
  QrCode,
  Calendar,
  CheckCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Search,
  User,
  ArrowRight,
  LogOut,
  Layers,
  Send,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BarChart3,
  Users,
  Printer,
  Camera,
  Youtube,
  MessageSquare,
  Target,
} from 'lucide-react';

interface StudentDashboardProps {
  questions: Question[];
  students: StudentRegistration[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  onRegisterStudent: (data: {
    name: string;
    email: string;
    targetExam: TargetExam;
    grade: StudentGrade;
    phone?: string;
  }) => Promise<StudentRegistration | null>;
  onRecordAttempt: (studentId: string, attemptData: any) => Promise<void>;
  onOpenAskModal: () => void;
  assignedPapers: AssignedPaper[];
  currentUser: AuthUser;
  onLogout: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  questions,
  students,
  currentStudentId,
  onSelectStudent,
  onRegisterStudent,
  onRecordAttempt,
  onOpenAskModal,
  assignedPapers,
  currentUser,
  onLogout,
}) => {
  const [studentNav, setStudentNav] = useState<'receive_paper' | 'cbt_room' | 'results' | 'id_card' | 'history'>('receive_paper');
  const [activeTestQuestions, setActiveTestQuestions] = useState<Question[]>([]);
  const [activeTestTitle, setActiveTestTitle] = useState('JEE / NEET Multimodal Practice Examination');
  const [activeTimeLimit, setActiveTimeLimit] = useState(20);

  // Latest Test Result state for "Results and analytics" tab
  const [latestResult, setLatestResult] = useState<{
    testTitle: string;
    subject: string;
    score: number;
    maxScore: number;
    accuracy: number;
    attemptedQuestions: any[];
  } | null>(null);

  // New Interactive Modals from VisuRank Brief
  const [isImageSolverOpen, setIsImageSolverOpen] = useState(false);
  const [isYouTubeSummarizerOpen, setIsYouTubeSummarizerOpen] = useState(false);
  const [isDoubtChatOpen, setIsDoubtChatOpen] = useState(false);
  const [selectedPracticeTopic, setSelectedPracticeTopic] = useState('All');

  // Find the active student
  const currentStudent =
    students.find((s) => s.id === currentStudentId) ||
    students.find((s) => s.id === currentUser.id) ||
    students[0];

  // Filter assigned papers relevant to this student (assigned to 'all', or matching student's target exam)
  const myAssignedPapers = assignedPapers.filter((p) => {
    if (p.assignedTo === 'all') return true;
    if (currentStudent && p.assignedTo === currentStudent.targetExam) return true;
    if (currentStudent && p.assignedTo === currentStudent.id) return true;
    return true; // default visible for exploration
  });

  const handleStartAssignedPaper = (paper: AssignedPaper) => {
    setActiveTestQuestions(paper.questions);
    setActiveTestTitle(paper.title);
    setActiveTimeLimit(paper.timeLimitMinutes || 20);
    setStudentNav('cbt_room');
  };

  const handleStartMockTest = (mockSubject: string, examType: TargetExam) => {
    const subjectQuestions = questions.filter((q) => q.subject === mockSubject);
    const testPool = subjectQuestions.length >= 3 ? subjectQuestions : questions;
    setActiveTestQuestions(testPool);
    setActiveTestTitle(`${examType} ${mockSubject} Comprehensive CBT Mock`);
    setActiveTimeLimit(15);
    setStudentNav('cbt_room');
  };

  const handleStartTopicPractice = (topicName: string) => {
    const topicQuestions = questions.filter(
      (q) => q.topic.toLowerCase() === topicName.toLowerCase()
    );
    const pool = topicQuestions.length > 0 ? topicQuestions : questions;
    setActiveTestQuestions(pool.slice(0, 4));
    setActiveTestTitle(`Topic Mastery Drill: ${topicName}`);
    setActiveTimeLimit(12);
    setStudentNav('cbt_room');
  };

  const handleTestComplete = async (attemptData: any) => {
    setLatestResult(attemptData);
    if (currentStudent) {
      await onRecordAttempt(currentStudent.id, attemptData);
    }
    setStudentNav('results');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans antialiased">
      {/* STUDENT PORTAL TOP BAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md font-extrabold text-base">
              CBT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">VisuRank</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Student CBT Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                National Testing Agency (NTA) Simulation Interface
              </p>
            </div>
          </div>

          {/* Student Profile Card in Header */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {currentStudent?.avatarInitials || 'ST'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentStudent?.name || 'Student Candidate'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">Roll: {currentStudent?.rollNumber}</span>
                  <span>•</span>
                  <span>{currentStudent?.targetExam}</span>
                </div>
              </div>
            </div>

            {/* Candidate Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>CBT Candidate Portal</span>
            </div>

            {/* Sign Out */}
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Sign Out to Dashboard Selector"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs for Student */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex space-x-2 overflow-x-auto py-1 scrollbar-none">
            {[
              { id: 'receive_paper', label: '1. Receive Paper & Mock Tests', icon: <FileText className="w-4 h-4" /> },
              { id: 'cbt_room', label: '2. Attempt Questions (Live CBT)', icon: <Clock className="w-4 h-4" /> },
              { id: 'results', label: '3. Results & Auto-Checking', icon: <Award className="w-4 h-4" /> },
              { id: 'id_card', label: '4. Digital Student ID', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'history', label: `5. Test History (${currentStudent?.recentAttempts?.length || 0})`, icon: <BarChart3 className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStudentNav(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  studentNav === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* STUDENT CONTENT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Institutional Attribution & Quick Action Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px] uppercase tracking-wider">
              VisuRank Student Portal
            </span>
            <div>
              <span className="font-bold text-slate-900">
                PiyushAI Edtech Pvt. Ltd. & P. R. Pote Patil College of Engineering
              </span>
              <span className="text-slate-500 hidden md:inline">
                {' '}• Dept. of AI & Data Science
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Practice with live vector diagrams, upload textbook doubts, or summarize lecture videos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImageSolverOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snap & Solve Image</span>
            </button>
            <button
              onClick={() => setIsYouTubeSummarizerOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube Video Practice</span>
            </button>
            <button
              onClick={() => setIsDoubtChatOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Doubt Tutor</span>
            </button>
          </div>
        </div>

        {/* TAB 1: RECEIVE PAPER (ASSIGNED & MOCK TESTS) */}
        {studentNav === 'receive_paper' && (
          <div className="space-y-6">
            {/* Student Candidate Welcome Ribbon */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs bg-emerald-500/30 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  National CBT Testing Candidate
                </span>
                <h2 className="text-xl font-extrabold tracking-tight">
                  Welcome back, {currentStudent?.name}!
                </h2>
                <p className="text-xs text-emerald-100 max-w-xl">
                  You are registered for <strong>{currentStudent?.targetExam}</strong> ({currentStudent?.grade}). Attempt faculty-assigned papers below or launch full simulated mock examinations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-bold">{currentStudent?.testsCompleted || 0}</div>
                  <div className="text-[10px] text-emerald-100 uppercase">Tests Taken</div>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2 rounded-xl text-center">
                  <div className="text-lg font-bold">{currentStudent?.averageScore || 0}%</div>
                  <div className="text-[10px] text-emerald-100 uppercase">Avg Score</div>
                </div>
              </div>
            </div>

            {/* SECTION A: ASSIGNED PAPERS BY FACULTY */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Papers Assigned by Faculty ({myAssignedPapers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Official tests assembled and assigned to your cohort by Dr. Aris Thorne
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">
                  Ready to Attempt
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAssignedPapers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all flex flex-col justify-between space-y-4 shadow-2xs group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {paper.targetExam}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {paper.timeLimitMinutes} Mins
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {paper.instructions || 'Standard JEE/NEET marking scheme with synchronized vector diagrams.'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                        <span><strong>{paper.questions?.length || 4}</strong> Questions</span>
                        <span>•</span>
                        <span><strong>{paper.totalMarks || 16}</strong> Marks</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">+4 / -1 Scheme</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartAssignedPaper(paper)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Start Assigned Examination</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION B: STANDARD MOCK TESTS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Standard National CBT Mock Tests
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instant practice examinations generated from the RAG Knowledge Base with diagrams
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { subject: 'Physics', exam: 'JEE Main' as TargetExam, title: 'Physics Circuits & Mechanics Drill', questionsCount: 4, desc: 'Parallel resistors, inclined planes, and PV diagrams.' },
                  { subject: 'Chemistry', exam: 'JEE Advanced' as TargetExam, title: 'Chemistry Organic & Kinetics Drill', questionsCount: 3, desc: 'Benzene reactions, rate constants, and half-cell potentials.' },
                  { subject: 'Mathematics', exam: 'JEE Main' as TargetExam, title: 'Mathematics Conics & Calculus', questionsCount: 3, desc: 'Tangent equations, integral loops, and vectors.' },
                  { subject: 'Biology', exam: 'NEET' as TargetExam, title: 'NEET Biology Rapid Fire', questionsCount: 3, desc: 'Organelle identification, cell division, and physiology.' },
                ].map((mock, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-500 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {mock.exam}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{mock.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-normal">{mock.desc}</p>
                    </div>

                    <button
                      onClick={() => handleStartMockTest(mock.subject, mock.exam)}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Launch Mock Test</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION C: PRACTICE BY TOPIC (PER PROJECT BRIEF) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Practice by Syllabus Topic & Weak Areas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Targeted multimodal practice drills to strengthen conceptual retention and visual diagram mastery
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Instant Feedback & Checking
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    topic: "Current Electricity & Kirchhoff's Laws",
                    sub: 'Physics',
                    difficulty: 'JEE Main',
                    icon: '⚡',
                    questionsCount: questions.filter(q => q.topic.includes('Current')).length || 2
                  },
                  {
                    topic: 'Newton’s Laws & Friction On Incline',
                    sub: 'Physics',
                    difficulty: 'JEE Advanced',
                    icon: '📐',
                    questionsCount: questions.filter(q => q.topic.includes('Friction')).length || 2
                  },
                  {
                    topic: 'Geometrical Ray Optics & Lens Formula',
                    sub: 'Physics',
                    difficulty: 'NEET / JEE',
                    icon: '🔍',
                    questionsCount: questions.filter(q => q.topic.includes('Optics')).length || 2
                  },
                  {
                    topic: 'Thermodynamic Indicator P-V Cycles',
                    sub: 'Physics',
                    difficulty: 'JEE Main',
                    icon: '🌡️',
                    questionsCount: questions.filter(q => q.topic.includes('Thermo')).length || 1
                  },
                  {
                    topic: 'Electrophilic Aromatic Benzene Nitration',
                    sub: 'Chemistry',
                    difficulty: 'JEE Advanced',
                    icon: '🧪',
                    questionsCount: questions.filter(q => q.topic.includes('Benzene')).length || 1
                  },
                  {
                    topic: 'Conic Sections: Parabola & Tangents',
                    sub: 'Mathematics',
                    difficulty: 'JEE Main',
                    icon: '📊',
                    questionsCount: questions.filter(q => q.topic.includes('Conic')).length || 1
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-500 transition-all flex flex-col justify-between space-y-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        <span>{item.sub} • {item.difficulty}</span>
                        <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                          {item.questionsCount} Qs
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 leading-snug">
                        {item.topic}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleStartTopicPractice(item.topic)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Topic Drill</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTEMPT QUESTIONS (LIVE CBT EXAM ROOM) */}
        {studentNav === 'cbt_room' && (
          <div className="space-y-4">
            <StudentTestView
              questions={activeTestQuestions.length > 0 ? activeTestQuestions : questions}
              onCompleteTest={handleTestComplete}
            />
          </div>
        )}

        {/* TAB 3: RESULTS AND AUTO-CHECKING */}
        {studentNav === 'results' && (
          <div className="space-y-6">
            {latestResult ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                {/* Result Top Banner */}
                <div className="border-b border-slate-100 pb-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Auto-Checking Completed by Gemini AI
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      Examination Performance Diagnostic Report
                    </h2>
                    <p className="text-xs text-slate-500">
                      Test: <strong>{latestResult.testTitle}</strong> • Subject: <strong>{latestResult.subject}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setStudentNav('receive_paper')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Take Another Examination
                  </button>
                </div>

                {/* Score Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-emerald-600">
                      {latestResult.score} / {latestResult.maxScore}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      Net Score (+4 / -1)
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-blue-600">
                      {latestResult.accuracy}%
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      Accuracy Rate
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-indigo-600">
                      {latestResult.attemptedQuestions?.filter((q: any) => q.isCorrect).length}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      Correct Answers
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                    <div className="text-2xl font-extrabold text-rose-600">
                      {latestResult.attemptedQuestions?.filter((q: any) => !q.isCorrect && q.selectedOption !== 'Unattempted').length}
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                      Incorrect Answers (-1)
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Itemized Response Sheet */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Itemized CBT Answer Sheet & KaTeX Derivations</span>
                  </h3>

                  <div className="space-y-3">
                    {latestResult.attemptedQuestions?.map((item: any, idx: number) => {
                      const fullQ = questions.find((q) => q.id === item.questionId);
                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            item.isCorrect
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : item.selectedOption === 'Unattempted'
                              ? 'border-slate-200 bg-slate-50/50'
                              : 'border-rose-200 bg-rose-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[10px]">
                                Q{idx + 1}
                              </span>
                              <span>Question {idx + 1}</span>
                            </span>

                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                item.isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.selectedOption === 'Unattempted'
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.isCorrect ? '+4 Marks (Correct)' : item.selectedOption === 'Unattempted' ? '0 Marks (Skipped)' : '-1 Mark (Incorrect)'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-800 font-medium">
                            <MathText text={item.questionText} />
                          </div>

                          {/* Diagram if available */}
                          {fullQ?.requiresDiagram && fullQ.diagram && (
                            <div className="my-2 max-w-sm">
                              <DiagramViewer diagram={fullQ.diagram} editable={false} />
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Your Chosen Option:</span>
                              <strong className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                                {item.selectedOption}
                              </strong>
                            </div>
                            <div className="p-2 rounded bg-white border border-slate-200">
                              <span className="text-[10px] text-slate-500 block">Official Correct Key:</span>
                              <strong className="text-emerald-700">Option {item.correctOption}</strong>
                            </div>
                          </div>

                          {/* Derivation */}
                          {fullQ?.solution && (
                            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                              <span className="font-bold text-slate-900 block text-[11px]">
                                Step-by-Step Derivation:
                              </span>
                              {fullQ.solution.stepByStep?.map((st: string, sIdx: number) => (
                                <p key={sIdx} className="text-slate-600"><MathText text={st} /></p>
                              ))}
                              <p className="text-emerald-700 font-bold mt-1">
                                {fullQ.solution.finalAnswer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
                <Award className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No recent test completed in this session</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Attempt a faculty-assigned paper or a standard mock test to generate your instant multimodal evaluation and score report.
                </p>
                <button
                  onClick={() => setStudentNav('receive_paper')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Go to Receive Paper Hub
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIGITAL STUDENT ID CARD */}
        {studentNav === 'id_card' && currentStudent && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

              {/* ID Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                    National Testing Agency • CBT Candidate ID
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    VISURANK ACADEMIC ACCREDITATION
                  </h3>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              {/* ID Details */}
              <div className="flex items-center gap-6">
                <div className="w-24 h-28 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                  <span className="text-3xl font-extrabold">{currentStudent.avatarInitials}</span>
                  <span className="text-[9px] text-emerald-400 font-mono mt-1">VERIFIED</span>
                </div>

                <div className="space-y-1.5 flex-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate Name</span>
                    <strong className="text-base text-slate-900 font-bold">{currentStudent.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Roll Number</span>
                    <strong className="font-mono text-emerald-700 font-bold text-sm">{currentStudent.rollNumber}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Exam</span>
                      <strong className="text-slate-800">{currentStudent.targetExam}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Grade / Standard</span>
                      <strong className="text-slate-800">{currentStudent.grade}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candidate Examination Clearance */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">CBT Examination Clearance</div>
                  <div className="text-xs font-semibold text-emerald-950">Accredited Candidate for Online Testing & Evaluation</div>
                </div>
                <div className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Clearance Active</span>
                </div>
              </div>

              {/* Bottom Barcode / QR Simulation */}
              <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-slate-800" />
                  <span className="font-mono text-[10px]">AUTH_TOKEN_HASH_SECURE_2026</span>
                </div>
                <span className="text-emerald-700 font-bold uppercase">Status: {currentStudent.status}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TEST HISTORY */}
        {studentNav === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Completed Examinations History ({currentStudent?.recentAttempts?.length || 0})
            </h3>
            {currentStudent?.recentAttempts && currentStudent.recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {currentStudent.recentAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{att.testTitle}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(att.completedAt).toLocaleString()} • {att.subject}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-700">
                          {att.score} / {att.maxScore} Marks
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {att.accuracy}% Accuracy
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setLatestResult(att as any);
                          setStudentNav('results');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Inspect Sheet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No previous tests completed yet.</p>
            )}
          </div>
        )}
      </main>

      {/* Multimodal Image Problem Solver Modal */}
      {isImageSolverOpen && (
        <ImageProblemSolverModal
          onClose={() => setIsImageSolverOpen(false)}
        />
      )}

      {/* YouTube Video Lecture Summarizer Modal */}
      {isYouTubeSummarizerOpen && (
        <YouTubeSummarizerModal
          onClose={() => setIsYouTubeSummarizerOpen(false)}
        />
      )}

      {/* Syllabus AI Doubt Resolver Modal */}
      {isDoubtChatOpen && (
        <DoubtSolverChatModal
          onClose={() => setIsDoubtChatOpen(false)}
          initialSubject="Physics"
        />
      )}
    </div>
  );
};
