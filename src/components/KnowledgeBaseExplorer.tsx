import React, { useState } from 'react';
import { KnowledgeDoc, RagChunk } from '../types';
import { Database, Search, Plus, BookOpen, Layers, Check, ExternalLink, X } from 'lucide-react';

interface KnowledgeBaseExplorerProps {
  docs: KnowledgeDoc[];
  onAddDocument: (newDoc: Omit<KnowledgeDoc, 'id'>) => Promise<void>;
  onTriggerGenerateFromTopic: (subject: string, topic: string) => void;
}

export const KnowledgeBaseExplorer: React.FC<KnowledgeBaseExplorerProps> = ({
  docs,
  onAddDocument,
  onTriggerGenerateFromTopic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New doc form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics' | 'Biology'>('Physics');
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFormulas, setNewFormulas] = useState('');
  const [newDiagramCat, setNewDiagramCat] = useState<any>('circuit');
  const [isSaving, setIsSaving] = useState(false);

  const filteredDocs = docs.filter((d) => {
    const matchesSubj = selectedSubject === 'All' || d.subject === selectedSubject;
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubj && matchesSearch;
  });

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSaving(true);
    await onAddDocument({
      subject: newSubject,
      topic: newTopic || 'General Concepts',
      title: newTitle,
      content: newContent,
      formulas: newFormulas.split('\n').filter((f) => f.trim().length > 0),
      diagramCategory: newDiagramCat,
      sampleDiagramSpec: newDiagramCat,
    });
    setIsSaving(false);
    setIsAddOpen(false);

    // reset
    setNewTitle('');
    setNewTopic('');
    setNewContent('');
    setNewFormulas('');
  };

  return (
    <div className="space-y-5">
      {/* Knowledge Base Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                RAG Knowledge Base & Semantic Vector Index
              </h2>
              <p className="text-xs text-slate-500">
                Curated NCERT, HC Verma, and JEE/NEET PYQ textbooks with verified multimodal diagram templates
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ingest Learning Material / PYQ
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search concepts, formulas, or diagram categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology'].map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSubject === subj
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {doc.subject}
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                  Diagram: {doc.diagramCategory}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {doc.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-2">
                Topic: {doc.topic}
              </p>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {doc.content}
              </p>
            </div>

            {/* Formula chips */}
            {doc.formulas.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Indexed Formulas:
                </div>
                <div className="flex flex-wrap gap-1">
                  {doc.formulas.slice(0, 3).map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-mono text-slate-700 border border-slate-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-mono">
                Doc ID: {doc.id}
              </span>
              <button
                onClick={() => onTriggerGenerateFromTopic(doc.subject, doc.topic)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Generate Question
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-600" />
                Ingest Educational Note into RAG Store
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e: any) => setNewSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    placeholder="e.g., Electromagnetic Waves"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g., Poynting Vector and Radiation Pressure"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associated Diagram Category</label>
                <select
                  value={newDiagramCat}
                  onChange={(e) => setNewDiagramCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="circuit">Electric Circuit Schematic</option>
                  <option value="mechanics_fbd">Mechanics / Free-Body Diagram / Pulley</option>
                  <option value="ray_optics">Ray Optics / Lens & Mirror Rays</option>
                  <option value="graph_kinematics">Kinematics Motion Graph (v-t curve)</option>
                  <option value="thermo_pv">Thermodynamics P-V Indicator Diagram</option>
                  <option value="geometry">Coordinate Geometry / Conics</option>
                  <option value="chemistry_organic">Organic Chemistry Reaction Scheme</option>
                  <option value="biology_cell">Cell Biology Organelle Structure</option>
                  <option value="none">Text Only (No Diagram)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Textbook Content & Concepts</label>
                <textarea
                  rows={4}
                  placeholder="Enter the core pedagogical explanation, laws, and visual descriptions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Governing Formulas (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="S = (1/μ₀) (E × B)&#10;Intensity = c · u_avg"
                  value={newFormulas}
                  onChange={(e) => setNewFormulas(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {isSaving ? 'Indexing...' : 'Index in Knowledge Base'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
