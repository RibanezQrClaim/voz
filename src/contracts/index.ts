export interface AgentProfile {
  id: string;
  name: string;
  voice: 'a' | 'b' | 'c';
  createdAt: string;
  updatedAt: string;
}

export interface UserContext {
  role: string;
  priorities: [string, string, string];
  timezone: string;
  primaryEmail: string;
}

export interface TrustCircleItem {
  alias: string;
  email: string;
  tags?: string[];
}

export interface UrgencyRule {
  id: string;
  from: string;
  contains: string[];
  level: 'urgent' | 'important' | 'normal';
  active: boolean;
}

export interface PersonalizationState {
  agentProfile: AgentProfile;
  user: UserContext;
  trustCircle: TrustCircleItem[];
  rules: UrgencyRule[];
  isComplete: boolean;
}

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  summary280: string;
  why: string;
}

export interface Card {
  type: 'email' | 'event' | 'info' | 'error';
  // EventCard interface not yet defined
  data: EmailSummary | any;
  actions: ('Resumen' | 'Urgente' | 'Agendar' | 'Abrir')[];
  meta: { createdAt: string; source: 'gmail' | 'calendar' | 'system' };
}

export interface UIState {
  view: 'onboarding' | 'main';
  list: Card[];
  listFilter: 'all' | 'urgent' | 'today';
  listSort: 'recency' | 'importance';
}
