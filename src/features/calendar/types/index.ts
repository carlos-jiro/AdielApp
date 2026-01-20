// Calendar event data structure

export interface ActivityEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  created_by?: string;
  updated_by?: string;
  resource: { 
    location: string; 
    description: string;
  };
}

// AddEventModal form data structure

export interface EventFormData {
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string;
  endTime: string;
  location: string;
  description: string;
  color: string;
}

export const PRESET_COLORS = [
  { hex: '#2dd4bf', label: 'Sistema' },
  { hex: '#ef4444', label: 'Urgente' },
  { hex: '#3b82f6', label: 'Trabajo' },
  { hex: '#f59e0b', label: 'Atención' },
  { hex: '#8b5cf6', label: 'Especial' }
];