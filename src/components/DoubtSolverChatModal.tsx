import React, { useState, useRef, useEffect } from 'react';
import { MathText } from './MathText';
import { DiagramViewer } from './DiagramViewer';
import { DiagramSpec } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  X,
  RefreshCw,
  BookOpen,
  Bot,
  User,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface DoubtMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedDiagram?: DiagramSpec;
  ragSources?: { title: string; source: string }[];
}

interface DoubtSolverChatModalProps {
  onClose: () => void;
  initialSubject?: string;
}

const QUICK_DOUBTS = [
  "How do I apply Kirchhoff's Current Rule to parallel resistors with a diagram?",
  "Under what condition does a block on an inclined plane with friction begin to slip?",
  "Explain Cartesian sign conventions for real vs virtual images in convex lenses.",
  "Why is the net work done in a clockwise P-V indicator cycle positive?"
];

export const DoubtSolverChatModal: React.FC<DoubtSolverChatModalProps> = ({
  onClose,
  initialSubject = 'Physics',
}) => {
  const [subject, setSubject] = useState(initialSubject);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<DoubtMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your **VisuRank AI Syllabus Doubt Assistant**, grounded in the official NCERT Class 11/12, JEE, and NEET syllabus.\n\nAsk me any conceptual doubt, derivation question, or diagram problem. I will break down the governing laws, formulas, and visual geometry step by step!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: DoubtMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/doubt-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          subject,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to get doubt response');
      }

      const aiMsg: DoubtMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Here is the step-by-step resolution based on the syllabus knowledge base.',
        suggestedDiagram: data.suggestedDiagram,
        ragSources: data.ragSources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const fallbackMsg: DoubtMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `To resolve this in **${subject}**, recall the governing conservation principles and boundary conditions. If an equation has vector quantities, resolve along orthogonal axes first!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Syllabus Doubt-Solving AI Assistant
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  NCERT & JEE Scoped
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Grounded in the RAG Knowledge Base with instant diagram visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700"
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  <MathText text={msg.text} />
                </div>

                {/* Suggested Diagram if provided */}
                {msg.suggestedDiagram && (
                  <div className="my-2 p-2 rounded-xl bg-slate-50 border border-slate-200 max-w-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Visual Reference:
                    </span>
                    <DiagramViewer diagram={msg.suggestedDiagram} editable={false} />
                  </div>
                )}

                {/* RAG Sources footer */}
                {msg.ragSources && msg.ragSources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Syllabus Grounding:</span>
                    {msg.ragSources.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                      >
                        {s.source}
                      </span>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] ${
                    msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                  } text-right`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-2xs font-medium">
                Searching RAG syllabus & formulating derivation...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Doubts Prompt Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Frequent Doubts:</span>
          </span>
          {QUICK_DOUBTS.map((doubt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(doubt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors shrink-0 border border-slate-200"
            >
              {doubt.length > 40 ? doubt.slice(0, 40) + '...' : doubt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a syllabus doubt (e.g. 'How to calculate equivalent resistance in bridge circuits?')..."
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
