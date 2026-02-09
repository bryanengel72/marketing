import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}