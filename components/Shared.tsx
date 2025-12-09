import React from 'react';
import { Sparkles, CheckCircle, RefreshCw, Calendar, Trash2, X } from 'lucide-react';
import { Chore, Goal } from '../types';

export const ModalWrapper: React.FC<{ children: React.ReactNode; onClose: () => void; title: string; icon: React.ReactNode }> = ({ children, onClose, title, icon }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-gray-100 relative max-h-[85vh] overflow-y-auto no-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 bg-gray-50 p-2 rounded-full"><X size={20}/></button>
                <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">{icon} {title}</h2>
                {children}
            </div>
        </div>
    );
};

export const ProgressBar: React.FC<{ current: number; max: number; color?: string; label?: string }> = ({ current, max, color = "bg-pink-500", label }) => (
    <div className="w-full mb-4">
        {label && <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider ml-1"><span>{label}</span><span>{current} / {max}</span></div>}
        <div className="h-5 w-full bg-white rounded-full overflow-hidden border-2 border-gray-100 shadow-inner">
            <div className={`h-full ${color} transition-all duration-1000 ease-out flex items-center justify-end pr-2 rounded-full`} style={{ width: `${Math.min((current/max)*100, 100)}%` }}>{current>=max && <Sparkles size={12} className="text-white animate-spin-slow" />}</div>
        </div>
    </div>
);

export const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactElement; label: string; count?: number; prominent?: boolean }> = ({ active, onClick, icon, label, count, prominent }) => {
    if (prominent) {
        return (
            <button onClick={onClick} className="relative -top-10 z-50 flex flex-col items-center justify-center group shrink-0 mx-1">
                <div className={`w-20 h-20 rounded-full shadow-glow flex items-center justify-center border-[6px] border-gray-50 transition-transform duration-300 group-hover:scale-105 ${active ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white' : 'bg-white text-gray-300'}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 32, strokeWidth: 3 })}
                </div>
            </button>
        )
    }
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center py-1 transition-all relative w-full h-14 rounded-2xl ${active ? 'bg-white shadow-cute text-pink-500 -translate-y-1' : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 2.5 })}
            <span className="text-[9px] font-bold leading-tight mt-0.5">{label}</span>
            {count && count > 0 ? <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce shadow-sm border border-white">{count}</span> : null}
        </button>
    );
}

export const ChoreItem: React.FC<{ chore: Chore; onToggle: (c: Chore) => void; onDelete?: (id: string) => void; isPretty?: boolean; showAssignee?: boolean }> = ({ chore, onToggle, onDelete, isPretty, showAssignee }) => {
    const isOverdue = chore.dueDate && new Date(chore.dueDate) < new Date() && !isPretty;
    return (
        <div className={`group relative bg-white rounded-3xl p-4 shadow-cute border-2 transition-all hover:shadow-md flex items-center gap-4 animate-pop ${isPretty ? 'border-pink-200 bg-gradient-to-r from-white to-pink-50' : 'border-gray-100'} ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
            <button onClick={() => onToggle(chore)} className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-colors shadow-sm shrink-0 ${isPretty ? 'border-pink-200 text-pink-500 hover:bg-pink-100' : 'border-gray-200 text-transparent hover:border-green-400 hover:text-green-400 bg-gray-50'}`}><CheckCircle size={22} strokeWidth={3} className={isPretty?"opacity-100":"opacity-0 hover:opacity-100"}/></button>
            <div className="flex-1 overflow-hidden">
                <h3 className={`font-black text-gray-700 text-lg leading-tight truncate ${isPretty ? 'text-pink-600' : ''}`}>{chore.title}</h3>
                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-400 mt-1.5">
                    {showAssignee && <span className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-600`}>{chore.assignedTo}</span>}
                    {!isPretty && chore.frequency && <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg"><RefreshCw size={10} /> {chore.frequency}</span>}
                    {!isPretty && chore.dueDate && <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}><Calendar size={10} /> {new Date(chore.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
                    {isPretty && <span className="flex items-center gap-1 bg-pink-100 text-pink-600 px-2 py-1 rounded-lg border border-pink-200">Favor ✨</span>}
                    {chore.type === 'whim' && <span className="flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-lg border border-purple-200">Whim 🦄</span>}
                    {chore.goalId && <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-lg border border-blue-200">Goal 🎯</span>}
                </div>
            </div>
            {onDelete && <button onClick={() => onDelete(chore.id)} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-400 transition-opacity bg-white rounded-full shadow-sm border border-gray-100 shrink-0"><Trash2 size={18}/></button>}
        </div>
    );
};