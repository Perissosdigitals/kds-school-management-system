import React from 'react';

interface RelationalLinkProps {
  label: string;
  value: string | undefined;
  onClick?: () => void;
  icon?: string;
  className?: string;
}

export const RelationalLink: React.FC<RelationalLinkProps> = ({ 
  label, 
  value, 
  onClick, 
  icon = 'bx-link-external',
  className = ''
}) => {
  if (!value) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-slate-400">Non assigné</p>
      </div>
    );
  }

  if (!onClick) {
    return (
      <div className={className}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-slate-800">{value}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-sm text-gray-500">{label}</p>
      <button
        onClick={onClick}
        className="flex items-center gap-2 font-medium text-blue-700 hover:text-blue-900 hover:underline transition-colors group"
      >
        <span>{value}</span>
        <i className={`bx ${icon} text-sm opacity-0 group-hover:opacity-100 transition-opacity`}></i>
      </button>
    </div>
  );
};

interface RelationalCardProps {
  title: string;
  items: Array<{
    id: string;
    label: string;
    sublabel?: string;
  }>;
  onItemClick?: (id: string) => void;
  emptyMessage?: string;
  icon?: string;
}

export const RelationalCard: React.FC<RelationalCardProps> = ({
  title,
  items,
  onItemClick,
  emptyMessage = 'Aucune donnée disponible',
  icon = 'bx-folder'
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <i className={`bx ${icon}`}></i>
          {title}
        </h4>
        <p className="text-sm text-slate-500 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
      <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <i className={`bx ${icon}`}></i>
        {title} ({items.length})
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onItemClick?.(item.id)}
            className={`p-3 bg-white rounded-lg border border-slate-200 transition-all ${
              onItemClick ? 'cursor-pointer hover:border-blue-400 hover:shadow-sm' : ''
            }`}
          >
            <p className="font-medium text-slate-800">{item.label}</p>
            {item.sublabel && (
              <p className="text-xs text-slate-600 mt-1">{item.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
