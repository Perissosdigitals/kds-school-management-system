import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullPage = false
}) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 z-[100] bg-slate-50/80 backdrop-blur-sm'
    : 'h-full w-full py-12';

  return (
    <div className={`flex flex-col items-center justify-center ${containerClasses}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl animate-pulse"></div>
        <i className={`bx bx-loader-alt bx-spin relative z-10 text-emerald-600 ${sizeClasses[size]}`}></i>
      </div>
      <span className="mt-4 text-slate-500 font-medium tracking-wide animate-pulse">Chargement en cours...</span>
    </div>
  );
};