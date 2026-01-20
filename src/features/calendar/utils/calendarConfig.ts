import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { dateFnsLocalizer } from 'react-big-calendar';
import type { ActivityEvent } from '../types';

const locales = { 'es': es };

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const eventStyleGetter = (event: ActivityEvent) => ({
  style: { 
    backgroundColor: event.color,
    borderRadius: '6px',
    color: 'white',
    border: '0px',
    display: 'block',
    padding: '2px 0px', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    margin: '2px 0px' 
  } 
});