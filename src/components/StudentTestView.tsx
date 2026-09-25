import React, { useState, useEffect } from 'react';
import { Question, StudentAttempt } from '../types';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  RotateCcw,
  Sparkles,
  Bookmark,
  Eraser,
  HelpCircle,
  Check,
} from 'lucide-react';

interface StudentTestViewProps {
  questions: Question[];
  onFinishTest?: (attempts: Record<string, StudentAttempt>) => void;
  onCompleteTest?: (attemptData: {
    testTitle: string;
    subject: string;
    score: number;
    maxScore: number;
    accuracy: number;
    attemptedQuestions: any[];
  }) => void;
}

export const StudentTestView: React.FC<StudentTestViewProps> = ({
  questions,
  onFinishTest,
  onCompleteTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({
    [questions[0]?.id || '']: true,
  });

  // Calculate default exam duration: 200m for NEET 180, 180m for JEE 75, or proportional
  const initialSeconds = questions.length >= 180 ? 200 * 60 : questions.length >= 75 ? 180 * 60 : Math.max(questions.length * 2, 20) * 60;
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(initialSeconds);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<Record<string, any>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('All');
  const [jumpInput, setJumpInput] = useState('');

  // Extract unique subjects
  const availableSubjects = ['All', ...Array.from(new Set(questions.map((q) => q.subject)))];

  // Filter questions for palette if specific subject tab selected
  const filteredQuestionIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => activeSubjectTab === 'All' || q.subject === activeSubjectTab);

  // Mark question as visited when changing active index
  useEffect(() => {
    if (questions[currentIndex]) {
      setVisitedQuestions((prev) => ({
        ...prev,
        [questions[currentIndex].id]: true,
      }));
    }
  }, [currentIndex, questions]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || timeRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, timeRemainingSeconds]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionLabel: string) => {
    if (isSubmitted || !currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionLabel,
    }));
  };

  const handleNumericalInput = (val: string) => {
    if (isSubmitted || !currentQ) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: val,
    }));
  };

  const handleKeypadPress = (char: string) => {
    if (isSubmitted || !currentQ) return;
    const current = selectedAnswers[currentQ.id] || '';
    if (char === 'CLEAR') {
      handleClearResponse();
    } else if (char === 'BACKSPACE') {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQ.id]: current.slice(0, -1),
      }));
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQ.id]: current + char,
      }));
    }
  };

  const handleClearResponse = () => {
    if (isSubmitted || !currentQ) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: true,
    }));
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handleSaveAndNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handleJumpToQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      setCurrentIndex(num - 1);
      setJumpInput('');
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmitTest = async () => {
    setIsEvaluating(true);
    const results: Record<string, any> = {};

    for (const q of questions) {
      const selected = (selectedAnswers[q.id] || '').trim();
      let isCorrect = false;

      if (q.questionType === 'numerical') {
        const userNum = parseFloat(selected);
        const correctNum = parseFloat(q.correctAnswer);
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          isCorrect = Math.abs(userNum - correctNum) < 0.05;
        } else {
          isCorrect = selected.toLowerCase() === q.correctAnswer.trim().toLowerCase();
        }
      } else {
        isCorrect = selected.toUpperCase() === q.correctAnswer.trim().toUpperCase();
      }

      const posMarks = q.marks ?? 4;
      const negMarks = q.negativeMarks ?? -1;
      const score = isCorrect ? posMarks : selected ? negMarks : 0;

      results[q.id] = {
        isCorrect,
        selectedOption: selected,
        correctOption: q.correctAnswer,
        score,
        solution: q.solution,
      };
    }

    setEvaluationResults(results);
    setIsEvaluating(false);
    setIsSubmitted(true);

    if (onCompleteTest) {
      const netScore = Object.values(results).reduce<number>((acc, item) => acc + (Number(item?.score) || 0), 0);
      const totalPossible = questions.reduce((acc, q) => acc + (q.marks ?? 4), 0);
      const correctNum = Object.values(results).filter((item: any) => Boolean(item.isCorrect)).length;
      const accuracyPct = questions.length > 0 ? Math.round((correctNum / questions.length) * 100) : 0;

      const attemptedQuestions = questions.map((q) => ({
        questionId: q.id,
        questionText: q.questionText,
        selectedOption: selectedAnswers[q.id] || 'Unattempted',
        correctOption: q.correctAnswer,
        isCorrect: Boolean(results[q.id]?.isCorrect),
      }));

      onCompleteTest({
        testTitle: questions.length >= 180 ? 'Official NEET-UG 180 Questions Full Pattern Examination' : questions.length >= 75 ? 'Official JEE Main 75 Questions Full Pattern Examination' : 'National Level CBT Examination',
        subject: questions[0]?.subject || 'Physics',
        score: Math.max(0, netScore),
        maxScore: totalPossible,
        accuracy: accuracyPct,
        attemptedQuestions,
      });
    }
  };

  const totalPossibleMarks = questions.reduce((acc, q) => acc + (q.marks ?? 4), 0);
  const totalScore = (Object.values(evaluationResults) as any[]).reduce<number>(
    (acc, item) => acc + (Number(item?.score) || 0),
    0
  );
  const correctCount = Object.values(evaluationResults).filter((item: any) => Boolean(item.isCorrect)).length;
  const attemptedCount = Object.keys(selectedAnswers).length;
  const incorrectCount = attemptedCount - correctCount;

  // Counts for NTA palette
  const answeredCount = Object.keys(selectedAnswers).length;
  const markedReviewCount = Object.keys(markedForReview).filter((id) => !selectedAnswers[id]).length;
  const answeredAndMarkedCount = Object.keys(markedForReview).filter((id) => selectedAnswers[id]).length;
  const notAnsweredCount = Object.keys(visitedQuestions).filter((id) => !selectedAnswers[id] && !markedForReview[id]).length;
  const notVisitedCount = questions.length - Object.keys(visitedQuestions).length;

  // Subject-wise performance calculation for scorecard
  const subjectScores: Record<string, { total: number; score: number; correct: number; incorrect: number }> = {};
  for (const q of questions) {
    if (!subjectScores[q.subject]) {
      subjectScores[q.subject] = { total: 0, score: 0, correct: 0, incorrect: 0 };
    }
    subjectScores[q.subject].total += q.marks ?? 4;
    const res = evaluationResults[q.id];
    if (res) {
      subjectScores[q.subject].score += res.score || 0;
      if (res.isCorrect) subjectScores[q.subject].correct += 1;
      else if (res.selectedOption) subjectScores[q.subject].incorrect += 1;
    }
  }

  return (
    <div className="space-y-6">
      {/* Official NTA CBT Exam Top Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
            NTA
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{questions.length >= 180 ? 'Official NEET-UG 180 Questions Full Pattern Examination' : questions.length >= 75 ? 'Official JEE Main 75 Questions Full Pattern Examination' : 'JEE (Main/Adv) & NEET Computer-Based Test (CBT) Room'}</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                Live Session
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Marking Scheme: <span className="text-emerald-600 font-semibold">+4 (Correct)</span> | <span className="text-rose-600 font-semibold">-1 (Incorrect)</span> | <span className="text-slate-500">0 (Unattempted)</span> | Total: <span className="font-bold text-slate-800">{totalPossibleMarks} Marks</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Time Left: {formatTime(timeRemainingSeconds)}</span>
          </div>

          {!isSubmitted ? (
            <button
              type="button"
              onClick={handleSubmitTest}
              disabled={isEvaluating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              {isEvaluating ? 'Checking Answers...' : 'Submit Examination'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setMarkedForReview({});
                setEvaluationResults({});
                setTimeRemainingSeconds(initialSeconds);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Exam
            </button>
          )}
        </div>
      </div>

      {/* Post-Submission Scorecard Banner */}
      {isSubmitted && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
                <Award className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">NTA Candidate Performance & Score Card</h3>
                <p className="text-xs text-blue-200">Verified Auto-Checking with Negative Marking</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-mono text-emerald-400">
                {totalScore} / {totalPossibleMarks}
              </div>
              <div className="text-xs text-slate-300">Total Score (+4 / -1)</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="text-[11px] text-slate-300 uppercase tracking-wider">Attempted</div>
              <div className="text-xl font-bold font-mono">{attemptedCount} / {questions.length}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="text-[11px] text-emerald-300 uppercase tracking-wider">Correct (+4)</div>
              <div className="text-xl font-bold font-mono text-emerald-400">{correctCount} (+{correctCount * 4})</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="text-[11px] text-rose-300 uppercase tracking-wider">Negative Penalty (-1)</div>
              <div className="text-xl font-bold font-mono text-rose-400">-{incorrectCount} Marks</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <div className="text-[11px] text-amber-300 uppercase tracking-wider">Predicted Percentile</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {totalScore >= totalPossibleMarks * 0.75 ? '99.5+ %ile' : totalScore >= totalPossibleMarks * 0.55 ? '97.2 %ile' : totalScore >= totalPossibleMarks * 0.35 ? '91.8 %ile' : '82.4 %ile'}
              </div>
            </div>
          </div>

          {/* Subject-wise Marks Breakdown */}
          {Object.keys(subjectScores).length > 1 && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Subject-Wise Breakdown</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(subjectScores).map(([sub, data]) => (
                  <div key={sub} className="bg-white/5 rounded-xl p-3 border border-white/10 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-blue-300">{sub}</span>
                      <span className="font-mono text-emerald-300">{data.score} / {data.total}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                      <span>Correct: {data.correct}</span>
                      <span>Incorrect: {data.incorrect}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main CBT Grid: Active Question (Left) and NTA Question Palette (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Active Question Display */}
        <div className="lg:col-span-3 space-y-4">
          {currentQ ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono font-bold text-xs">
                    Question {currentIndex + 1}
                  </span>
                  <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {currentQ.subject}
                  </span>
                  {currentQ.sectionName && (
                    <span className="text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">
                      {currentQ.sectionName}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">
                    {currentQ.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
                    +{currentQ.marks ?? 4} / {currentQ.negativeMarks ?? -1} Marks
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {currentQ.questionType === 'numerical'
                      ? 'Numerical Value'
                      : currentQ.questionType === 'assertion_reason'
                      ? 'Assertion-Reason'
                      : currentQ.questionType === 'statement_based'
                      ? 'Statement I & II'
                      : currentQ.questionType === 'matrix_match'
                      ? 'Matrix Match'
                      : 'Single Choice'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {currentQ.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base text-slate-900 font-medium leading-relaxed">
                <MathText text={currentQ.questionText} />
              </div>

              {/* Diagram Rendering (Only for questions that require diagrams) */}
              {currentQ.requiresDiagram && currentQ.diagram && (
                <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
                  <div
                    className="w-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: currentQ.diagram.svgCode }}
                  />
                  <p className="text-[10px] text-center text-slate-500 italic mt-1 font-mono">
                    Figure: {currentQ.diagram.caption || `${currentQ.topic} Schematic`}
                  </p>
                </div>
              )}

              {/* Assertion & Reason Structured Callout */}
              {currentQ.assertionReasonData && (
                <div className="space-y-2 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded font-mono shrink-0">Assertion (A):</span>
                    <span className="text-slate-800 font-medium leading-relaxed">{currentQ.assertionReasonData.assertion}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded font-mono shrink-0">Reason (R):</span>
                    <span className="text-slate-800 font-medium leading-relaxed">{currentQ.assertionReasonData.reason}</span>
                  </div>
                </div>
              )}

              {/* Statement-Based Structured Callout */}
              {currentQ.statementData && (
                <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-mono shrink-0">Statement I:</span>
                    <span className="text-slate-800 font-medium leading-relaxed">{currentQ.statementData.statement1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-mono shrink-0">Statement II:</span>
                    <span className="text-slate-800 font-medium leading-relaxed">{currentQ.statementData.statement2}</span>
                  </div>
                </div>
              )}

              {/* Matrix Match Column Tables */}
              {currentQ.matrixMatchData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200">List-I / Column-I</div>
                    {currentQ.matrixMatchData.column1.map((c) => (
                      <div key={c.label} className="flex items-start gap-2">
                        <span className="font-bold font-mono text-slate-900">({c.label})</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200">List-II / Column-II</div>
                    {currentQ.matrixMatchData.column2.map((c) => (
                      <div key={c.label} className="flex items-start gap-2">
                        <span className="font-bold font-mono text-slate-900">({c.label})</span>
                        <span className="text-slate-700">{c.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Choices vs Numerical Keypad */}
              {currentQ.questionType === 'numerical' ? (
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">
                      Numerical Value Type Response (Section B)
                    </span>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      Enter integer or decimal value (+4, -1)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={selectedAnswers[currentQ.id] || ''}
                      onChange={(e) => handleNumericalInput(e.target.value)}
                      placeholder="Type answer or click keypad..."
                      className="px-4 py-2.5 bg-white border-2 border-blue-500 rounded-xl font-mono text-lg font-bold text-slate-900 focus:outline-none w-64 shadow-2xs"
                    />

                    {/* Virtual Keypad for NTA CBT compliance */}
                    {!isSubmitted && (
                      <div className="flex flex-wrap gap-1.5 bg-white p-2 rounded-xl border border-slate-200">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-'].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handleKeypadPress(k)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold font-mono text-xs flex items-center justify-center cursor-pointer"
                          >
                            {k}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleKeypadPress('BACKSPACE')}
                          className="px-2 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs cursor-pointer"
                        >
                          Del
                        </button>
                        <button
                          type="button"
                          onClick={() => handleKeypadPress('CLEAR')}
                          className="px-2 h-8 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {isSubmitted && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs font-mono font-bold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Official Correct Answer: {currentQ.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.label;
                    const evalItem = evaluationResults[currentQ.id];
                    const isCorrect = opt.isCorrect;

                    let optionStyle = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                    if (isSubmitted) {
                      if (isCorrect) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                      } else if (isSelected && !isCorrect) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-medium';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-100 font-medium';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.label)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none text-sm ${optionStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full font-bold flex items-center justify-center shrink-0 text-xs ${
                            isSubmitted && isCorrect
                              ? 'bg-emerald-600 text-white'
                              : isSubmitted && isSelected && !isCorrect
                              ? 'bg-rose-600 text-white'
                              : isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="pt-0.5 flex-1 leading-normal">
                          <MathText text={opt.text} />
                        </span>
                        {isSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Post-submission instant solution & derivation */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Official Derivation & Solution Key</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    {currentQ.solution.stepByStep.map((s, idx) => (
                      <p key={idx}><MathText text={s} /></p>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-emerald-700">
                    {currentQ.solution.finalAnswer}
                  </p>
                </div>
              )}

              {/* Authentic NTA Action Controls */}
              {!isSubmitted ? (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearResponse}
                      disabled={!selectedAnswers[currentQ.id]}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Clear Response
                    </button>
                    <button
                      type="button"
                      onClick={handleMarkForReviewAndNext}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      Mark for Review & Next
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                      disabled={currentIndex === 0}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndNext}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Save & Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((idx) => Math.min(questions.length - 1, idx + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium disabled:opacity-40 shadow-xs transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              No questions found.
            </div>
          )}
        </div>

        {/* Question Palette Sidebar (Official NTA Style) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Question Palette ({questions.length})
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Q {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Subject Filter Tabs */}
            {availableSubjects.length > 2 && (
              <div className="flex flex-wrap gap-1">
                {availableSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubjectTab(sub)}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      activeSubjectTab === sub
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Fast Jump Input */}
            <form onSubmit={handleJumpToQuestion} className="flex gap-2">
              <input
                type="number"
                min={1}
                max={questions.length}
                placeholder={`Jump (1-${questions.length})...`}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
              >
                Go
              </button>
            </form>

            {/* Questions Grid with 5-6 columns & scrollable for 75 or 180 questions */}
            <div className="grid grid-cols-5 gap-1.5 max-h-80 overflow-y-auto pr-1">
              {filteredQuestionIndices.map(({ q, idx }) => {
                const isSelected = currentIndex === idx;
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isMarked = Boolean(markedForReview[q.id]);
                const isVisited = Boolean(visitedQuestions[q.id]);
                const evalItem = evaluationResults[q.id];

                let bgClass = 'bg-slate-100 text-slate-600 border-slate-200'; // Not visited
                if (isSubmitted && evalItem) {
                  bgClass = evalItem.isCorrect
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : isAnswered
                    ? 'bg-rose-600 text-white border-rose-600 font-bold'
                    : 'bg-slate-200 text-slate-500 border-slate-300';
                } else if (isSelected) {
                  bgClass = 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-300 font-bold';
                } else if (isAnswered && isMarked) {
                  bgClass = 'bg-purple-600 text-white border-purple-600 font-bold'; // Answered & Marked
                } else if (isMarked) {
                  bgClass = 'bg-purple-100 text-purple-800 border-purple-300 font-bold'; // Marked for review
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white border-emerald-600 font-bold'; // Answered
                } else if (isVisited) {
                  bgClass = 'bg-rose-50 text-rose-700 border-rose-200 font-medium'; // Not Answered
                }

                return (
                  <button
                    type="button"
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-lg font-mono text-xs border flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Official NTA Legend with Counts */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">✓</span>
                  <span>Answered</span>
                </div>
                <span className="font-mono font-bold">{answeredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300 text-rose-700 text-[9px] flex items-center justify-center font-bold">✗</span>
                  <span>Not Answered</span>
                </div>
                <span className="font-mono font-bold">{notAnsweredCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-purple-100 border border-purple-300 text-purple-700 text-[9px] flex items-center justify-center font-bold">?</span>
                  <span>Marked for Review</span>
                </div>
                <span className="font-mono font-bold">{markedReviewCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200" />
                  <span>Not Visited</span>
                </div>
                <span className="font-mono font-bold">{notVisitedCount}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-slate-900" />
                  <span>Current Question</span>
                </div>
                <span className="font-mono font-bold">Q.{currentIndex + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
