import React, { useState, useEffect, useMemo } from 'react';
import { 
    Heart, CalendarDays, CheckCircle, Repeat, PiggyBank, 
    ShoppingCart, Target, Gift, Crown, Plus, HelpCircle, 
    Megaphone, LogOut, Settings, Edit3, X, HandCoins, CreditCard, Receipt 
} from 'lucide-react';
import { 
    signInAnonymously, onAuthStateChanged, User 
} from 'firebase/auth';
import { 
    collection, doc, onSnapshot, addDoc, updateDoc, 
    deleteDoc, query, orderBy, serverTimestamp, setDoc 
} from 'firebase/firestore';

import { auth, db, DEFAULT_APP_ID } from './services/firebase';
import { NavButton, ModalWrapper } from './components/Shared';
import { 
    CastleView, MyListView, AssignView, BudgetView, 
    ShoppingListView, GoalsView, CalendarView, RewardsView, DateNightView 
} from './components/Views';
import { 
    Chore, Bill, Goal, KingdomEvent, Coupon, 
    DateNightLog, Announcement, Activity, IOU, 
    ShoppingItem, Settings as AppSettings, Profile 
} from './types';

// Default Constants
const DEFAULT_CHORES_PER_COUPON = 5; 
const DEFAULT_CHORES_PER_DATENIGHT = 20;
const DEFAULT_COUPONS = ["15 min Back Massage", "Homemade Dinner Choice", "Dish Duty Pass", "Movie Selection", "Breakfast in Bed", "Foot Massage", "Veto Power", "Ice Cream Run", "Bubble Bath Setup", "30 min Gaming Time"];
const THEME_COLORS = [
    { name: 'Yellow', bg: 'bg-themeYellow' },
    { name: 'Blue', bg: 'bg-themeBlue' },
    { name: 'Pink', bg: 'bg-themePink' },
    { name: 'Green', bg: 'bg-themeGreen' },
    { name: 'Purple', bg: 'bg-themePurple' },
    { name: 'Orange', bg: 'bg-themeOrange' },
];

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<string | null>(null);
    const [tab, setTab] = useState('castle');
    const [appId] = useState(DEFAULT_APP_ID);
    
    // Data States
    const [chores, setChores] = useState<Chore[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [dates, setDates] = useState<DateNightLog[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [ious, setIous] = useState<IOU[]>([]);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [events, setEvents] = useState<KingdomEvent[]>([]);
    const [shop, setShop] = useState<ShoppingItem[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [income, setIncome] = useState({ ducky: 0, pips: 0 });
    const [castle, setCastle] = useState({ name: 'Our Kingdom', kingdomFlag: '🏰', duckyFlag: '🐥', pipsFlag: '🐦' });
    const [profiles, setProfiles] = useState<Record<string, Profile>>({
        Ducky: { name: 'Ducky', icon: '🐥', theme: 'Yellow' },
        Pips: { name: 'Pips', icon: '🐦', theme: 'Blue' }
    });
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [settings, setSettings] = useState<AppSettings>({});

    // UI States
    const [modals, setModals] = useState<Record<string, boolean>>({ chore: false, bill: false, goal: false, event: false, iou: false, castle: false, meeting: false, shop: false, profile: false, history: false, payment: false, shoppingComplete: false, rewardSettings: false, announcement: false, help: false });
    const [isShoppingMode, setShoppingMode] = useState(false);
    
    // Auth Init
    useEffect(() => {
        signInAnonymously(auth).catch(console.error);
        return onAuthStateChanged(auth, (u) => { 
            setUser(u); 
            setProfile(localStorage.getItem('ducky_pips_profile')); 
        });
    }, []);

    // Data Sync
    useEffect(() => {
        if (!user) return;
        const subs: (() => void)[] = [];
        
        const subCol = (n: string, s?: {f: string, o: any}) => { 
            const q = s ? query(collection(db, 'artifacts', appId, 'public', 'data', n), orderBy(s.f, s.o)) : collection(db, 'artifacts', appId, 'public', 'data', n);
            subs.push(onSnapshot(q, (r) => {
                const data = r.docs.map(d => ({ id: d.id, ...d.data() }));
                // Simple state dispatcher based on collection name
                switch(n) {
                    case 'chores': setChores(data as Chore[]); break;
                    case 'coupons': setCoupons(data as Coupon[]); break;
                    case 'bills': setBills(data as Bill[]); break;
                    case 'ious': setIous(data as IOU[]); break;
                    case 'goals': setGoals(data as Goal[]); break;
                    case 'events': setEvents(data as KingdomEvent[]); break;
                    case 'shopping': setShop(data as ShoppingItem[]); break;
                    case 'activities': setActivities(data as Activity[]); break;
                    case 'announcements': setAnnouncements(data as Announcement[]); break;
                    case 'datenights': setDates(data as DateNightLog[]); break;
                }
            })); 
        };

        const subDoc = (n: string, i: string, cb: (s: any) => void) => { 
            subs.push(onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', n, i), cb)); 
        };
        
        subCol('chores', {f:'createdAt',o:'asc'}); 
        subCol('coupons'); 
        subCol('bills'); 
        subCol('ious', {f:'createdAt',o:'desc'}); 
        subCol('goals'); 
        subCol('events');
        subCol('shopping');
        subCol('activities', {f:'createdAt',o:'desc'});
        subCol('announcements', {f:'createdAt',o:'desc'});
        subCol('datenights', {f:'createdAt',o:'desc'});

        subDoc('settings', 'income', (s) => setIncome(s.exists() ? s.data() : {ducky:0,pips:0}));
        subDoc('settings', 'castle', (s) => { if(s.exists()) setCastle(s.data()); });
        subDoc('settings', 'profiles', (s) => { if(s.exists()) setProfiles(s.data()); });
        subDoc('settings', 'rewards', (s) => { if (s.exists()) setSettings(prev => ({ ...prev, rewards: s.data() })); });
        
        return () => subs.forEach(u => u && u());
    }, [user, appId]);

    // Data Helpers
    const act = async (type: 'add'|'update'|'delete'|'set', col: string, id: string | null, data?: any) => {
        const pl = { ...data, createdAt: serverTimestamp() };
        try {
            if (type === 'add') await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), pl);
            else if (type === 'update' && id) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), data);
            else if (type === 'delete' && id) { if(window.confirm("Are you sure?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id)); }
            else if (type === 'set' && id) await setDoc(doc(db, 'artifacts', appId, 'public', 'data', col, id), data);
        } catch(e) { console.error(e); }
    };

    const toggleModal = (m: string, v: boolean) => setModals(prev => ({...prev, [m]: v}));

    // Derived State
    const myChores = useMemo(() => chores.filter(c => c.assignedTo === profile && c.status !== 'completed'), [chores, profile]);
    const completed = useMemo(() => chores.filter(c => c.status === 'completed'), [chores]);
    
    // Helper to identify household contributions
    const isHouseholdDeed = (c: Chore) => {
        if (c.type === 'whim') return false;
        if (c.goalId) {
            const g = goals.find(goal => goal.id === c.goalId);
            if (g && g.type === 'personal') return false;
        }
        return true;
    };

    const myCount = completed.filter(c => c.completedBy === profile && !c.redeemedForCoupon && isHouseholdDeed(c)).length;
    const totalCount = completed.filter(c => !c.redeemedForDate && isHouseholdDeed(c)).length;
    const myTheme = profile ? THEME_COLORS.find(c => c.name === profiles[profile]?.theme) || THEME_COLORS[0] : THEME_COLORS[0];

    // Coupon Unlocker
    useEffect(() => { 
        if (!profile || !chores.length) return; 
        const threshold = settings.rewards?.choresPerCoupon || DEFAULT_CHORES_PER_COUPON;
        const un = completed.filter(c => c.completedBy === profile && !c.redeemedForCoupon && isHouseholdDeed(c)); 
        if (un.length >= threshold) { 
            const ids = un.slice(0, threshold).map(c => c.id); 
            const pool = settings.rewards?.pools?.[profile] || DEFAULT_COUPONS;
            const randomCoupon = pool[Math.floor(Math.random() * pool.length)];
            act('add', 'coupons', null, { title: randomCoupon, owner: profile, isUsed: false }); 
            ids.forEach(id => act('update', 'chores', id, { redeemedForCoupon: true })); 
        } 
    }, [completed, profile, settings.rewards, chores.length, goals]); // Added goals to dependency

    // Render Logic
    if (!user) return <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen text-gray-400 animate-pulse"><Heart size={48} className="text-pink-300 mb-4" /><p>Loading Kingdom...</p></div>;
    
    if (!profile) return (
        <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 text-center font-sans fade-in">
            <h1 className="text-5xl font-black text-pink-500 mb-10 drop-shadow-sm tracking-tight animate-bounce-slight">Who are you?</h1>
            <div className="flex gap-8">
                <button onClick={() => {setProfile('Ducky'); localStorage.setItem('ducky_pips_profile', 'Ducky');}} className="w-44 h-44 bg-themeYellow rounded-[3rem] shadow-cute border-4 border-white flex flex-col items-center justify-center hover:scale-105 transition-transform"><div className="text-7xl mb-2">{profiles.Ducky?.icon || '🐥'}</div><span className="text-2xl font-black text-themeYellowDark">{profiles.Ducky?.name || 'Ducky'}</span></button>
                <button onClick={() => {setProfile('Pips'); localStorage.setItem('ducky_pips_profile', 'Pips');}} className="w-44 h-44 bg-themeBlue rounded-[3rem] shadow-cute border-4 border-white flex flex-col items-center justify-center hover:scale-105 transition-transform"><div className="text-7xl mb-2">{profiles.Pips?.icon || '🐦'}</div><span className="text-2xl font-black text-themeBlueDark">{profiles.Pips?.name || 'Pips'}</span></button>
            </div>
        </div>
    );

    const partnerName = profile === 'Ducky' ? 'Pips' : 'Ducky';
    const pendingRewardCount = (settings.rewards?.requests || []).filter(r => r.from === partnerName && r.status === 'pending').length;
    const pendingIOUCount = ious.filter(i => i.to === profile && i.status === 'pending').length;
    const unassigned = chores.filter(c => !c.assignedTo && !(c.votes && c.votes[profile]));

    const renderContent = () => {
        switch(tab) {
            case 'castle': return <CastleView chores={myChores} completed={completed} events={events} goals={goals} bills={bills} ious={ious} activities={activities} user={profile} settings={castle} profiles={profiles} announcements={announcements} onOpenSettings={() => toggleModal('castle', true)} onOpenMeeting={() => toggleModal('meeting', true)} onOpenHistory={() => toggleModal('history', true)} />;
            case 'list': return <MyListView chores={myChores} onToggle={(c) => act('update', 'chores', c.id, {status: 'completed', completedAt: serverTimestamp(), completedBy: profile})} onDelete={(id) => act('delete', 'chores', id)} user={profile} progress={myCount} threshold={settings.rewards?.choresPerCoupon || DEFAULT_CHORES_PER_COUPON} />;
            case 'assign': return <AssignView chores={unassigned} profile={profile} onVote={(id, dir) => { const a=dir==='left'?'Pips':'Ducky'; const c=chores.find(x=>x.id===id); const o=profile==='Ducky'?'Pips':'Ducky'; if(c && c.votes && c.votes[o]){ if(c.votes[o]===a) act('update','chores',id,{assignedTo:a,votes:{}}); else { alert("Conflict! Discuss this chore."); act('update','chores',id,{votes:{},createdAt:serverTimestamp()}); } } else act('update','chores',id,{[`votes.${profile}`]:a}); }} />;
            case 'budget': return <BudgetView bills={bills} income={income} ious={ious} user={profile} onUpdateIncome={(d) => act('set', 'settings', 'income', {...income, ...d})} onPayBill={(b) => { /* Handle Payment Modal Trigger Logic */ }} onRequestIOU={() => toggleModal('iou', true)} onClearIOU={(id) => act('delete', 'ious', id)} onApproveIOU={(id) => act('update', 'ious', id, {status: 'approved'})} onDeleteIOU={(id) => act('delete', 'ious', id)} />;
            case 'shop': return <ShoppingListView items={shop} onAdd={() => toggleModal('shop', true)} onToggle={(id, c) => act('update', 'shopping', id, { completed: c })} onDelete={(id) => act('delete', 'shopping', id)} onFinishShopping={(total) => { const completedItems = shop.filter(i => i.completed); act('add', 'activities', null, { who: profile, description: `Went shopping ($${total})`, items: completedItems.map(i => i.text) }); completedItems.forEach(i => act('delete', 'shopping', i.id)); setShoppingMode(false); }} isShoppingMode={isShoppingMode} setShoppingMode={setShoppingMode} user={profile} />;
            case 'goals': return <GoalsView goals={goals} user={profile} onUpdate={(id, d) => act('update', 'goals', id, d)} onDelete={(id) => act('delete', 'goals', id)} />;
            case 'calendar': return <CalendarView events={events} user={profile} onAck={(id) => { const e = events.find(x=>x.id===id); if(e) act('update', 'events', id, { acks: {...e.acks, [profile]: true} }); }} onDelete={(id) => act('delete', 'events', id)} />;
            case 'rewards': return <RewardsView coupons={coupons} currentUser={profile} onRedeem={(c) => { if(window.confirm(`Use ${c.title}?`)) act('update', 'coupons', c.id, { isUsed: true }); }} />;
            case 'dates': return <DateNightView history={dates} progress={totalCount} onLog={(d) => act('add', 'datenights', null, d)} resetProgress={(c) => completed.filter(x=>!x.redeemedForDate).sort((a,b)=>(a.completedAt?.seconds||0)-(b.createdAt?.seconds||0)).slice(0,c).forEach(x => act('update', 'chores', x.id, { redeemedForDate: true }))} threshold={settings.rewards?.choresPerDateNight || DEFAULT_CHORES_PER_DATENIGHT} />;
            default: return null;
        }
    };

    const openAddModal = () => {
        if (tab === 'budget') toggleModal('bill', true);
        else if (tab === 'goals') toggleModal('goal', true);
        else if (tab === 'calendar') toggleModal('event', true);
        else if (tab === 'shop') toggleModal('shop', true);
        else toggleModal('chore', true);
    };

    return (
        <div className={`h-[100dvh] w-full flex flex-col font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative fade-in ${myTheme.bg} transition-colors duration-500`}>
             <header className="bg-white/80 backdrop-blur-md p-5 pt-safe-top pb-4 shadow-sm z-10 flex justify-between items-center select-none rounded-b-[2.5rem] sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border-2 border-gray-100">{profiles[profile]?.icon}</div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                            {tab === 'castle' && "Our Kingdom"} 
                            {tab === 'list' && "My Chores"} 
                            {tab === 'assign' && "Assign Tasks"} 
                            {tab === 'dates' && "Date Night"} 
                            {tab === 'calendar' && "Calendar"} 
                            {tab === 'budget' && "Treasury"} 
                            {tab === 'shop' && "Market"} 
                            {tab === 'goals' && "Life Goals"} 
                            {tab === 'rewards' && "Prizes"}
                        </h1>
                        <button onClick={()=>toggleModal('profile', true)} className="text-xs text-gray-400 font-bold hover:text-gray-600 flex items-center gap-1"><Edit3 size={10}/> Customize</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={()=>toggleModal('help', true)} className="p-2 bg-gray-50 rounded-full text-blue-300 hover:text-blue-500 transition-colors"><HelpCircle size={20}/></button>
                    <button onClick={()=>toggleModal('announcement', true)} className="p-2 bg-gray-50 rounded-full text-purple-300 hover:text-purple-500 transition-colors"><Megaphone size={20}/></button>
                    <button onClick={() => {setProfile(null); localStorage.removeItem('ducky_pips_profile');}} className="p-2 bg-gray-50 rounded-full text-gray-300 hover:text-red-400 transition-colors"><LogOut size={20} /></button>
                     {tab !== 'rewards' && tab !== 'dates' && tab !== 'castle' && <button onClick={openAddModal} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-cute hover:scale-110 transition-transform active:scale-90"><Plus size={28} strokeWidth={3}/></button>}
                </div>
            </header>

             <main className="flex-1 overflow-y-auto p-4 pb-40 relative no-scrollbar overscroll-contain">
                {renderContent()}
            </main>

            <div className="fixed bottom-0 left-0 right-0 w-full px-4 pb-6 pt-12 z-40 flex justify-between items-end pointer-events-none safe-area-pb">
                <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-1.5 grid grid-cols-2 gap-1 shadow-xl border-4 border-white pointer-events-auto w-[42%]">
                    <NavButton active={tab === 'dates'} onClick={() => setTab('dates')} icon={<Heart />} label="Dates" />
                    <NavButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<CalendarDays />} label="Plan" />
                    <NavButton active={tab === 'list'} onClick={() => setTab('list')} icon={<CheckCircle />} label="Chores" />
                    <NavButton active={tab === 'assign'} onClick={() => setTab('assign')} icon={<Repeat />} label="Assign" count={unassigned.length} />
                </div>

                <div className="pointer-events-auto -mb-6 mx-2 z-50 transform -translate-y-6">
                    <NavButton active={tab === 'castle'} onClick={() => setTab('castle')} icon={<Crown />} label="Kingdom" prominent={true} />
                </div>

                <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-1.5 grid grid-cols-2 gap-1 shadow-xl border-4 border-white pointer-events-auto w-[42%]">
                    <NavButton active={tab === 'budget'} onClick={() => setTab('budget')} icon={<PiggyBank />} label="Budget" count={pendingIOUCount} />
                    <NavButton active={tab === 'shop'} onClick={() => setTab('shop')} icon={<ShoppingCart />} label="Shop" />
                    <NavButton active={tab === 'goals'} onClick={() => setTab('goals')} icon={<Target />} label="Goals" />
                    <NavButton active={tab === 'rewards'} onClick={() => setTab('rewards')} icon={<Gift />} label="Rewards" count={pendingRewardCount} />
                </div>
            </div>

            {/* Modals placeholders - Implementing simplified versions for brevity in this structure */}
            {modals.chore && <ModalWrapper title="Add Chore" icon={<CheckCircle/>} onClose={() => toggleModal('chore', false)}>
                <form onSubmit={(e: any) => { e.preventDefault(); const t = e.target.title.value; act('add', 'chores', null, { title: t, status: 'pending', assignedTo: profile, createdBy: profile, type: 'regular' }); toggleModal('chore', false); }}>
                    <input name="title" className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold" placeholder="Chore name..." autoFocus />
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-2xl font-bold mt-4">Add</button>
                </form>
            </ModalWrapper>}
            
            {modals.iou && <ModalWrapper title="Borrow Request" icon={<HandCoins/>} onClose={() => toggleModal('iou', false)}>
                 <form onSubmit={(e: any) => { e.preventDefault(); act('add', 'ious', null, { from: profile, to: partnerName, amount: parseFloat(e.target.amount.value), reason: e.target.reason.value, status: 'pending' }); toggleModal('iou', false); }}>
                    <input name="amount" type="number" className="w-full mb-2 bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold" placeholder="Amount $" autoFocus />
                    <input name="reason" className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 font-bold" placeholder="Reason..." />
                    <button type="submit" className="w-full bg-pink-500 text-white py-3 rounded-2xl font-bold mt-4">Ask</button>
                </form>
            </ModalWrapper>}

            {/* Other modals would follow the same pattern or be extracted to separate components in a production environment */}
        </div>
    );
}