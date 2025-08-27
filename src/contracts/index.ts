// src/contracts/index.ts

// === Agente / Usuario / Confianza / Reglas ===
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
  contains: string[]; // palabras clave separadas
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

// === Cards / Emails / UI ===
export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  summary280: string; // resumen corto para card
  why: string;        // explicación breve (reglas/razón)
}

export interface Card {
  type: 'email' | 'event' | 'info' | 'error';
  // TODO: definir EventCard si aplica; por ahora EmailSummary | any
  data: EmailSummary | any;
  actions: ('Resumen' | 'Urgente' | 'Agendar' | 'Abrir')[];
  meta: {
    createdAt: string; // ISO
    source: 'gmail' | 'calendar' | 'system';
  };
}

export interface UIState {
  // ← Agregamos 'config' para la Config Page
  view: 'onboarding' | 'main' | 'config';
  list: Card[];
  listFilter: 'all' | 'urgent' | 'today';
  listSort: 'recency' | 'importance';
}

// (Opcional) alias útil
export type UIView = UIState['view'];
