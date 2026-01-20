import type { EventProps } from 'react-big-calendar';
import type { ActivityEvent } from '../types';

export const CustomEventContent = ({ event }: EventProps<ActivityEvent>) => (
  <div className="pl-3 pt-1 pb-1 pr-1 text-sm font-semibold truncate leading-tight">
    {event.title}
  </div>
);