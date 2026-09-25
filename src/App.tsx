import React, { useState, useEffect } from 'react';
import {
  Question,
  KnowledgeDoc,
  StudentRegistration,
  TargetExam,
  StudentGrade,
  AuthUser,
  AssignedPaper,
} from './types';
import { INITIAL_QUESTIONS } from './lib/sampleQuestions';
import { INITIAL_KNOWLEDGE_BASE } from './lib/knowledgeBase';
import { INITIAL_STUDENTS } from './lib/sampleStudents';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { LoginPortal } from './components/LoginPortal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { ShieldCheck, GraduationCap, ArrowRightLeft } from 'lucide-react';

export default function App() {
  // Authentication user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('visurank_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to null so user arrives at the authentic Login Gateway
    return null;
  });

  // Question bank state (seeded with high quality initial questions)
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);

  // Knowledge base state
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>(INITIAL_KNOWLEDGE_BASE);

  // Student registrations state (accessible to teacher, editable by both)
  const [students, setStudents] = useState<StudentRegistration[]>(INITIAL_STUDENTS);
  const [currentStudentId, setCurrentStudentId] = useState<string>(INITIAL_STUDENTS[0]?.id || 'stud-001');

  // Assigned Examination Papers state
  const [assignedPapers, setAssignedPapers] = useState<AssignedPaper[]>([]);

  // Ask Question / Doubt Modal
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Load state from backend endpoints on initial mount
  useEffect(() => {
    // 1. Fetch Knowledge Base
    fetch('/api/rag/knowledge-base')
      .then((res) => res.json())
      .then((data) => {
        if (data.docs && Array.isArray(data.docs) && data.docs.length > 0) {
          setKnowledgeDocs(data.docs);
        }
      })
      .catch((err) => console.log('Using local knowledge base:', err));

    // 2. Fetch Students Directory
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.students && Array.isArray(data.students) && data.students.length > 0) {
          setStudents(data.students);
          if (!data.students.some((s: any) => s.id === currentStudentId)) {
            setCurrentStudentId(data.students[0].id);
          }
        }
      })
      .catch((err) => console.log('Using local students list:', err));

    // 3. Fetch Assigned Examination Papers
    fetch('/api/papers')
      .then((res) => res.json())
      .then((data) => {
        if (data.papers && Array.isArray(data.papers) && data.papers.length > 0) {
          setAssignedPapers(data.papers);
        }
      })
      .catch((err) => console.log('Using local papers:', err));
  }, []);

  // Save current auth user to localStorage on change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('visurank_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('visurank_auth_user');
    }
  }, [currentUser]);

  // Handler: Add Question
  const handleAddQuestion = (newQ: Question) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  // Handler: Update Question
  const handleUpdateQuestion = (updatedQ: Question) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === updatedQ.id ? updatedQ : q))
    );
  };

  // Handler: Delete Question
  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // Handler: Add Document to Knowledge Base
  const handleAddKnowledgeDoc = async (doc: any) => {
    try {
      const res = await fetch('/api/rag/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      const data = await res.json();
      if (data.doc) {
        setKnowledgeDocs((prev) => [data.doc, ...prev]);
        return;
      }
    } catch (err) {
      console.error(err);
    }
    const fallbackDoc: KnowledgeDoc = {
      id: `doc-${Date.now()}`,
      title: doc.title,
      subject: doc.subject,
      topic: doc.topic,
      content: doc.content,
      diagramCategory: doc.diagramCategory || doc.diagramType || 'schematic_diagram',
      formulas: doc.formulas || doc.keyFormulas || [],
    };
    setKnowledgeDocs((prev) => [fallbackDoc, ...prev]);
  };

  // Handler: Register New Student
  const handleAddStudent = async (studentData: {
    name: string;
    email: string;
    targetExam: TargetExam;
    grade: StudentGrade;
    phone?: string;
    notes?: string;
  }) => {
    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const data = await res.json();
      if (data.student) {
        setStudents((prev) => [data.student, ...prev]);
        setCurrentStudentId(data.student.id);
        return data.student;
      }
    } catch (err) {
      console.error(err);
    }

    // Fallback local registration
    const newStudent: StudentRegistration = {
      id: `stud-${Date.now()}`,
      name: studentData.name,
      email: studentData.email,
      rollNumber: `${studentData.targetExam === 'NEET' ? 'NEET' : 'JEE'}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      targetExam: studentData.targetExam,
      grade: studentData.grade,
      phone: studentData.phone || '',
      registeredAt: new Date().toISOString(),
      status: 'active',
      avatarInitials: studentData.name
        .split(' ')
        .map((n) => n[0].toUpperCase())
        .slice(0, 2)
        .join('') || 'ST',
      testsCompleted: 0,
      averageScore: 0,
      highestScore: 0,
      recentAttempts: [],
      notes: studentData.notes || 'Registered candidate from portal.',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setCurrentStudentId(newStudent.id);
    return newStudent;
  };

  // Handler: Update Student
  const handleUpdateStudent = async (id: string, updates: Partial<StudentRegistration>) => {
    try {
      await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error(err);
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Handler: Delete Student
  const handleDeleteStudent = async (id: string) => {
    try {
      await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error(err);
    }
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Handler: Assign Paper
  const handleAssignPaper = async (paperData: any) => {
    try {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...paperData,
          assignedBy: currentUser?.name || 'Dr. Aris Thorne',
        }),
      });
      const data = await res.json();
      if (data.paper) {
        setAssignedPapers((prev) => [data.paper, ...prev]);
        return;
      }
    } catch (err) {
      console.error('Failed to post paper:', err);
    }

    const fallbackPaper: AssignedPaper = {
      id: `paper-${Date.now()}`,
      title: paperData.title,
      subject: paperData.subject || 'Multidisciplinary',
      targetExam: paperData.targetExam,
      questions: paperData.questions || questions.slice(0, 4),
      timeLimitMinutes: paperData.timeLimitMinutes || 60,
      totalMarks: paperData.totalMarks || 16,
      assignedBy: currentUser?.name || 'Dr. Aris Thorne',
      assignedTo: paperData.assignedTo || 'all',
      assignedToLabel: paperData.assignedToLabel || 'All Enrolled Students',
      createdAt: new Date().toISOString(),
      instructions: paperData.instructions,
    };
    setAssignedPapers((prev) => [fallbackPaper, ...prev]);
  };

  // Handler: Record Test Attempt
  const handleRecordAttempt = async (studentId: string, attemptData: any) => {
    try {
      const res = await fetch(`/api/students/${studentId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attemptData),
      });
      const data = await res.json();
      if (data.student) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? data.student : s))
        );
        return;
      }
    } catch (err) {
      console.error(err);
    }

    // Fallback local update
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newCompleted = (s.testsCompleted || 0) + 1;
        const totalPrevious = (s.averageScore || 0) * (s.testsCompleted || 0);
        const newAvg = Math.round((totalPrevious + attemptData.accuracy) / newCompleted);
        const newHigh = Math.max(s.highestScore || 0, attemptData.accuracy);
        const newAttempt = {
          id: `att-${Date.now()}`,
          testTitle: attemptData.testTitle,
          subject: attemptData.subject,
          completedAt: new Date().toISOString(),
          score: attemptData.score,
          maxScore: attemptData.maxScore,
          accuracy: attemptData.accuracy,
          attemptedQuestions: attemptData.attemptedQuestions || [],
        };
        return {
          ...s,
          testsCompleted: newCompleted,
          averageScore: newAvg,
          highestScore: newHigh,
          recentAttempts: [newAttempt, ...(s.recentAttempts || [])],
        };
      })
    );
  };

  // Quick switch helpers between portals
  const handleSwitchToStudent = () => {
    const student = students[0];
    if (student) {
      setCurrentStudentId(student.id);
      setCurrentUser({
        id: student.id,
        name: student.name,
        email: student.email,
        role: 'student',
        targetExam: student.targetExam,
        rollNumber: student.rollNumber,
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // View routing
  if (!currentUser) {
    return (
      <LoginPortal
        students={students}
        onTeacherLogin={(teacherUser) => setCurrentUser(teacherUser)}
        onStudentLogin={(studentUser, studentRecord) => {
          setCurrentStudentId(studentRecord.id);
          setCurrentUser(studentUser);
        }}
        onStudentRegister={handleAddStudent}
      />
    );
  }

  return (
    <>
      {/* Top Persistent Bar: Displays the Active Separate Dashboard with Zero Cross-Role Access */}
      <div className="bg-slate-950 text-white border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-50 sticky top-0 shadow-md">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-600 font-bold flex items-center justify-center text-xs text-white">Ω</span>
          <span className="font-bold tracking-tight text-white hidden sm:inline">VisuRank</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400">Current Dashboard:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 ${
            currentUser.role === 'teacher'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
          }`}>
            {currentUser.role === 'teacher' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Teacher Dashboard (Faculty)</span>
              </>
            ) : (
              <>
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Dashboard (Candidate)</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'student' ? (
            <div className="hidden sm:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span className="text-slate-300 font-semibold">{currentUser.name}</span>
              {currentUser.rollNumber && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                  Roll: {currentUser.rollNumber}
                </span>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="text-blue-300 font-bold">{currentUser.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentUser.designation || 'Faculty'}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-slate-900 hover:bg-rose-950/70 hover:text-rose-300 text-slate-300 hover:border-rose-800 border border-slate-800 rounded-lg transition-colors font-medium text-xs flex items-center gap-1.5"
            title="Sign Out to Dashboard Selector"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {currentUser.role === 'teacher' ? (
        <TeacherDashboard
          questions={questions}
          onAddQuestion={handleAddQuestion}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          knowledgeDocs={knowledgeDocs}
          onAddKnowledgeDoc={handleAddKnowledgeDoc}
          students={students}
          onAddStudent={handleAddStudent}
          onUpdateStudent={handleUpdateStudent}
          onDeleteStudent={handleDeleteStudent}
          assignedPapers={assignedPapers}
          onAssignPaper={handleAssignPaper}
          currentUser={currentUser}
          onSwitchToStudent={handleSwitchToStudent}
          onLogout={handleLogout}
          onOpenAskModal={() => setIsAskModalOpen(true)}
        />
      ) : (
        <StudentDashboard
          questions={questions}
          students={students}
          currentStudentId={currentStudentId}
          onSelectStudent={setCurrentStudentId}
          onRegisterStudent={handleAddStudent}
          onRecordAttempt={handleRecordAttempt}
          onOpenAskModal={() => setIsAskModalOpen(true)}
          assignedPapers={assignedPapers}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* Global AI Doubt Resolver Modal */}
      {isAskModalOpen && (
        <AskQuestionModal
          onClose={() => setIsAskModalOpen(false)}
          onQuestionGenerated={(newQ) => {
            handleAddQuestion(newQ);
          }}
        />
      )}
    </>
  );
}
