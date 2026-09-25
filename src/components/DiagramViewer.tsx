import React, { useState } from 'react';
import { DiagramSpec } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Sliders, Maximize2, X } from 'lucide-react';
import { generateDiagramSvg } from '../lib/diagramRenderer';

interface DiagramViewerProps {
  diagram: DiagramSpec;
  onUpdateDiagram?: (updated: DiagramSpec) => void;
  editable?: boolean;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  diagram,
  onUpdateDiagram,
  editable = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localParams, setLocalParams] = useState<Record<string, string | number>>(diagram.parameters || {});

  const handleCopySvg = () => {
    navigator.clipboard.writeText(diagram.svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([diagram.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagram.type}_diagram.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveParams = () => {
    if (onUpdateDiagram) {
      const updated = generateDiagramSvg(diagram.type, localParams);
      onUpdateDiagram(updated);
    }
    setIsEditOpen(false);
  };

  return (
    <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-xs transition-all">
      {/* Top Diagram Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
            {diagram.type.replace('_', ' ')}
          </span>
          <span className="font-medium text-slate-800 truncate max-w-[220px] sm:max-w-md">
            {diagram.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {editable && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-700 hover:bg-slate-100 border border-slate-200 font-medium transition-colors"
              title="Edit diagram values and parameters"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Values</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200">
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[10px] text-slate-500">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleCopySvg}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Copy raw SVG"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleDownloadSvg}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Download vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Full screen preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Container with Zoom */}
      <div className="p-4 flex items-center justify-center overflow-auto min-h-[220px] max-h-[360px] bg-slate-50/50">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
          className="w-full max-w-lg transition-transform"
          dangerouslySetInnerHTML={{ __html: diagram.svgCode }}
        />
      </div>

      {/* Caption & Parameter Pill Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-slate-200 text-xs text-slate-600">
        <p className="text-slate-700 italic text-[11px] mb-2">{diagram.caption}</p>
        
        {diagram.parameters && Object.keys(diagram.parameters).length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spec Values:</span>
            {Object.entries(diagram.parameters).map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-mono font-medium text-slate-800"
              >
                <span className="text-slate-500 font-semibold">{key}:</span>
                <span className="text-blue-700">{val}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{diagram.title}</h3>
                <p className="text-xs text-slate-500">{diagram.caption}</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex-1 overflow-auto flex items-center justify-center bg-slate-50">
              <div className="w-full max-w-2xl" dangerouslySetInnerHTML={{ __html: diagram.svgCode }} />
            </div>
          </div>
        </div>
      )}

      {/* Parameter Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Edit Diagram Parameters
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Adjusting these numerical values will instantly re-render the vector diagram with matched visual labels.
            </p>

            <div className="space-y-3 mb-6">
              {Object.entries(localParams).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 capitalize">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => setLocalParams({ ...localParams, [key]: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveParams}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Apply & Re-render
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
