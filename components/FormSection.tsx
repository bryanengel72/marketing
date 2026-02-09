import React from 'react';
import { FormSectionProps } from '../types';

export const FormSection: React.FC<FormSectionProps> = ({ title, description, children, icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-soft hover:border-primary-100/50">
      <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-50 flex items-start gap-5">
        {icon && (
          <div className="shrink-0 text-primary-600 bg-gradient-to-br from-primary-50 to-primary-100 p-3 rounded-xl shadow-inner ring-1 ring-primary-100/50">
            {icon}
          </div>
        )}
        <div className="pt-0.5">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          {description && <p className="text-sm md:text-base text-gray-500 mt-1 leading-relaxed">{description}</p>}
        </div>
      </div>
      <div className="p-6 md:p-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          {children}
        </div>
      </div>
    </div>
  );
};