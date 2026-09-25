import React, { useState } from 'react';
import { Question, DiagramSpec } from '../types';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { ReviewAgentCard } from './ReviewAgentCard';
import { Check, Eye, EyeOff, BookOpen, Sparkles, Plus, CheckSquare, Trash2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index?: number;
  showTeacherTools?: boolean;
  onUpdateQuestion?: (updated: Question) => void;
  onAddToPaper?: (question: Question) => void;
  isAddedToPaper?: boolean;
  onDelete?: (id: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  showTeacherTools = true,
  onUpdateQuestion,
  onAddToPaper,
  isAddedToPaper = false,
  onDelete,
}) => {
  const [showSolution, setShowSolution] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleDiagramUpdate = (updatedDiagram: DiagramSpec) => {
    if (onUpdateQuestion) {
      onUpdateQuestion({
        ...question,
        diagram: updatedDiagram,
      });
    }
  };

  const handleApprove = (id: string) => {
    if (onUpdateQuestion) {
      onUpdateQuestion({
        ...question,
        reviewStatus: 'approved',
      });
    }
  };

  const handleNeedsRevision = (id: string) => {
    if (onUpdateQuestion) {
      onUpdateQuestion({
        ...question,
        reviewStatus: 'needs_revision',
      });
    }
  };

  const getSubjectColor = (subj: string) => {
    switch (subj) {
      case 'Physics':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Chemistry':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Mathematics':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Biology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'JEE Advanced':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'JEE Main':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'NEET':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Hard':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300">
      {/* Question Header Bar */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {index !== undefined && (
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[11px] font-mono font-bold flex items-center justify-center">
              {index + 1}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getSubjectColor(question.subject)}`}>
            {question.subject}
          </span>
          <span className="text-xs font-semibold text-slate-800">
            {question.topic}
          </span>
          <span className="text-slate-300">•</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
            +{question.marks ?? 4} / {question.negativeMarks ?? -1} Marks
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {question.questionType === 'numerical'
              ? 'Numerical Value'
              : question.questionType === 'assertion_reason'
              ? 'Assertion-Reason'
              : question.questionType === 'statement_based'
              ? 'Statement I & II'
              : question.questionType === 'matrix_match'
              ? 'Matrix Match'
              : question.questionType === 'mcq_multiple'
              ? 'Multiple Correct'
              : 'Single Choice MCQ'}
          </span>
          {question.sectionName && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {question.sectionName}
            </span>
          )}
          {question.requiresDiagram && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3" />
              Multimodal Diagram
            </span>
          )}
        </div>

        {showTeacherTools && (
          <div className="flex items-center gap-2">
            {onAddToPaper && (
              <button
                onClick={() => onAddToPaper(question)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isAddedToPaper
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
              >
                {isAddedToPaper ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Plus className="w-3.5 h-3.5" />}
                {isAddedToPaper ? 'Added to Paper' : 'Add to Test Paper'}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(question.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Question Body */}
      <div className="p-5 space-y-5">
        {/* Question Text */}
        <div className="text-sm md:text-base leading-relaxed text-slate-800 font-medium">
          <MathText text={question.questionText} />
        </div>

        {/* Multimodal Diagram Section */}
        {question.requiresDiagram && question.diagram && (
          <div className="my-2">
            <DiagramViewer
              diagram={question.diagram}
              onUpdateDiagram={handleDiagramUpdate}
              editable={showTeacherTools}
            />
          </div>
        )}

        {/* Assertion & Reason Structured Callout */}
        {question.assertionReasonData && (
          <div className="space-y-2 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded font-mono shrink-0">Assertion (A):</span>
              <span className="text-slate-800 font-medium leading-relaxed">{question.assertionReasonData.assertion}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded font-mono shrink-0">Reason (R):</span>
              <span className="text-slate-800 font-medium leading-relaxed">{question.assertionReasonData.reason}</span>
            </div>
          </div>
        )}

        {/* Statement-Based Structured Callout */}
        {question.statementData && (
          <div className="space-y-2 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-xs">
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-mono shrink-0">Statement I:</span>
              <span className="text-slate-800 font-medium leading-relaxed">{question.statementData.statement1}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-mono shrink-0">Statement II:</span>
              <span className="text-slate-800 font-medium leading-relaxed">{question.statementData.statement2}</span>
            </div>
          </div>
        )}

        {/* Matrix Match Column Tables */}
        {question.matrixMatchData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200">List-I / Column-I</div>
              {question.matrixMatchData.column1.map((c) => (
                <div key={c.label} className="flex items-start gap-2">
                  <span className="font-bold font-mono text-slate-900">({c.label})</span>
                  <span className="text-slate-700">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] pb-1 border-b border-slate-200">List-II / Column-II</div>
              {question.matrixMatchData.column2.map((c) => (
                <div key={c.label} className="flex items-start gap-2">
                  <span className="font-bold font-mono text-slate-900">({c.label})</span>
                  <span className="text-slate-700">{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Numerical Value Input vs MCQ Options List */}
        {question.questionType === 'numerical' ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                <span>Numerical Value / Integer Type Response</span>
              </span>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                JEE Main Section B (+4, -1)
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Students enter an exact integer or decimal value using the on-screen keypad.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="text"
                placeholder="Enter numerical answer..."
                value={selectedOption || ''}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-56 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showSolution && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-lg font-mono">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answer: {question.correctAnswer}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {question.options.map((opt) => {
              const isCorrect = opt.isCorrect;
              const isSelected = selectedOption === opt.label;
              const revealState = showSolution;

              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.label)}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none text-xs md:text-sm ${
                    revealState && isCorrect
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium'
                      : revealState && isSelected && !isCorrect
                      ? 'border-rose-300 bg-rose-50 text-rose-900'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50/50 text-slate-900 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md font-bold flex items-center justify-center shrink-0 text-xs ${
                      revealState && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="pt-0.5 flex-1 leading-normal">
                    <MathText text={opt.text} />
                  </span>
                  {revealState && isCorrect && (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Solution Toggle Bar */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors"
          >
            {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showSolution ? 'Hide Model Solution' : 'View Model Answer & Derivation'}
          </button>

          <span className="text-[11px] text-slate-400 font-mono">
            ID: {question.id}
          </span>
        </div>

        {/* Model Solution & Step-by-Step Mathematical Derivation */}
        {showSolution && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-200/80 pb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Step-by-Step Model Derivation & Answer Key</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-normal">
              {question.solution.stepByStep.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>
                    <MathText text={step} />
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-slate-600">
                <span className="font-semibold text-slate-900">Governing Formula: </span>
                <code className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {question.solution.conceptFormula}
                </code>
              </div>
              <div className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Final Result: {question.solution.finalAnswer}
              </div>
            </div>

            {question.solution.diagramInsight && (
              <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 not-italic">Diagram Insight: </span>
                {question.solution.diagramInsight}
              </p>
            )}
          </div>
        )}

        {/* Review Agent Check & Observability Metric */}
        {showTeacherTools && (
          <div className="pt-1">
            <ReviewAgentCard
              question={question}
              onApprove={handleApprove}
              onMarkNeedsRevision={handleNeedsRevision}
            />
          </div>
        )}
      </div>
    </div>
  );
};
