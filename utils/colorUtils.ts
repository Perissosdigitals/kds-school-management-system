
const subjectColorPalette = [
    { bg: 'bg-sky-100', border: 'border-sky-500', text: 'text-sky-800' },
    { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-800' },
    { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-800' },
    { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-800' },
    { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-800' },
    { bg: 'bg-lime-100', border: 'border-lime-500', text: 'text-lime-800' },
    { bg: 'bg-fuchsia-100', border: 'border-fuchsia-500', text: 'text-fuchsia-800' },
    { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-800' },
    { bg: 'bg-violet-100', border: 'border-violet-500', text: 'text-violet-800' },
    { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-800' },
    { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800' },
    { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-800' },
];

const fallbackColor = { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-800' };

/**
 * Generates a consistent color for a subject based on its name.
 * It uses a simple hash of the subject string to pick a color from a predefined palette.
 * This ensures the same subject always gets the same color, and new subjects
 * automatically get a color without needing code changes.
 * @param subject The name of the course subject.
 * @returns An object with Tailwind CSS classes for background, border, and text colors.
 */
export const getSubjectColor = (subject?: string): { bg: string; border: string; text: string; } => {
    if (!subject) {
        return fallbackColor;
    }

    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
        const char = subject.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % subjectColorPalette.length;
    return subjectColorPalette[index];
};