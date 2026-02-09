import React from 'react';
import { Check } from 'lucide-react';

interface ChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelection?: number;
  error?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({ 
  label, 
  options, 
  selected, 
  onChange, 
  maxSelection = 3,
  error 
}) => {
  
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      if (selected.length < maxSelection) {
        onChange([...selected, option]);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-500">
          {selected.length}/{maxSelection} selected
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          const isDisabled = !isSelected && selected.length >= maxSelection;
          
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggle(option)}
              disabled={isDisabled}
              className={`
                group relative flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium border transition-all duration-200
                ${isSelected 
                  ? 'bg-corporate-900 border-corporate-900 text-white shadow-md' 
                  : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isSelected && <Check size={14} className="text-white" />}
              {option}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};