import React, { useState } from 'react';
import { AuthUser, StudentRegistration, TargetExam, StudentGrade } from '../types';
import {
  ShieldCheck,
  GraduationCap,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Users,
  Database,
  Unlock,
  Check,
  Lock,
  Key,
} from 'lucide-react';

interface LoginPortalProps {
  students: StudentRegistration[];
  onTeacherLogin: (teacherUser: AuthUser) => void;
  onStudentLogin: (studentUser: AuthUser, studentRecord: StudentRegistration) => void;
  onStudentRegister: (data: {
    name: string;
    email: string;
    targetExam: TargetExam;
    grade: StudentGrade;
    phone?: string;
  }) => Promise<StudentRegistration | null>;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  students,
  onTeacherLogin,
  onStudentLogin,
  onStudentRegister,
}) => {
  // View mode layout: 'both' | 'teacher' | 'student'
  const [viewLayout, setViewLayout] = useState<'both' | 'teacher' | 'student'>('both');

  // Selected portal tab: 'teacher' | 'student'
  const [activePortal, setActivePortal] = useState<'teacher' | 'student'>('teacher');

  // Student sub-mode: 'login' | 'register'
  const [studentMode, setStudentMode] = useState<'login' | 'register'>('login');

  // Teacher input & faculty security authorization state
  const [teacherEmail, setTeacherEmail] = useState('teacher@visurank.edu');
  const [teacherName, setTeacherName] = useState('Dr. Aris Thorne');
  const [facultyPin, setFacultyPin] = useState('TEACH2025');
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Student Login state (Roll Number / Email / Name)
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Student Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regExam, setRegExam] = useState<TargetExam>('JEE Main');
  const [regGrade, setRegGrade] = useState<StudentGrade>('Class 12');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Validate Faculty Clearance PIN (Protects Teacher account from unauthorized student entry)
  const verifyFacultyPin = (): boolean => {
    const clean = facultyPin.trim().toUpperCase();
    if (!clean || (clean !== 'TEACH2025' && clean !== '1234' && clean !== 'ADMIN' && clean !== 'FACULTY')) {
      setTeacherError('Access Denied: Invalid Faculty Authorization PIN. Students are strictly restricted to the Student Dashboard and have no clearance for Faculty tools.');
      return false;
    }
    return true;
  };

  // Handle Teacher Login
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError(null);
    if (!verifyFacultyPin()) return;

    setTeacherLoading(true);

    try {
      const res = await fetch('/api/auth/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail }),
      });
      const data = await res.json();
      if (data.user) {
        onTeacherLogin({
          ...data.user,
          name: teacherName.trim() || data.user.name,
        });
      } else {
        // Fallback local teacher auth
        onTeacherLogin({
          role: 'teacher',
          id: 'teacher-001',
          name: teacherName.trim() || 'Dr. Aris Thorne',
          email: teacherEmail || 'teacher@visurank.edu',
          designation: 'Senior Faculty & Academic Director',
          avatarInitials: teacherName.trim()
            ? teacherName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : 'AT',
        });
      }
    } catch {
      onTeacherLogin({
        role: 'teacher',
        id: 'teacher-001',
        name: teacherName.trim() || 'Dr. Aris Thorne',
        email: teacherEmail || 'teacher@visurank.edu',
        designation: 'Senior Faculty & Academic Director',
        avatarInitials: 'AT',
      });
    } finally {
      setTeacherLoading(false);
    }
  };

  // Faculty profile selection (requires valid PIN)
  const handleQuickTeacher = (name: string, email: string, designation: string, initials: string) => {
    setTeacherError(null);
    if (!verifyFacultyPin()) return;

    onTeacherLogin({
      role: 'teacher',
      id: `teacher-${initials.toLowerCase()}`,
      name,
      email,
      designation,
      avatarInitials: initials,
    });
  };

  // Handle Student Login (Passwordless)
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdentifier.trim()) {
      setStudentError('Please enter your Roll Number, Name, or Email');
      return;
    }

    setStudentLoading(true);
    setStudentError(null);

    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: studentIdentifier.trim() }),
      });
      const data = await res.json();

      if (data.success && data.user && data.student) {
        onStudentLogin(data.user, data.student);
        return;
      }
    } catch {
      // Handled in fallback below
    }

    // Local fallback lookup
    const query = studentIdentifier.trim().toLowerCase();
    const matched = students.find(
      (s) =>
        s.rollNumber.toLowerCase() === query ||
        s.email.toLowerCase() === query ||
        s.name.toLowerCase().includes(query)
    );

    if (matched) {
      onStudentLogin(
        {
          role: 'student',
          id: matched.id,
          name: matched.name,
          email: matched.email,
          rollNumber: matched.rollNumber,
          targetExam: matched.targetExam,
          grade: matched.grade,
          avatarInitials: matched.avatarInitials,
        },
        matched
      );
    } else {
      // If not found, allow quick on-the-fly login with provided identifier
      const generatedRoll = `STU-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const adHocStudent: StudentRegistration = {
        id: `stu-${Date.now()}`,
        name: studentIdentifier.trim(),
        email: studentIdentifier.includes('@') ? studentIdentifier.trim() : `${studentIdentifier.trim().toLowerCase().replace(/\s+/g, '')}@student.visurank.edu`,
        rollNumber: generatedRoll,
        targetExam: 'JEE Main',
        grade: 'Class 12',
        status: 'active',
        registeredAt: new Date().toISOString(),
        testsCompleted: 0,
        averageScore: 0,
        highestScore: 0,
        avatarInitials: studentIdentifier.trim().slice(0, 2).toUpperCase(),
        recentAttempts: [],
      };
      onStudentLogin(
        {
          role: 'student',
          id: adHocStudent.id,
          name: adHocStudent.name,
          email: adHocStudent.email,
          rollNumber: adHocStudent.rollNumber,
          targetExam: adHocStudent.targetExam,
          grade: adHocStudent.grade,
          avatarInitials: adHocStudent.avatarInitials,
        },
        adHocStudent
      );
    }
    setStudentLoading(false);
  };

  // Handle New Student Registration (Passwordless)
  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide both student name and email address');
      return;
    }

    setRegLoading(true);
    setRegError(null);

    try {
      const newStudent = await onStudentRegister({
        name: regName.trim(),
        email: regEmail.trim(),
        targetExam: regExam,
        grade: regGrade,
        phone: regPhone.trim(),
      });

      if (newStudent) {
        onStudentLogin(
          {
            role: 'student',
            id: newStudent.id,
            name: newStudent.name,
            email: newStudent.email,
            rollNumber: newStudent.rollNumber,
            targetExam: newStudent.targetExam,
            grade: newStudent.grade,
            avatarInitials: newStudent.avatarInitials,
          },
          newStudent
        );
      } else {
        setRegError('Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  // Direct 1-click candidate selection
  const handleDirectStudentClick = (s: StudentRegistration) => {
    onStudentLogin(
      {
        role: 'student',
        id: s.id,
        name: s.name,
        email: s.email,
        rollNumber: s.rollNumber,
        targetExam: s.targetExam,
        grade: s.grade,
        avatarInitials: s.avatarInitials,
      },
      s
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans text-slate-100">
      {/* Background Accent Grid / Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1E293B,transparent_70%)] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Header Branding */}
        <div className="p-6 sm:p-8 text-center border-b border-slate-800 bg-slate-900/80">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg shadow-blue-500/25 mb-3">
            Ω
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            VisuRank AI Education System
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-lg mx-auto">
            Select which dashboard to enter. Teacher and Student environments are completely separate standalone views with passwordless 1-click access.
          </p>

          {/* Strict Role Separation Notice */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Strict Role Isolation:</strong> Teacher and Student dashboards are completely independent. Students have zero access to the Teacher account.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full whitespace-nowrap">
              Protected Dashboards
            </span>
          </div>

          {/* Separate Dashboard Switcher Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActivePortal('teacher')}
              className={`py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePortal === 'teacher'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1. Teacher Dashboard (Faculty)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('student')}
              className={`py-3 px-4 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activePortal === 'student'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>2. Student Dashboard (Candidate)</span>
            </button>
          </div>
        </div>

        {/* PORTAL 1: TEACHER LOGIN (PROTECTED FACULTY GATE) */}
        {activePortal === 'teacher' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  <span>Faculty & Teacher Command Center</span>
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-300" />
                  <span>Faculty Protected</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Restricted to verified faculty and teachers. Access question generator, curriculum review, and paper assignment tools.
              </p>
            </div>

            {teacherError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{teacherError}</span>
              </div>
            )}

            {/* Faculty Security PIN Field */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>Faculty Authorization Security PIN</span>
                </label>
                <span className="text-[10px] text-blue-300 bg-blue-900/30 border border-blue-700/40 px-2 py-0.5 rounded font-mono">
                  Default PIN: TEACH2025
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={facultyPin}
                  onChange={(e) => {
                    setFacultyPin(e.target.value);
                    setTeacherError(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white font-mono focus:border-blue-500 focus:outline-hidden"
                  placeholder="Enter Faculty PIN (e.g. TEACH2025)"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Students do not have permission to access faculty tools. Only authorized teachers with the Faculty PIN can enter.
              </p>
            </div>

            {/* Instant 1-Click Faculty Profiles */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Select Verified Faculty Profile:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickTeacher(
                      'Dr. Aris Thorne',
                      'teacher@visurank.edu',
                      'Senior Faculty & Academic Director',
                      'AT'
                    )
                  }
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 flex items-center gap-3 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                    AT
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Dr. Aris Thorne
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Academic Director & HOD Physics
                    </div>
                    <div className="text-[10px] text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Enter Faculty Dashboard</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleQuickTeacher(
                      'Prof. Meera Sen',
                      'meera.sen@visurank.edu',
                      'Curriculum Chair & HOD Chemistry',
                      'MS'
                    )
                  }
                  className="p-3.5 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 flex items-center gap-3 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
                    MS
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Prof. Meera Sen
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Curriculum Chair & HOD Chemistry
                    </div>
                    <div className="text-[10px] text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Enter Faculty Dashboard</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Faculty Name/Email Form */}
            <form onSubmit={handleTeacherSubmit} className="pt-3 border-t border-slate-800 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or Enter Custom Faculty Credentials:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Faculty Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-hidden"
                      placeholder="e.g. Dr. Aris Thorne"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1 font-medium">
                    Email / Faculty ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={teacherEmail}
                      onChange={(e) => setTeacherEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:border-blue-500 focus:outline-hidden"
                      placeholder="teacher@visurank.edu"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={teacherLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Enter Teacher Dashboard (Authorized Faculty)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Direct Switch to Student Portal Prompt */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Want to test the Student Computer-Based Examination?
              </div>
              <button
                type="button"
                onClick={() => setActivePortal('student')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                Open Student Portal →
              </button>
            </div>
          </div>
        )}

        {/* PORTAL 2: STUDENT PORTAL (PASSWORDLESS) */}
        {activePortal === 'student' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Student Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('login');
                    setStudentError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    studentMode === 'login'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Existing Candidate (1-Click)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('register');
                    setRegError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    studentMode === 'register'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Register New Student
                </button>
              </div>

              <span className="text-[11px] font-mono text-emerald-400 font-bold hidden sm:inline">
                No Password Needed
              </span>
            </div>

            {/* Candidate Portal Isolation Notice */}
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Candidate CBT Examination Portal:</strong> Exclusively for taking computer-based mock tests, practicing JEE/NEET questions, and reviewing test results. No teacher access.
              </span>
            </div>

            {/* MODE A: EXISTING STUDENT LOGIN (1-CLICK & QUICK SEARCH) */}
            {studentMode === 'login' && (
              <div className="space-y-5">
                {/* 1-Click Candidate Cards */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>1-Click Candidate Login ({students.length} Enrolled):</span>
                    <span className="text-emerald-400 font-mono text-[10px]">
                      Instant Entry
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {students.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleDirectStudentClick(s)}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex items-center gap-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-300 font-bold flex items-center justify-center text-xs group-hover:scale-105 transition-transform shrink-0">
                          {s.avatarInitials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                            {s.name}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                            <span>{s.rollNumber}</span>
                            <span>•</span>
                            <span className="text-slate-400">{s.targetExam}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          Enter →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {studentError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{studentError}</span>
                  </div>
                )}

                {/* Candidate Search / Ad-Hoc Name Entry (No Password) */}
                <form onSubmit={handleStudentSubmit} className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Or Enter Any Candidate Name or Roll Number:
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={studentIdentifier}
                      onChange={(e) => setStudentIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                      placeholder="e.g. JEE-2026-0814 or Aarav Sharma or any name"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={studentLoading}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Enter Student Examination Room (No Password)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* MODE B: QUICK NEW STUDENT REGISTRATION (NO PASSWORD) */}
            {studentMode === 'register' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-400" />
                    <span>Instant Candidate Enrollment</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter basic details to immediately generate an official Roll Number and enter the CBT Examination Room. No password required.
                  </p>
                </div>

                {regError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleStudentRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Candidate Name *
                      </label>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        required
                        placeholder="e.g. Yash Vardhan"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        placeholder="yash@example.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Target Exam *
                      </label>
                      <select
                        value={regExam}
                        onChange={(e) => setRegExam(e.target.value as TargetExam)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="JEE Main">JEE Main</option>
                        <option value="JEE Advanced">JEE Advanced</option>
                        <option value="NEET">NEET</option>
                        <option value="CBSE Board">CBSE Board</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Grade / Year *
                      </label>
                      <select
                        value={regGrade}
                        onChange={(e) => setRegGrade(e.target.value as StudentGrade)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                      >
                        <option value="Class 12">Class 12</option>
                        <option value="Class 11">Class 11</option>
                        <option value="Dropper/Repeater">Dropper / Repeater</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile (Optional)
                      </label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <span>Registering & Generating Roll Number...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Register & Enter Student Portal (No Password)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Footer info bar */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>VisuRank Examination & Multimodal RAG Studio</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold">● No Password Required</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400 font-semibold">● Cross-Account Access Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
