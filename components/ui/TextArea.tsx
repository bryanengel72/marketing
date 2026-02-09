import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full group">
      <label htmlFor={inputId} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3
          bg-white border rounded-sm
          text-base text-corporate-900 placeholder-slate-400
          transition-all duration-200 ease-in-out
          focus:outline-none focus:border-corporate-900 focus:ring-1 focus:ring-corporate-900
          min-h-[140px] resize-y
          ${error ? 'border-red-600' : 'border-slate-300 hover:border-slate-400'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};