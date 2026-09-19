import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, Info } from 'lucide-react';

const MatchScoreBadge = ({ score = 0, details = null, showTooltip = true }) => {
  const [showPopover, setShowPopover] = useState(false);

  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200 ring-emerald-100';
    if (val >= 65) return 'text-indigo-700 bg-indigo-50 border-indigo-200 ring-indigo-100';
    if (val >= 50) return 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-100';
    return 'text-slate-600 bg-slate-100 border-slate-200 ring-slate-100';
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => showTooltip && details && setShowPopover(true)}
        onMouseLeave={() => showTooltip && setShowPopover(false)}
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs transition-all cursor-pointer ${getScoreColor(
          score
        )}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Match</span>
        {details && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </div>

      {showPopover && details && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3.5 bg-slate-900 text-white rounded-xl shadow-xl text-xs space-y-2 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-semibold">
            <span className="flex items-center gap-1 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" /> AI Match Analysis
            </span>
            <span className="text-emerald-400 font-bold">{score}%</span>
          </div>

          {details.reason && (
            <p className="text-[11px] text-slate-300 leading-relaxed italic">
              "{details.reason}"
            </p>
          )}

          {details.matchedSkills?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" /> Matched Skills
              </p>
              <p className="text-[11px] text-slate-300">
                {details.matchedSkills.slice(0, 5).join(', ')}
              </p>
            </div>
          )}

          {details.missingSkills?.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Growth Areas
              </p>
              <p className="text-[11px] text-slate-400">
                {details.missingSkills.slice(0, 4).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchScoreBadge;
