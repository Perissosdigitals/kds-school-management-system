import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    containerClassName?: string;
}

export const Input: React.FC<InputProps> = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-semibold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <i className={`bx ${icon} absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors text-xl`}></i>
                )}
                <input
                    ref={ref}
                    className={`
            w-full transition-all duration-300
            bg-slate-50 border-2 border-slate-100 rounded-xl
            text-slate-800 placeholder:text-slate-400
            focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : 'px-4'}
            py-2.5
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs font-medium text-red-500 ml-1 flex items-center gap-1">
                    <i className='bx bx-error-circle'></i> {error}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';
