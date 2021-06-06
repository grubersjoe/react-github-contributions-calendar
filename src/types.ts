import { Day } from 'react-activity-calendar';

export type Year = number | 'last';

export interface ApiResponse {
  total: {
    [year: number]: number;
    [year: string]: number; // 'lastYear;
  };
  contributions: Array<Day>;
}
