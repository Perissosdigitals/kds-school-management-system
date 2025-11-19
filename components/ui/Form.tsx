import React from 'react';

export const FormSection = React.memo<{ title: string; icon: string; children: React.ReactNode }>(({ title, icon, children }) => (
    <div className="mb-8 pb-6 border-b border-slate-200">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-700 mb-4">
            <i className={`bx ${icon}`}></i>
            {title}
        </h3>
        {children}
    </div>
));

export const FormGroup = React.memo<{ children: React.ReactNode, className?: string }>(({ children, className }) => (
    <div className={className}>{children}</div>
));

export const Label = React.memo<{ htmlFor: string; required?: boolean; children: React.ReactNode }>(({ htmlFor, required, children }) => (
    <label htmlFor={htmlFor} className="block mb-2 font-semibold text-slate-700">
        {children} {required && <span className="text-red-600">*</span>}
    </label>
));

export const Input = React.memo<React.InputHTMLAttributes<HTMLInputElement>>((props) => (
    <input {...props} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" />
));

export const Select = React.memo<React.SelectHTMLAttributes<HTMLSelectElement>>((props) => (
    <select {...props} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition bg-white" />
));

export const Textarea = React.memo<React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props) => (
    <textarea {...props} rows={3} className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" />
));