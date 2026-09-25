import React, { useState } from 'react';
import { StudentRegistration, TargetExam, StudentGrade } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  FileText,
  X,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Download,
  BookOpen,
  ArrowUpRight,
  Eye,
  XCircle,
} from 'lucide-react';

interface TeacherStudentDirectoryProps {
  students: StudentRegistration[];
  onAddStudent: (student: Omit<StudentRegistration, 'id' | 'registeredAt' | 'avatarInitials' | 'testsCompleted' | 'averageScore' | 'highestScore' | 'recentAttempts'>) => Promise<void>;
  onUpdateStudent: (id: string, updates: Partial<StudentRegistration>) => Promise<void>;
  onDeleteStudent: (id: string) => Promise<void>;
}

export const TeacherStudentDirectory: React.FC<TeacherStudentDirectoryProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<StudentRegistration | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  // Sub-tab view: 'roster' | 'submissions'
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'submissions'>('roster');
  const [inspectingAttempt, setInspectingAttempt] = useState<any | null>(null);

  // Flatten all submissions from all students for real-time teacher oversight
  const allSubmissions = React.useMemo(() => {
    const list: any[] = [];
    students.forEach((s) => {
      if (s.recentAttempts && Array.isArray(s.recentAttempts)) {
        s.recentAttempts.forEach((att) => {
          list.push({
            ...att,
            studentId: s.id,
            studentName: s.name,
            studentEmail: s.email,
            studentRoll: s.rollNumber,
            targetExam: s.targetExam,
            grade: s.grade,
            avatarInitials: s.avatarInitials,
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [students]);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentExam, setNewStudentExam] = useState<TargetExam>('JEE Main');
  const [newStudentGrade, setNewStudentGrade] = useState<StudentGrade>('Class 12');
  const [newStudentNotes, setNewStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesExam = examFilter === 'All' || s.targetExam === examFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesExam && matchesStatus;
  });

  // Analytics
  const totalRegistered = students.length;
  const totalActive = students.filter((s) => s.status === 'active' || s.status === 'verified').length;
  const avgCohortScore = students.length
    ? Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)
    : 0;
  const totalTestsAttempted = students.reduce((acc, s) => acc + s.testsCompleted, 0);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddStudent({
        name: newStudentName.trim(),
        email: newStudentEmail.trim(),
        rollNumber: '', // server will generate
        targetExam: newStudentExam,
        grade: newStudentGrade,
        phone: newStudentPhone.trim(),
        status: 'verified',
        notes: newStudentNotes.trim(),
      });
      // reset form
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPhone('');
      setNewStudentNotes('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedStudent) return;
    await onUpdateStudent(selectedStudent.id, { notes: notesDraft });
    setSelectedStudent({ ...selectedStudent, notes: notesDraft });
    setIsEditingNotes(false);
  };

  const handleToggleStatus = async (student: StudentRegistration) => {
    const nextStatus = student.status === 'verified' ? 'active' : student.status === 'active' ? 'pending' : 'verified';
    await onUpdateStudent(student.id, { status: nextStatus });
    if (selectedStudent && selectedStudent.id === student.id) {
      setSelectedStudent({ ...selectedStudent, status: nextStatus });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name,Roll Number,Email,Target Exam,Grade,Status,Registered At,Tests Completed,Average Score'];
    const rows = students.map(
      (s) =>
        `"${s.name}","${s.rollNumber}","${s.email}","${s.targetExam}","${s.grade}","${s.status}","${new Date(s.registeredAt).toLocaleDateString()}","${s.testsCompleted}","${s.averageScore}%"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Registrations_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Student Registrations & Enrollment Directory
              </h2>
              <span className="text-[11px] bg-blue-600 text-white font-mono font-bold px-2 py-0.5 rounded-full">
                {students.length} Registered
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Each student registered in the portal is logged here for teacher monitoring, test grading, and performance tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
            title="Download CSV of registered students"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Roster (CSV)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Student</span>
          </button>
        </div>
      </div>

      {/* Cohort Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Total Registrations
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalRegistered}</div>
          <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            100% accessible to teacher
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Active / Verified
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600">{totalActive}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {students.filter((s) => s.status === 'verified').length} verified IDs
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Avg Cohort Accuracy
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{avgCohortScore}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all CBT practice tests</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Tests Attempted
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalTestsAttempted}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Multimodal diagram papers</div>
        </div>
      </div>

      {/* Teacher Oversight Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'roster'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Students Roster</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'roster' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('submissions')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'submissions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Live Student Test Submissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'submissions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {allSubmissions.length}
          </span>
        </button>
      </div>

      {/* SUB-VIEW 1: REGISTERED STUDENTS ROSTER */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-700">Exam:</span>
          </div>
          <select
            value={examFilter}
            onChange={(e) => setExamFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Target Exams</option>
            <option value="JEE Advanced">JEE Advanced</option>
            <option value="JEE Main">JEE Main</option>
            <option value="NEET">NEET</option>
            <option value="CBSE Board">CBSE Board</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Student Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Student & Roll No.</th>
                <th className="py-3 px-4">Target Exam</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Registration Date</th>
                <th className="py-3 px-4 text-center">Tests Taken</th>
                <th className="py-3 px-4 text-center">Average Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No registered students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student);
                      setNotesDraft(student.notes || '');
                    }}
                  >
                    {/* Student & Roll No. */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {student.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="truncate">{student.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <span>{student.rollNumber}</span>
                            <span>•</span>
                            <span className="truncate text-slate-400">{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Target Exam */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          student.targetExam === 'JEE Advanced'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : student.targetExam === 'NEET'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.targetExam === 'JEE Main'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {student.targetExam}
                      </span>
                    </td>

                    {/* Grade */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {student.grade}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(student.registeredAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Tests Taken */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {student.testsCompleted}
                    </td>

                    {/* Average Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded ${
                          student.averageScore >= 80
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : student.averageScore >= 60
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {student.averageScore > 0 ? `${student.averageScore}%` : 'N/A'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleStatus(student)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                          student.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : student.status === 'active'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {student.status}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setNotesDraft(student.notes || '');
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md font-medium text-[11px] transition-colors"
                        >
                          View Dossier
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove registration for ${student.name}?`)) {
                              onDeleteStudent(student.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete student registration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

  {/* SUB-VIEW 2: LIVE STUDENT TEST SUBMISSIONS FEED */}
  {activeSubTab === 'submissions' && (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Live Student Submissions & Grading Stream</span>
          </h3>
          <p className="text-xs text-slate-500">
            All tests submitted by students are automatically streamed here with scores, KaTeX solutions, and accuracy.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-200 flex items-center gap-1.5 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Real-time Teacher Sync Active
        </span>
      </div>

      {allSubmissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="font-bold text-slate-700 text-sm">No Student Submissions Yet</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            When students take tests in the Student Portal, their submissions and answer sheets will instantly appear here for grading and review.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student & Roll No.</th>
                  <th className="py-3 px-4">Test Title & Subject</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-center">Score / Max</th>
                  <th className="py-3 px-4 text-center">Accuracy</th>
                  <th className="py-3 px-4 text-right">Review Answers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSubmissions.map((sub, idx) => (
                  <tr key={sub.id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {sub.avatarInitials || 'ST'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {sub.studentRoll} • {sub.targetExam}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{sub.testTitle}</div>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {sub.subject}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {new Date(sub.completedAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {sub.score} / {sub.maxScore}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          sub.accuracy >= 75
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub.accuracy >= 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.accuracy}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectingAttempt(sub)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Inspect Answer Sheet</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )}

      {/* MODAL 1: View Detailed Student Dossier */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                  {selectedStudent.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-normal uppercase">
                      {selectedStudent.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Roll: {selectedStudent.rollNumber} • {selectedStudent.targetExam} ({selectedStudent.grade})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Details Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Email Address</div>
                  <div className="font-semibold text-slate-800 truncate">{selectedStudent.email}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Phone Number</div>
                  <div className="font-semibold text-slate-800">{selectedStudent.phone || 'Not provided'}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Registered On</div>
                  <div className="font-semibold text-slate-800 font-mono">
                    {new Date(selectedStudent.registeredAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">CBT Tests Completed</div>
                  <div className="font-semibold font-mono text-base text-slate-900">
                    {selectedStudent.testsCompleted}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Average Score</div>
                  <div className="font-semibold font-mono text-base text-emerald-600">
                    {selectedStudent.averageScore}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Highest Score</div>
                  <div className="font-semibold font-mono text-base text-blue-600">
                    {selectedStudent.highestScore}%
                  </div>
                </div>
              </div>

              {/* Teacher Notes Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Teacher Confidential Notes & Academic Advisory</span>
                  </div>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold"
                    >
                      Edit Notes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveNotes}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="text-slate-500 hover:text-slate-700 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    placeholder="Enter observations, weak topics, or recommendations..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                ) : (
                  <p className="text-slate-600 leading-relaxed italic bg-white p-3 rounded-lg border border-slate-200">
                    {selectedStudent.notes || 'No teacher notes recorded yet.'}
                  </p>
                )}
              </div>

              {/* Recent Test Attempts History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Student Test Attempt History ({selectedStudent.recentAttempts?.length || 0})</span>
                </h4>

                {(!selectedStudent.recentAttempts || selectedStudent.recentAttempts.length === 0) ? (
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-500">
                    No CBT test attempts recorded yet for this student.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedStudent.recentAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="p-3.5 rounded-lg border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-800 text-xs">{attempt.testTitle}</div>
                          <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                            <span>Subject: {attempt.subject}</span>
                            <span>•</span>
                            <span>{new Date(attempt.completedAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono font-bold text-emerald-700">
                              {attempt.score} / {attempt.maxScore} marks
                            </div>
                            <div className="text-[10px] text-slate-500">{attempt.accuracy}% accuracy</div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Completed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Student ID: <code className="font-mono">{selectedStudent.id}</code>
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Student Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Register New Student</h3>
                  <p className="text-[11px] text-slate-300">Creates student profile with auto-assigned roll number</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Full Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Shrutika Hage"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Target Examination
                  </label>
                  <select
                    value={newStudentExam}
                    onChange={(e) => setNewStudentExam(e.target.value as TargetExam)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="JEE Main">JEE Main</option>
                    <option value="JEE Advanced">JEE Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="CBSE Board">CBSE Board</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Class / Grade
                  </label>
                  <select
                    value={newStudentGrade}
                    onChange={(e) => setNewStudentGrade(e.target.value as StudentGrade)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Dropper/Repeater">Dropper / Repeater</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Initial Teacher Notes / Background
                </label>
                <textarea
                  rows={2}
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  placeholder="Optional notes regarding strengths, target percentile, etc."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Student Answer Sheet Inspection Modal */}
      {inspectingAttempt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                  {inspectingAttempt.avatarInitials || 'ST'}
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span>{inspectingAttempt.studentName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 font-mono">
                      {inspectingAttempt.studentRoll}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {inspectingAttempt.testTitle} • {inspectingAttempt.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingAttempt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Banner */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Score Earned</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {inspectingAttempt.score} / {inspectingAttempt.maxScore}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    inspectingAttempt.accuracy >= 75
                      ? 'text-emerald-600'
                      : inspectingAttempt.accuracy >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {inspectingAttempt.accuracy}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Submitted Time</div>
                <div className="text-xs font-mono text-slate-700 mt-1">
                  {new Date(inspectingAttempt.completedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Answer breakdown */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>CBT Itemized Response Sheet</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  Total Questions: {(inspectingAttempt.attemptedQuestions || inspectingAttempt.answers)?.length || Math.round(inspectingAttempt.maxScore / 4) || 4}
                </span>
              </div>

              {(inspectingAttempt.attemptedQuestions || inspectingAttempt.answers) && (inspectingAttempt.attemptedQuestions || inspectingAttempt.answers).length > 0 ? (
                <div className="space-y-3">
                  {(inspectingAttempt.attemptedQuestions || inspectingAttempt.answers).map((ans: any, idx: number) => {
                    const isCorrect = ans.isCorrect ?? (ans.selectedOption === ans.correctOption);
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border ${
                          isCorrect
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-800">
                            Q{idx + 1}. {ans.questionText || `Test Question #${idx + 1}`}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? '+4 Marks (Correct)' : '-1 Mark (Incorrect)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">
                              Student's Answer
                            </span>
                            <span className={isCorrect ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              Option ({ans.selectedOption || 'Unattempted'})
                            </span>
                          </div>
                          <div className="p-2 rounded bg-white border border-slate-200">
                            <span className="text-slate-400 block text-[9px] uppercase">
                              Official Key
                            </span>
                            <span className="text-emerald-700 font-bold">
                              Option ({ans.correctOption || 'A'})
                            </span>
                          </div>
                        </div>

                        {ans.explanation && (
                          <div className="mt-2 p-2 rounded bg-white/80 border border-slate-200 text-slate-600 text-[11px]">
                            <strong className="text-slate-700">Solution Analysis: </strong>
                            {ans.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div className="font-bold text-slate-800">
                    CBT Test Summary Verified
                  </div>
                  <p className="text-slate-500 text-xs">
                    This test attempt was verified with score <strong>{inspectingAttempt.score} / {inspectingAttempt.maxScore}</strong> ({inspectingAttempt.accuracy}% accuracy) by student <strong>{inspectingAttempt.studentName}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Verified Teacher Evaluation Portal
              </span>
              <button
                onClick={() => setInspectingAttempt(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Answer Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
