import React, { useState, useMemo } from 'react';
import { Megaphone, Settings, Users, ArrowRight, TrendingUp, Sparkles, ShoppingCart, Plus, Trash2, CheckCircle, AlertOctagon, Cookie, ShoppingBag, ArrowLeft, PiggyBank, HandCoins, ThumbsUp, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Clock, Gift, Heart } from 'lucide-react';
import { Chore, Bill, IOU, Goal, KingdomEvent, Coupon, DateNightLog, Announcement, Activity, Profile, ShoppingItem } from '../types';
import { ProgressBar, ChoreItem, ModalWrapper } from './Shared';

// Constants needed in views
const THEME_COLORS = [
    { name: 'Yellow', bg: 'bg-themeYellow', text: 'text-themeYellowDark', border: 'border-themeYellow' },
    { name: 'Blue', bg: 'bg-themeBlue', text: 'text-themeBlueDark', border: 'border-themeBlue' },
    { name: 'Pink', bg: 'bg-themePink', text: 'text-themePinkDark', border: 'border-themePink' },
    { name: 'Green', bg: 'bg-themeGreen', text: 'text-themeGreenDark', border: 'border-themeGreen' },
    { name: 'Purple', bg: 'bg-themePurple', text: 'text-themePurpleDark', border: 'border-themePurple' },
    { name: 'Orange', bg: 'bg-themeOrange', text: 'text-themeOrangeDark', border: 'border-themeOrange' },
];

interface CastleProps {
    chores: Chore[];
    completed: Chore[];
    events: KingdomEvent[];
    goals: Goal[];
    bills: Bill[];
    ious: IOU[];
    activities: Activity[];
    user: string;
    settings: any;
    profiles: Record<string, Profile>;
    announcements: Announcement[];
    onOpenSettings: () => void;
    onOpenMeeting: () => void;
    onOpenHistory: () => void;
}

