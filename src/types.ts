export type Subject = 'Physics' | 'Chemistry' | 'Mathematics' | 'Biology';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'JEE Main' | 'JEE Advanced' | 'NEET';

export type QuestionType = 
  | 'mcq_single' 
  | 'numerical' 
  | 'mcq_multiple' 
  | 'assertion_reason' 
  | 'matrix_match' 
  | 'statement_based';

export type DiagramType = 
  | 'circuit' 
  | 'mechanics_fbd' 
  | 'ray_optics' 
  | 'geometry' 
  | 'graph_kinematics' 
  | 'thermo_pv' 
  | 'chemistry_organic' 
  | 'biology_cell' 
  | 'none';

export interface DiagramSpec {
  type: DiagramType;
  title: string;
  svgCode: string;
  parameters: Record<string, string | number>;
  labels: string[];
  caption: string;
}

export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  isCorrect: boolean;
}

export interface QuestionSolution {
  stepByStep: string[];
  finalAnswer: string;
  conceptFormula: string;
  diagramInsight: string;
}

export interface ScorePrediction {
  jeeDifficultyScore: number; // 1-100
  discriminationIndex: number; // 0.1 - 1.0
  expectedAccuracyRate: number; // e.g. 38%
  rankImpact: 'Critical Filter' | 'Very High' | 'High' | 'Moderate';
  topicWeightage: string;
}

export interface RagChunk {
  id: string;
  title: string;
  source: string; // e.g., 'NCERT Physics Ch 3', 'HC Verma Vol 1', 'JEE Advanced PYQ 2023'
  snippet: string;
  relevanceScore: number;
  diagramType?: DiagramType;
}

export interface GenerationTraceLog {
  traceId: string;
  timestamp: string;
  retrievalLatencyMs: number;
  generationLatencyMs: number;
  diagramLatencyMs: number;
  totalLatencyMs: number;
  model: string;
  diagramRequirementDecision: {
    needed: boolean;
    detectedCategory: DiagramType;
    rationale: string;
  };
  reviewAgentCheck: {
    passed: boolean;
    diagramConsistencyScore: number; // 1-10
    cotReasoning: string;
    verifiedValues: { param: string; questionVal: string; diagramVal: string; match: boolean }[];
  };
}

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  questionText: string;
  sectionName?: string; // e.g., 'Section A (MCQs)' | 'Section B (Numerical)' | 'Botany' | 'Zoology'
  sectionType?: 'section_a' | 'section_b';
  marks?: number; // default 4
  negativeMarks?: number; // default -1 (or 0)
  requiresDiagram: boolean;
  diagramType: DiagramType;
  diagram: DiagramSpec | null;
  options: QuestionOption[];
  correctAnswer: string; // e.g., 'B' or '12.5'
  assertionReasonData?: {
    assertion: string;
    reason: string;
  };
  statementData?: {
    statement1: string;
    statement2: string;
  };
  matrixMatchData?: {
    column1: { label: string; text: string }[];
    column2: { label: string; text: string }[];
  };
  solution: QuestionSolution;
  reviewStatus: 'pending_review' | 'approved' | 'needs_revision';
  scorePrediction: ScorePrediction;
  ragMetadata: {
    retrievedChunks: RagChunk[];
    similarQuestionRef?: string;
  };
  traceLog?: GenerationTraceLog;
  createdAt: string;
  teacherNotes?: string;
}

export interface KnowledgeDoc {
  id: string;
  subject: Subject;
  topic: string;
  title: string;
  content: string;
  formulas: string[];
  diagramCategory: DiagramType;
  sampleDiagramSpec?: string;
}

export interface StudentAttempt {
  questionId: string;
  selectedOption: string;
  timeSpentSeconds: number;
  isCorrect: boolean;
  score: number;
  aiFeedback?: string;
}

export interface TestPaper {
  id: string;
  title: string;
  subject: Subject;
  targetExam: 'JEE Main' | 'JEE Advanced' | 'NEET' | 'CBSE Board';
  timeLimitMinutes: number;
  totalMarks: number;
  questions: Question[];
  createdAt: string;
}

export interface AssignedPaper {
  id: string;
  title: string;
  subject: Subject;
  targetExam: TargetExam;
  timeLimitMinutes: number;
  totalMarks: number;
  questions: Question[];
  assignedTo: 'all' | TargetExam | string; // 'all' or specific exam batch or studentId
  assignedToLabel: string;
  assignedBy: string;
  createdAt: string;
  assignedAt?: string;
  expiresAt?: string;
  instructions?: string;
}

export type TargetExam = 'JEE Main' | 'JEE Advanced' | 'NEET' | 'CBSE Board';
export type StudentGrade = 'Class 11' | 'Class 12' | 'Dropper/Repeater';

export interface StudentAttemptHistory {
  id: string;
  testTitle: string;
  subject: Subject;
  score: number;
  maxScore: number;
  accuracy: number; // percentage
  completedAt: string;
  attemptedQuestions: {
    questionId: string;
    questionText: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }[];
}

export interface StudentRegistration {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  targetExam: TargetExam;
  grade: StudentGrade;
  phone?: string;
  registeredAt: string;
  status: 'active' | 'pending' | 'verified';
  avatarInitials: string;
  testsCompleted: number;
  averageScore: number;
  highestScore: number;
  recentAttempts?: StudentAttemptHistory[];
  notes?: string;
}

export interface AuthUser {
  role: 'teacher' | 'student';
  id: string;
  name: string;
  email: string;
  rollNumber?: string;
  designation?: string;
  targetExam?: TargetExam;
  grade?: StudentGrade;
  avatarInitials?: string;
}

