import React, { FunctionComponent, CSSProperties } from 'react';
import { ColorInput } from 'tinycolor2';
import { Day } from 'date-fns';
import { Props as ActivityCalendarProps, Theme as CalendarTheme } from 'react-activity-calendar';

import { Year } from './types';

export interface Props extends Omit<ActivityCalendarProps, 'data'> {
  username: string;
  year?: Year;
}

export type Theme = CalendarTheme;

declare const GitHubCalendar: FunctionComponent<Props>;

export { createCalendarTheme };
export default GitHubCalendar;