export const CastleView: React.FC<CastleProps> = ({ completed, events, goals, bills, activities, user, settings, profiles, announcements, onOpenSettings, onOpenMeeting, onOpenHistory }) => {
    // Helper to determine if a chore counts as a household deed
    const isDeed = (c: Chore) => {
        if (c.type === 'whim') return false;
        if (c.goalId) {
            const g = goals.find(goal => goal.id === c.goalId);
            if (g && g.type === 'personal') return false;
        }
        return true;
    };

    const duckyScore = completed.filter(c => c.completedBy === 'Ducky' && isDeed(c)).length;
    const pipsScore = completed.filter(c => c.completedBy === 'Pips' && isDeed(c)).length;
    const scoreDiff = duckyScore - pipsScore;
    
    const [statsTimeframe, setStatsTimeframe] = useState<'weekly'|'monthly'|'yearly'>('weekly');
    
    const financialStats = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();
        if(statsTimeframe === 'weekly') filterDate.setDate(now.getDate() - 7);
        if(statsTimeframe === 'monthly') filterDate.setMonth(now.getMonth() - 1);
        if(statsTimeframe === 'yearly') filterDate.setFullYear(now.getFullYear() - 1);

        const getContributions = (who: string) => {
            let total = 0;
            bills.forEach(b => {
                (b.payments || []).forEach(p => {
                    if(p.who === who && new Date(p.date) >= filterDate) total += p.amount;
                });
            });
            activities.filter(a => a.who === who && new Date(a.createdAt?.seconds!*1000) >= filterDate && a.description.includes('($')).forEach(a => {
                const match = a.description.match(/\(\$(\d+(\.\d+)?)\)/);
                if(match) total += parseFloat(match[1]);
            });
            goals.forEach(g => {
                (g.contributions || []).forEach(c => {
                    if(c.who === who && new Date(c.date) >= filterDate) total += c.amount;
                });
            });
            return total;
        };

        return { Ducky: getContributions('Ducky'), Pips: getContributions('Pips') };
    }, [bills, activities, goals, statsTimeframe]);

    const deedStats = useMemo(() => {
        const now = new Date();
        const filterDate = new Date();
        if(statsTimeframe === 'weekly') filterDate.setDate(now.getDate() - 7);
        if(statsTimeframe === 'monthly') filterDate.setMonth(now.getMonth() - 1);
        if(statsTimeframe === 'yearly') filterDate.setFullYear(now.getFullYear() - 1);

        return {
            Ducky: completed.filter(c => c.completedBy === 'Ducky' && isDeed(c) && new Date(c.completedAt?.seconds!*1000) >= filterDate).length,
            Pips: completed.filter(c => c.completedBy === 'Pips' && isDeed(c) && new Date(c.completedAt?.seconds!*1000) >= filterDate).length
        };
    }, [completed, statsTimeframe, goals]);

    const margin = 5; 
    let currentFlag = settings.kingdomFlag || '🏰';
    let ruler = 'The Kingdom';
    let flagColor = 'text-pink-500';
    if (scoreDiff > margin) { currentFlag = settings.duckyFlag || '🐥'; ruler = `${profiles.Ducky?.name || 'Ducky'}'s Reign`; flagColor = 'text-yellow-600'; }
    else if (scoreDiff < -margin) { currentFlag = settings.pipsFlag || '🐦'; ruler = `${profiles.Pips?.name || 'Pips'}'s Reign`; flagColor = 'text-blue-600'; }

    const activeAnnouncement = announcements.find(a => a.active && a.from !== user);

    const cycleTimeframe = () => {
        const map: any = { weekly: 'monthly', monthly: 'yearly', yearly: 'weekly' };
        setStatsTimeframe(map[statsTimeframe]);
    };

    return (
        <div className="space-y-6">
            {activeAnnouncement && (
                <div className="bg-purple-100 border-2 border-purple-300 p-4 rounded-2xl flex items-start gap-3 shadow-md animate-pop">
                    <Megaphone className="text-purple-600 shrink-0" size={24} />
                    <div>
                        <h4 className="font-black text-purple-800 text-xs uppercase mb-1">Royal Decree from {profiles[activeAnnouncement.from]?.name}</h4>
                        <p className="text-purple-900 font-bold text-sm">{activeAnnouncement.message}</p>
                    </div>
                </div>
            )}

            <div onClick={onOpenHistory} className="bg-white rounded-[2.5rem] p-6 text-center relative overflow-hidden border-4 border-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow active:scale-95 transition-transform">
                <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); }} className="absolute top-4 right-4 z-50 text-gray-300 hover:text-gray-500 bg-gray-50 p-2 rounded-full shadow-sm active:scale-95"><Settings size={18}/></button>
                <div className="h-32 flex items-end justify-center mb-2 relative">
                    <div className="absolute top-0 flex flex-col items-center animate-float"><div className={`text-4xl filter drop-shadow-md ${flagColor}`}>{currentFlag}</div><div className="h-12 w-1 bg-gray-300"></div></div>
                    <svg viewBox="0 0 100 60" className="w-48 h-auto text-gray-200 fill-current"><path d="M10 60 V30 L5 30 L5 20 L15 10 L25 20 L25 30 L20 30 V60 H10 Z" /><path d="M80 60 V30 L75 30 L75 20 L85 10 L95 20 L95 30 L90 30 V60 H80 Z" /><path d="M20 60 V40 H80 V60 Z" /><path d="M40 60 V45 A10 10 0 0 1 60 45 V60 Z" fill="#4b5563" /></svg>
                </div>
                <h2 className="text-2xl font-black text-gray-800">{settings.name || 'Our Kingdom'}</h2>
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${flagColor}`}>{ruler}</p>
                <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Tap for Royal History</p>
            </div>

            <button onClick={onOpenMeeting} className="w-full bg-gradient-to-r from-gray-800 to-black p-5 rounded-2xl shadow-lg flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div className="text-left">
                    <h3 className="text-white font-black text-lg flex items-center gap-2"><Users size={20} className="text-pink-400"/> Daily Family Meeting</h3>
                    <p className="text-gray-400 text-xs mt-1">Check-in, Plan, & Connect</p>
                </div>
                <div className="bg-white/10 p-3 rounded-full group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="text-white" size={20}/>
                </div>
            </button>

            <div>
                <div className="flex justify-between items-center mb-3 ml-1">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14}/> Kingdom Stats</h3>
                    <button onClick={cycleTimeframe} className="bg-gray-100 px-2 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase">{statsTimeframe}</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4" onClick={cycleTimeframe}>
                    <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 text-center relative overflow-hidden">
                        <div className="text-2xl mb-1">{profiles.Ducky?.icon}</div>
                        <div className="text-3xl font-black text-yellow-800">{deedStats.Ducky}</div>
                        <div className="text-[10px] font-bold text-yellow-600 uppercase">Deeds</div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 text-center relative overflow-hidden">
                        <div className="text-2xl mb-1">{profiles.Pips?.icon}</div>
                        <div className="text-3xl font-black text-blue-800">{deedStats.Pips}</div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Deeds</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm" onClick={cycleTimeframe}>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 text-center">Financial Contribution ({statsTimeframe})</h4>
                        <div className="flex gap-4">
                        <div className="flex-1 text-center">
                            <div className="text-sm font-black text-yellow-600">${financialStats.Ducky.toLocaleString()}</div>
                            <div className="h-2 bg-yellow-100 rounded-full mt-1 overflow-hidden">
                                <div style={{width: `${(financialStats.Ducky / (financialStats.Ducky+financialStats.Pips || 1))*100}%`}} className="h-full bg-yellow-400"></div>
                            </div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-sm font-black text-blue-600">${financialStats.Pips.toLocaleString()}</div>
                            <div className="h-2 bg-blue-100 rounded-full mt-1 overflow-hidden">
                                <div style={{width: `${(financialStats.Pips / (financialStats.Ducky+financialStats.Pips || 1))*100}%`}} className="h-full bg-blue-400"></div>
                            </div>
                        </div>
                        </div>
                </div>
            </div>
        </div>
    );
}

// ... Rest of the file unchanged (MyListView, ShoppingListView, etc.)
export const MyListView: React.FC<{ chores: Chore[]; onToggle: (c: Chore) => void; onDelete: (id: string) => void; user: string; progress: number; threshold: number }> = ({ chores, onToggle, onDelete, user, progress, threshold }) => { 
    const pretty = chores.filter(c => c.isPrettyPlease); 
    const regular = chores.filter(c => !c.isPrettyPlease);
    const sort = (list: Chore[]) => list.sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); });
    return (
        <div className="space-y-6">
            <ProgressBar current={progress} max={threshold || 5} label="Next Coupon" color={user === 'Ducky' ? 'bg-yellow-400' : 'bg-blue-400'} />
            {pretty.length > 0 && <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200 shadow-sm"><h2 className="text-pink-600 font-bold flex items-center gap-2 mb-3 text-sm uppercase tracking-wider"><Sparkles size={16} /> Pretty Please</h2><div className="space-y-3">{pretty.map(chore => <ChoreItem key={chore.id} chore={chore} onToggle={onToggle} onDelete={onDelete} isPretty={true} />)}</div></div>}
            <div><h2 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 ml-1">Current List</h2>{regular.length === 0 ? <div className="text-center py-12 opacity-50"><div className="text-4xl mb-2">🎉</div><p className="text-sm font-medium">All done!</p></div> : <div className="space-y-3">{sort(regular).map(chore => <ChoreItem key={chore.id} chore={chore} onToggle={onToggle} onDelete={onDelete} />)}</div>}</div>
        </div>
    );
}

export const ShoppingListView: React.FC<{ items: ShoppingItem[]; onAdd: (d?: any) => void; onToggle: (id: string, c: boolean) => void; onDelete: (id: string) => void; onFinishShopping: (t: number) => void; isShoppingMode: boolean; setShoppingMode: (m: boolean) => void; user: string }> = ({ items, onAdd, onToggle, onDelete, onFinishShopping, isShoppingMode, setShoppingMode }) => {
    // Sort items: High Priority (0) -> Normal (1) -> Treats (2)
    const sortedItems = [...items].sort((a, b) => {
        const pMap = { 'high': 0, 'normal': 1, 'treat': 2 };
        const pA = pMap[a.priority || 'normal'];
        const pB = pMap[b.priority || 'normal'];
        if (pA !== pB) return pA - pB;
        return 0; // Maintain insertion order otherwise
    });

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ShoppingCart size={20} className="text-orange-400"/> {isShoppingMode ? 'Shopping Mode' : 'Shopping List'}</h2>
                    <button onClick={() => { if(isShoppingMode && items.some(i=>i.completed)) onFinishShopping(0); else setShoppingMode(!isShoppingMode); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isShoppingMode ? 'bg-green-500 text-white' : 'bg-black text-white'}`}>{isShoppingMode ? 'Finish Shopping' : 'Start Shopping'}</button>
                </div>
                
                {!isShoppingMode && <button onClick={() => onAdd()} className="w-full py-3 mb-4 bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl text-orange-500 font-bold text-sm hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"><Plus size={18}/> Add Item</button>}
                
                <div className="space-y-2">
                    {items.length===0&&<p className="text-center text-gray-300 text-xs py-4">Fridge is full!</p>}
                    {sortedItems.map(item => {
                        let styleClass = "border-gray-100";
                        let icon = null;
                        if (item.priority === 'high') {
                            styleClass = "border-red-100 bg-red-50";
                            icon = <AlertOctagon size={16} className="text-red-500" />;
                        } else if (item.priority === 'treat') {
                            const isDucky = item.owner === 'Ducky';
                            styleClass = isDucky ? "border-yellow-100 bg-yellow-50" : "border-blue-100 bg-blue-50";
                            icon = <Cookie size={16} className={isDucky ? "text-yellow-600" : "text-blue-600"} />;
                        }

                        return (
                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${styleClass} ${isShoppingMode ? (item.completed ? 'opacity-50 grayscale' : '') : 'hover:shadow-sm group'}`}>
                                <div onClick={()=>onToggle(item.id, !item.completed)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                    {item.completed && <CheckCircle size={16} className="text-white"/>}
                                </div>
                                <span className={`flex-1 text-sm font-medium flex items-center gap-2 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {icon} {item.text}
                                </span>
                                {!isShoppingMode && <button onClick={()=>onDelete(item.id)} className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export const AssignView: React.FC<{ chores: Chore[]; onVote: (id: string, dir: string) => void; profile: string }> = ({ chores, onVote }) => {
    const [current, setCurrent] = useState(0); 
    const [dir, setDir] = useState<string|null>(null);
    const chore = chores[current];
    const swipe = (d: string) => { setDir(d); setTimeout(() => { if (chore) onVote(chore.id, d); setDir(null); setCurrent(0); }, 300); };
    if (chores.length === 0) return <div className="flex flex-col items-center justify-center h-full text-center text-gray-400"><div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={40} className="text-gray-300" /></div><p>Caught up!</p></div>;
    return (
        <div className="flex flex-col items-center justify-center h-full relative">
            <h2 className="absolute top-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Swipe to Assign</h2>
            <div className="relative w-full max-w-xs h-80 perspective-1000">
                {chores.length > 1 && <div className="absolute top-4 left-4 w-full h-full bg-white border border-gray-100 rounded-3xl shadow-sm z-0 transform scale-95 opacity-50"></div>}
                {chore && <div className={`absolute top-0 left-0 w-full h-full bg-white border border-gray-200 rounded-3xl shadow-xl z-10 flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ease-out transform ${dir === 'left' ? '-translate-x-full rotate-[-20deg] opacity-0' : ''} ${dir === 'right' ? 'translate-x-full rotate-[20deg] opacity-0' : ''}`}>{chore.isPrettyPlease && <Sparkles className="text-pink-400 mb-4" size={32} />}<h3 className="text-2xl font-black text-gray-800 mb-2">{chore.title}</h3><div className="absolute bottom-8 w-full px-8 flex justify-between text-xs font-bold uppercase tracking-wider text-gray-300"><span className="text-blue-300">{'< Pips'}</span><span className="text-yellow-400">{'Ducky >'}</span></div></div>}
            </div>
            <div className="flex gap-8 mt-12"><button onClick={() => swipe('left')} className="w-16 h-16 bg-white border-2 border-blue-100 text-blue-400 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"><ArrowLeft size={24} /></button><button onClick={() => swipe('right')} className="w-16 h-16 bg-white border-2 border-yellow-100 text-yellow-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all"><ArrowRight size={24} /></button></div>
        </div>
    );
}

export const BudgetView: React.FC<{ bills: Bill[]; income: any; ious: IOU[]; user: string; onUpdateIncome: (d: any) => void; onPayBill: (b: Bill) => void; onRequestIOU: () => void; onClearIOU: (id: string) => void; onApproveIOU: (id: string) => void; onDeleteIOU: (id: string) => void }> = ({ bills, income, ious, user, onUpdateIncome, onPayBill, onRequestIOU, onClearIOU, onApproveIOU, onDeleteIOU }) => {
    const tot = (Number(income.ducky)||0)+(Number(income.pips)||0); 
    const dr = tot>0?(Number(income.ducky)/tot):0.5; 
    
    const unpaid = bills.filter(b => (b.totalPaid || 0) < b.amount);
    const paid = bills.filter(b => (b.totalPaid || 0) >= b.amount);
    
    const pendingCount = ious.filter(i => i.to === user && i.status === 'pending').length;
    const incomingRequests = ious.filter(i => i.to === user && i.status === 'pending');

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h2 className="text-xs font-bold text-gray-400 uppercase mb-3">Monthly Income</h2>
                <div className="flex gap-4 mb-4">
                    <input type="number" className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-sm" value={income.ducky} onChange={(e)=>onUpdateIncome({ducky:e.target.value})} placeholder="Ducky $"/>
                    <input type="number" className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm" value={income.pips} onChange={(e)=>onUpdateIncome({pips:e.target.value})} placeholder="Pips $"/>
                </div>
                <div className="h-4 bg-gray-100 rounded-full flex overflow-hidden">
                    <div style={{width:`${dr*100}%`}} className="bg-yellow-300 h-full flex items-center justify-center text-[10px] font-bold text-yellow-800">{Math.round(dr*100)}%</div>
                    <div className="flex-1 bg-blue-300 h-full flex items-center justify-center text-[10px] font-bold text-blue-800">{Math.round((1-dr)*100)}%</div>
                </div>
            </div>

            <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200 relative">
                {pendingCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold animate-pulse z-10">{pendingCount}</span>}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-pink-600 font-bold text-sm uppercase flex gap-2"><HandCoins size={16}/> IOU</h2>
                    <button onClick={onRequestIOU} className="bg-white text-pink-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Borrow Request</button>
                </div>
                
                {incomingRequests.length > 0 && (
                    <div className="mb-4 space-y-2">
                        <h4 className="text-xs font-black text-pink-400 uppercase">Requests to Borrow from You</h4>
                        {incomingRequests.map(i => (
                            <div key={i.id} className="bg-white p-3 rounded-xl border border-pink-200 flex justify-between items-center">
                                <div><div className="text-xs font-bold text-gray-700">{i.from} wants to borrow ${i.amount}</div><div className="text-[10px] text-gray-400">{i.reason}</div></div>
                                <div className="flex gap-2">
                                    <button onClick={()=>onApproveIOU(i.id)} className="bg-green-100 text-green-600 p-1.5 rounded-lg"><ThumbsUp size={14}/></button>
                                    <button onClick={()=>onDeleteIOU(i.id)} className="bg-red-100 text-red-600 p-1.5 rounded-lg"><X size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {ious.filter(i => i.status === 'approved').map(i=><div key={i.id} className="bg-white p-3 rounded-xl border border-pink-100 flex justify-between items-center mb-2"><div><div className="text-xs font-bold text-gray-700">{i.from} owes {i.to} ${i.amount}</div><div className="text-[10px] text-gray-400">{i.reason}</div></div><button onClick={()=>onClearIOU(i.id)} className="text-gray-300 hover:text-green-500"><CheckCircle size={16}/></button></div>)}
            </div>

            <div>
                <h2 className="text-gray-400 font-bold text-xs uppercase mb-3 ml-1">Bills Due</h2>
                {unpaid.map(b => (
                    <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-2">
                         <div className="flex justify-between items-start mb-2">
                             <div>
                                 <h3 className="font-bold text-gray-800">{b.title}</h3>
                                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{b.frequency} • Due {new Date(b.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                             </div>
                             <div className="text-right">
                                 <div className="font-black text-gray-800">${b.totalPaid || 0} / ${b.amount}</div>
                                 <button onClick={() => onPayBill(b)} className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-1 rounded-md mt-1">Pay Portion</button>
                             </div>
                         </div>
                         <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative">
                             <div className="absolute top-0 bottom-0 w-0.5 bg-black/20 z-10" style={{ left: `${dr * 100}%` }}></div>
                             <div className="h-full flex">
                                 <div style={{ width: `${((b.payments || []).filter(p => p.who === 'Ducky').reduce((s,p) => s + p.amount, 0) / b.amount) * 100}%` }} className="bg-yellow-400 h-full"></div>
                                 <div style={{ width: `${((b.payments || []).filter(p => p.who === 'Pips').reduce((s,p) => s + p.amount, 0) / b.amount) * 100}%` }} className="bg-blue-400 h-full"></div>
                             </div>
                         </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const GoalsView: React.FC<{ goals: Goal[]; user: string; onUpdate: (id: string, d: any) => void; onDelete: (id: string) => void }> = ({ goals, user, onUpdate, onDelete }) => {
    const [filter, setFilter] = useState('mine');
    const filteredGoals = goals.filter(g => filter==='ours'?g.type==='shared':(filter==='mine'?g.type==='personal'&&g.owner===user:g.type==='personal'&&g.owner!==user));
    
    // Minimal sub-component for goal rendering
    const GoalCard = ({ goal }: { goal: Goal }) => {
        const [expand, setExpand] = useState(false);
        const [add, setAdd] = useState('');
        const [habit, setHabit] = useState('');
        const [task, setTask] = useState('');
        
        const prog = goal.financialTarget ? Math.min((goal.savedAmount/goal.financialTarget)*100,100) : (goal.tasks ? (goal.tasks.filter(t=>t.completed).length / (goal.tasks.length || 1))*100 : 0);

        return (
            <div className={`bg-white rounded-3xl p-5 shadow-cute border-2 overflow-hidden animate-pop mb-3 ${goal.completed ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                 <div className="flex justify-between items-start cursor-pointer" onClick={()=>setExpand(!expand)}>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-black text-lg ${goal.completed ? 'text-green-700 line-through opacity-70' : 'text-gray-700'}`}>{goal.title}</h3>
                            {goal.completed && <CheckCircle size={18} className="text-green-500" />}
                        </div>
                        {!goal.completed && <div className="mt-1 h-2.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200"><div style={{width:`${prog}%`}} className="h-full bg-gradient-to-r from-green-400 to-emerald-500"></div></div>}
                    </div>
                    <div className="flex items-center ml-3">
                        <button onClick={(e)=>{e.stopPropagation(); onUpdate(goal.id, {completed: !goal.completed});}} className={`p-2 rounded-full mr-1 ${goal.completed ? 'text-green-600 bg-green-200' : 'text-gray-300 hover:text-green-500'}`}><CheckCircle size={20}/></button>
                        <button onClick={(e)=>{e.stopPropagation(); onDelete(goal.id);}} className="text-gray-300 hover:text-red-400"><Trash2 size={16}/></button>
                    </div>
                </div>
                {expand && <div className="mt-4 pt-4 border-t-2 border-gray-50">
                    {goal.financialTarget > 0 && <div className="flex gap-2 mb-4"><input type="number" placeholder="$" className="w-20 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold" value={add} onChange={e=>setAdd(e.target.value)} /><button onClick={() => { if(add) onUpdate(goal.id, { savedAmount: (goal.savedAmount||0)+parseFloat(add) }); }} className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black">ADD</button></div>}
                    <div className="space-y-2 mb-3">{(goal.tasks||[]).map(t=><div key={t.id} onClick={()=>{const n=goal.tasks.map(x=>x.id===t.id?{...x,completed:!x.completed}:x); onUpdate(goal.id,{tasks:n});}} className="flex gap-3 items-center group cursor-pointer"><div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${t.completed?'bg-indigo-500 border-indigo-500':'border-gray-300 bg-white'}`}>{t.completed&&<CheckCircle size={14} className="text-white"/>}</div><span className={`text-sm font-medium ${t.completed?'text-gray-300 line-through':'text-gray-600'}`}>{t.text}</span></div>)}</div>
                    <div className="flex gap-2"><input type="text" placeholder="Add task..." className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold" value={task} onChange={e=>setTask(e.target.value)}/><button onClick={() => { if(task) { onUpdate(goal.id, {tasks:[...(goal.tasks||[]),{id:Date.now(),text:task,completed:false}]}); setTask(''); } }} className="bg-gray-100 text-gray-400 p-2 rounded-xl"><Plus size={20}/></button></div>
                </div>}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-gray-200 p-1 rounded-xl"><button onClick={()=>setFilter('mine')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${filter==='mine'?'bg-white shadow text-gray-800':'text-gray-500'}`}>Me</button><button onClick={()=>setFilter('ours')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${filter==='ours'?'bg-white shadow text-gray-800':'text-gray-500'}`}>Us</button><button onClick={()=>setFilter('partner')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${filter==='partner'?'bg-white shadow text-gray-800':'text-gray-500'}`}>Them</button></div>
            {filteredGoals.map(g => <GoalCard key={g.id} goal={g} />)}
            {filteredGoals.length === 0 && <p className="text-center text-gray-400 py-10 italic">No goals yet! Dream big!</p>}
        </div>
    );
}

export const CalendarView: React.FC<{ events: KingdomEvent[]; user: string; onAck: (id: string) => void; onDelete: (id: string) => void }> = ({ events, user, onAck, onDelete }) => {
    const [date, setDate] = useState(new Date()); const [sel, setSel] = useState(new Date());
    const daysInMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    const startDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = []; for(let i=0;i<startDay;i++) days.push(<div key={`e-${i}`}></div>);
    for(let i=1;i<=daysInMonth;i++) {
        const d = new Date(date.getFullYear(), date.getMonth(), i);
        const evs = events.filter(e=>{if(!e.date)return false; const ed=new Date(e.date); return ed.getDate()===i && ed.getMonth()===date.getMonth() && ed.getFullYear()===date.getFullYear();});
        const isSel = d.getDate()===sel.getDate() && d.getMonth()===sel.getMonth();
        days.push(<div key={i} onClick={()=>setSel(d)} className={`h-12 border-t border-gray-50 flex flex-col items-center justify-center cursor-pointer ${isSel?'bg-pink-50':''}`}><span className="text-sm font-bold text-gray-700">{i}</span><div className="flex gap-0.5 mt-1">{evs.slice(0,3).map(e=><div key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.type==='shared'?'bg-pink-400':(e.owner==='Ducky'?'bg-yellow-400':'bg-blue-400')}`}></div>)}</div></div>);
    }
    const selEvs = events.filter(e=>{if(!e.date)return false; const ed=new Date(e.date); return ed.getDate()===sel.getDate() && ed.getMonth()===sel.getMonth() && ed.getFullYear()===sel.getFullYear();});
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"><div className="flex justify-between items-center mb-4"><button onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()-1,1))}><ChevronLeft size={20}/></button><h2 className="text-lg font-black">{date.toLocaleString('default',{month:'long',year:'numeric'})}</h2><button onClick={()=>setDate(new Date(date.getFullYear(),date.getMonth()+1,1))}><ChevronRight size={20}/></button></div><div className="grid grid-cols-7 text-center mb-2">{['S','M','T','W','T','F','S'].map(d=><span key={d} className="text-[10px] font-bold text-gray-400">{d}</span>)}</div><div className="grid grid-cols-7 text-center">{days}</div></div>
            <div><h3 className="text-gray-400 font-bold text-xs uppercase mb-3 ml-1">{sel.toLocaleDateString()}</h3><div className="space-y-3">{selEvs.map(e=><div key={e.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-pink-400 flex justify-between items-center"><div><div className="font-bold text-gray-800">{e.title}</div><div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {e.time}</div></div><div className="flex gap-2">{e.type==='shared'&&e.acks&&!e.acks[user]&&<button onClick={()=>onAck(e.id)} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Ack</button>}<button onClick={()=>onDelete(e.id)} className="text-gray-300"><Trash2 size={16}/></button></div></div>)}</div></div>
        </div>
    );
}

export const RewardsView: React.FC<{ coupons: Coupon[]; currentUser: string; onRedeem: (c: Coupon) => void }> = ({ coupons, currentUser, onRedeem }) => {
    const myCoupons = coupons.filter(c => c.owner === currentUser && !c.isUsed);
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10"><h2 className="text-2xl font-black mb-1">Your Wallet</h2><p className="opacity-80 text-sm">You have {myCoupons.length} coupons available.</p></div>
                <Gift className="absolute -bottom-4 -right-4 text-white opacity-20" size={100} />
            </div>
            <div className="grid grid-cols-1 gap-4">
                {myCoupons.length === 0 ? <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200"><p>No coupons yet!</p><p className="text-xs mt-1">Complete chores to earn them.</p></div> : 
                    myCoupons.map(coupon => (
                        <div key={coupon.id} className="bg-white rounded-xl border-2 border-dashed border-indigo-200 p-4 flex items-center justify-between">
                            <div><h3 className="font-bold text-gray-800">{coupon.title}</h3><p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">Valid forever</p></div>
                            <button onClick={() => onRedeem(coupon)} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100">Use</button>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export const DateNightView: React.FC<{ history: DateNightLog[]; progress: number; onLog: (d: any) => void; resetProgress: (c: number) => void; threshold: number }> = ({ history, progress, onLog, resetProgress, threshold }) => {
    const [showGenerator, setShowGenerator] = useState(false);
    const [generatedDate, setGeneratedDate] = useState<any>(null);
    const target = threshold || 20;
    const isUnlocked = progress >= target;

    const generate = () => {
        if (!isUnlocked) return;
        const DATE_VIBES = ["Cozy", "Fancy", "Adventurous", "Chill", "Romantic", "Spooky", "Nostalgic"];
        const DATE_ACTIVITIES = ["Mini Golf", "Board Games", "Stargazing", "Arcade", "Cooking Class", "Museum", "Hiking", "Movie Marathon"];
        const DATE_FOODS = ["Sushi", "Pizza", "Tacos", "Thai", "Burgers", "Fondue", "Pasta", "Picnic"];
        const DATE_PLACES = ["Living Room Fort", "Downtown", "New Restaurant", "The Park", "Beach/Lake", "Rooftop Bar", "Local Cafe"];
        const date = { vibe: DATE_VIBES[Math.floor(Math.random() * DATE_VIBES.length)], activity: DATE_ACTIVITIES[Math.floor(Math.random() * DATE_ACTIVITIES.length)], food: DATE_FOODS[Math.floor(Math.random() * DATE_FOODS.length)], place: DATE_PLACES[Math.floor(Math.random() * DATE_PLACES.length)], date: new Date().toISOString() };
        setGeneratedDate(date);
        setShowGenerator(true);
    };

    const handleSaveDate = (review: string, photo: string) => { onLog({ ...generatedDate, review, photo }); resetProgress(target); setShowGenerator(false); setGeneratedDate(null); };

    return (
        <div className="space-y-8">
            <div className="text-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-black text-gray-800 mb-4">Date Night Progress</h2>
                <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="none" /><circle cx="80" cy="80" r="70" stroke="#ec4899" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset={440 - (440 * Math.min(progress / target, 1))} className="transition-all duration-1000" /></svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-black text-gray-800">{Math.min(progress, target)}</span><span className="text-xs text-gray-400 font-bold uppercase">of {target}</span></div>
                </div>
                <button onClick={generate} disabled={!isUnlocked} className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all ${isUnlocked ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>{isUnlocked ? "🎲 Roll for Date Night!" : "Keep Working Together!"}</button>
            </div>
             {showGenerator && (
                 <ModalWrapper title="Tonight's Plan" icon={<Sparkles className="text-yellow-400"/>} onClose={() => setShowGenerator(false)}>
                     <div className="space-y-4">
                         <div className="bg-pink-50 p-4 rounded-3xl border-2 border-pink-100 text-center"><span className="block text-[10px] font-black text-pink-400 uppercase mb-1">Vibe</span><span className="text-2xl font-black text-pink-600">{generatedDate?.vibe}</span></div>
                         <button onClick={() => handleSaveDate('', '')} className="w-full bg-black text-white py-4 rounded-2xl font-black">We Did It! (Log)</button>
                     </div>
                 </ModalWrapper>
             )}
            <div>
                <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4">Memory Lane</h3>
                <div className="space-y-4">
                    {history.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2"><div className="flex gap-2"><span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-1 rounded-full">{item.vibe}</span><span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full">{item.food}</span></div><span className="text-[10px] text-gray-400">{new Date(item.date).toLocaleDateString()}</span></div>
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{item.activity} @ {item.place}</h4>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}