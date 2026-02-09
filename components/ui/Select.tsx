import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: (Option | string)[];
  placeholder?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  placeholder = "Select an option", 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full relative group">
      <label htmlFor={inputId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={inputId}
          className={`
            w-full px-4 py-3 pr-10
            bg-white border rounded-sm appearance-none
            text-base text-corporate-900 placeholder-slate-400
            transition-all duration-200 ease-in-out
            focus:outline-none focus:border-corporate-900 focus:ring-1 focus:ring-corporate-900
            cursor-pointer
            ${error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400'}
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="text-slate-400">
            {placeholder}
          </option>
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const label = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value} className="text-slate-900">
                {label}
              </option>
            );
          })}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};