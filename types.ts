export type UserType = 'Ducky' | 'Pips' | null;

export interface Profile {
  name: string;
  icon: string;
  theme: string;
}

export interface Chore {
  id: string;
  title: string;
  assignedTo: string;
  status: 'pending' | 'completed';
  isPrettyPlease?: boolean;
  type: 'regular' | 'whim' | 'habit';
  frequency?: string;
  dueDate?: string;
  completedAt?: { seconds: number };
  completedBy?: string;
  createdAt?: { seconds: number };
  redeemedForCoupon?: boolean;
  redeemedForDate?: boolean;
  goalId?: string;
  votes?: Record<string, string>;
}

export interface Goal {
  id: string;
  title: string;
  financialTarget: number;
  savedAmount: number;
  completed?: boolean;
  timeframe: string;
  type: 'personal' | 'shared';
  owner: string;
  habits: { id: number; text: string; frequency: string }[];
  tasks: { id: number; text: string; completed: boolean }[];
  contributions: { who: string; amount: number; date: string }[];
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  totalPaid: number;
  frequency: string;
  date: string;
  payments: { who: string; amount: number; date: string }[];
}

export interface IOU {
  id: string;
  from: string;
  to: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved';
}

export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'normal' | 'treat';
  owner?: string;
}

export interface KingdomEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'personal' | 'shared';
  duration: string;
  durationUnit: string;
  owner: string;
  acks?: Record<string, boolean>;
}

export interface Coupon {
  id: string;
  title: string;
  owner: string;
  isUsed: boolean;
}

export interface DateNightLog {
  id: string;
  vibe: string;
  activity: string;
  food: string;
  place: string;
  date: string;
  review?: string;
  photo?: string;
  createdAt?: { seconds: number };
}

export interface Announcement {
  id: string;
  message: string;
  from: string;
  active: boolean;
  createdAt?: { seconds: number };
}

export interface Activity {
  id: string;
  who: string;
  description: string;
  items?: string[];
  createdAt?: { seconds: number };
}

export interface Settings {
  castle?: {
    name: string;
    kingdomFlag: string;
    duckyFlag: string;
    pipsFlag: string;
  };
  income?: {
    ducky: number;
    pips: number;
  };
  rewards?: {
    choresPerCoupon: number;
    choresPerDateNight: number;
    pools: Record<string, string[]>;
    requests: { id: number; from: string; item: string; status: string }[];
  };
  profiles?: {
    Ducky: Profile;
    Pips: Profile;
  };
}
