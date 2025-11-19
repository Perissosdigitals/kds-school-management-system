import React, { useState, useEffect, useCallback } from 'react';
import { dataSourceManager } from '../services/dataSource';
import type { ModuleConfiguration } from '../services/data-sources/data-source-manager.service';

const getModuleTitleAndIcon = (moduleKey: string): { title: string, icon: string } => {
    switch (moduleKey) {
        case 'students':
            return { title: 'Gestion des Élèves', icon: 'bxs-graduation' };
        // Add other modules here in the future
        default:
            return { title: moduleKey, icon: 'bxs-data' };
    }
};

const getTypeChipClass = (type: 'sheets' | 'rest' | 'csv' | 'sql' | 'firebase') => {
    switch (type) {
        case 'rest': return 'bg-blue-100 text-blue-800';
        case 'csv': return 'bg-green-100 text-green-800';
        case 'sheets': return 'bg-emerald-100 text-emerald-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const ModuleCard: React.FC<{ config: ModuleConfiguration; onAdapterChange: (moduleKey: string, newAdapterId: string) => void }> = ({ config, onAdapterChange }) => {
    const { title, icon } = getModuleTitleAndIcon(config.moduleKey);
    const activeAdapter = config.adapters.find(a => a.id === config.activeAdapterId);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
            <div className="flex items-center gap-3 mb-4">
                <i className={`bx ${icon} text-2xl text-blue-700`}></i>
                <h4 className="text-lg font-bold text-slate-800">{title}</h4>
            </div>
            
            <div>
                <label htmlFor={`adapter-select-${config.moduleKey}`} className="block text-sm font-medium text-slate-600 mb-1">Source de données active</label>
                <select 
                    id={`adapter-select-${config.moduleKey}`}
                    value={config.activeAdapterId}
                    onChange={(e) => onAdapterChange(config.moduleKey, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                >
                    {config.adapters.map(adapter => (
                        <option key={adapter.id} value={adapter.id}>{adapter.name}</option>
                    ))}
                </select>
            </div>
            {activeAdapter && (
                 <div className="mt-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2 rounded-md">
                    <span>Type: <span className={`font-semibold px-1.5 py-0.5 rounded ${getTypeChipClass(activeAdapter.type)}`}>{activeAdapter.type}</span></span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Connecté</span>
                </div>
            )}
        </div>
    );
};

export const DataSourceSelector: React.FC = () => {
    const [configs, setConfigs] = useState<ModuleConfiguration[]>([]);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    useEffect(() => {
        const currentConfigs = dataSourceManager.getModuleConfigurations();
        setConfigs(currentConfigs);
    }, []);

    const handleAdapterChange = useCallback((moduleKey: string, newAdapterId: string) => {
        try {
            dataSourceManager.setActiveAdapter(moduleKey, newAdapterId);
            setConfigs(dataSourceManager.getModuleConfigurations());
            
            const adapterName = dataSourceManager.getAdapter(moduleKey).name;
            const moduleName = getModuleTitleAndIcon(moduleKey).title;
            
            setToast({ message: `Source pour "${moduleName}" changée en "${adapterName}".`, visible: true });
            setTimeout(() => setToast({ message: '', visible: false }), 3500);
        } catch (error) {
            console.error("Failed to set active adapter:", error);
            alert("Erreur lors du changement de source de données.");
        }
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Configuration des Sources de Données</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {configs.map(config => (
                    <ModuleCard key={config.moduleKey} config={config} onAdapterChange={handleAdapterChange} />
                ))}
            </div>
            
            {/* Toast Notification */}
            <div 
                className={`fixed bottom-8 right-8 bg-green-600 text-white py-3 px-6 rounded-lg shadow-xl transition-transform duration-300 ease-in-out ${
                    toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
            >
                <div className="flex items-center gap-3">
                    <i className='bx bxs-check-circle text-xl'></i>
                    <span className="font-semibold">{toast.message}</span>
                </div>
            </div>
        </div>
    );
};