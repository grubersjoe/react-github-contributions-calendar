// Import modules separately to reduce bundle size
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import getMonth from 'date-fns/getMonth';
import isAfter from 'date-fns/isAfter';
import setDay from 'date-fns/setDay';
import subYears from 'date-fns/subYears';

const API_URL = 'http://localhost:8080/v1/';
const DATE_FORMAT = 'yyyy-MM-dd';

export type CalendarData = {
  year: number;
  total?: number;
  blocks: (Block | undefined)[][];
  monthLabels?: MonthLabel[];
};

export type Block = {
  date: string;
  count: number;
  intensity: number;
};

export type MonthLabel = {
  x: number;
  label: string;
};

type RequestOptions = {
  username: string;
  years?: number[];
  fullYear?: boolean;
};

type ApiResponse = {
  years: {
    [year: string]: {
      year: number;
      total: number;
    };
  };
  contributions: Block[];
};

function getContributionsForDate(data: ApiResponse, date: string) {
  return data.contributions.find(contrib => contrib.date === date);
}

function getBlocksForYear(year: number, data: ApiResponse, fullYear?: boolean): Block[][] {
  const now = new Date();
  const firstDate = fullYear ? subYears(now, 1) : new Date(`${year}-01-01`);
  const lastDate = fullYear ? now : new Date(`${year}-12-31`);

  let weekStart = firstDate;

  // The week starts on Sunday - add days to get to next sunday if neccessary
  if (getDay(firstDate) !== 0) {
    weekStart = addDays(firstDate, getDay(firstDate));
  }

  // Fetch graph data for first row (Sundays)
  const firstRowDates: Block[] = [];
  while (weekStart <= lastDate) {
    const date = format(weekStart, DATE_FORMAT);
    firstRowDates.push(getContributionsForDate(data, date) as Block);
    weekStart = setDay(weekStart, 7);
  }

  // Add the remainig days per week (column for column)
  return firstRowDates.map(block => {
    const dates = [];
    for (let i = 0; i <= 6; i++) {
      const date = format(setDay(new Date(block.date), i), DATE_FORMAT);

      if (isAfter(new Date(date), lastDate)) {
        break;
      }

      dates.push(getContributionsForDate(data, date) as Block);
    }

    return dates;
  });
}

function getMonthLabels(blocks: CalendarData['blocks'], fullYear: boolean): MonthLabel[] {
  const weeks = blocks.slice(0, fullYear ? blocks.length - 1 : blocks.length);
  let previousMonth = 0; // January

  return weeks.reduce<MonthLabel[]>((labels, week, index) => {
    const firstWeekDay = new Date(week.find(block => block === undefined).date);
    const month = getMonth(firstWeekDay) + 1;
    const monthChanged = month !== previousMonth;
    const firstMonthIsDecember = index === 0 && month === 12;

    if (monthChanged && !firstMonthIsDecember) {
      labels.push({
        x: index,
        label: format(firstWeekDay, 'MMM'),
      });
      previousMonth = month;
    }

    return labels;
  }, []);
}

function getCalendarDataForYear(year: number, data: ApiResponse, fullYear?: boolean): CalendarData {
  const blocks = getBlocksForYear(year, data, fullYear);
  // const monthLabels = getMonthLabels(blocks, fullYear);
  const total = (fullYear ? data.lastYear?.total : data[year]?.total) ?? 0;

  return {
    year,
    blocks,
    // monthLabels,
    total,
  };
}

export async function getCalendarData(options: RequestOptions): Promise<CalendarData[]> {
  const { fullYear, username, years } = options;
  const currentYear = new Date().getFullYear();

  const params = new URLSearchParams({
    ...(fullYear && { fullYear: 'true' }),
  });

  if (years) {
    years.forEach(y => params.append('y', String(y)));
  }

  const data: ApiResponse = await fetch(`${API_URL}${username}?${params}`).then(resp =>
    resp.ok
      ? resp.json()
      : resp.json().then(response => {
          throw new Error(response.error);
        }),
  );

  if (data.contributions.length === 0) {
    return [];
  }

  if (fullYear) {
    return [getCalendarDataForYear(currentYear, data, true)];
  }

  return Object.values(data.years).map(({ year }) => getCalendarDataForYear(year, data));
}
