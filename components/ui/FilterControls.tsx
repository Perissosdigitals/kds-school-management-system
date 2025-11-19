import React from 'react';

export const FilterInput = React.memo<React.InputHTMLAttributes<HTMLInputElement>>((props) => (
    <input {...props} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition" />
));

export const FilterSelect = React.memo<React.SelectHTMLAttributes<HTMLSelectElement>>((props) => (
    <select {...props} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition bg-white" />
));