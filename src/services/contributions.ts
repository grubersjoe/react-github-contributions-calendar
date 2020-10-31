// Import modules separately to reduce bundle size
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import getMonth from 'date-fns/getMonth';
import isAfter from 'date-fns/isAfter';
import isSameYear from 'date-fns/isSameYear';
import parseISO from 'date-fns/parseISO';
import setDay from 'date-fns/setDay';
import subYears from 'date-fns/subYears';

const API_URL = 'https://github-calendar.now.sh/v1/';
const DATE_FORMAT = 'yyyy-MM-dd';

export type GraphData = {
  year: number;
  blocks: Block[][];
  monthLabels: { x: number; label: string }[];
  totalCount: number;
};

export type Block = {
  date: string;
  info?: {
    date: string;
    count: number;
    color: string;
    intensity: number;
  };
};

export type MonthLabels = {
  x: number;
  label: string;
}[];

export type RequestOptions = {
  fullYear: boolean;
  username: string;
  years: number[];
};

type ApiResult = {
  years: {
    year: string;
    total: number;
    range: {
      start: string;
      end: string;
    };
  }[];
  contributions: {
    date: string;
    count: number;
    color: string;
    intensity: number;
  }[];
};

function getContributionsForDate(data: ApiResult, date: string) {
  return data.contributions.find(contrib => contrib.date === date);
}

function getContributionCountForLastYear(data: ApiResult) {
  const { contributions } = data;
  const now = new Date();

  // Start date for accumulating the values
  const begin = contributions.findIndex(contrib => contrib.date === format(now, DATE_FORMAT));

  // No data for today given
  if (begin === -1) {
    return 0;
  }

  // Check if there is data for the day one year past
  let end = contributions.findIndex(contrib => {
    return contrib.date === format(subYears(now, 1), DATE_FORMAT);
  });

  // Take the oldest contribution otherwise, if not enough data exists
  if (end === -1) {
    end = contributions.length - 1;
  }

  return contributions.slice(begin, end).reduce((acc, contrib) => acc + contrib.count, 0);
}

function getContributionCountForYear(data: ApiResult, year: number) {
  const yearEntry = data.years.find(entry => entry.year === String(year));

  return yearEntry ? yearEntry.total : 0;
}

function getBlocksForYear(year: number, data: ApiResult, fullYear: boolean) {
  const now = new Date();
  const firstDate = fullYear ? subYears(now, 1) : parseISO(`${year}-01-01`);
  const lastDate = fullYear ? now : parseISO(`${year}-12-31`);

  let weekStart = firstDate;

  // The week starts on Sunday - add days to get to next sunday if neccessary
  if (getDay(firstDate) !== 0) {
    weekStart = addDays(firstDate, getDay(firstDate));
  }

  // Fetch graph data for first row (Sundays)
  const firstRowDates = [];
  while (weekStart <= lastDate) {
    const date = format(weekStart, DATE_FORMAT);

    firstRowDates.push({
      date,
      info: getContributionsForDate(data, date),
    });

    weekStart = setDay(weekStart, 7);
  }

  // Add the remainig days per week (column for column)
  return firstRowDates.map(dateObj => {
    const dates = [];
    for (let i = 0; i <= 6; i += 1) {
      const date = format(setDay(parseISO(dateObj.date), i), DATE_FORMAT);

      if (isAfter(parseISO(date), lastDate)) {
        break;
      }

      dates.push({
        date,
        info: getContributionsForDate(data, date),
      });
    }

    return dates;
  });
}

function getMonthLabels(blocks: GraphData['blocks'], fullYear: boolean): MonthLabels {
  const weeks = blocks.slice(0, fullYear ? blocks.length - 1 : blocks.length);
  let previousMonth = 0; // January

  return weeks.reduce<MonthLabels>((labels, week, x) => {
    const firstWeekDay = parseISO(week[0].date);
    const month = getMonth(firstWeekDay) + 1;
    const monthChanged = month !== previousMonth;
    const firstMonthIsDecember = x === 0 && month === 12;

    if (monthChanged && !firstMonthIsDecember) {
      labels.push({
        x,
        label: format(firstWeekDay, 'MMM'),
      });
      previousMonth = month;
    }

    return labels;
  }, []);
}

function getGraphDataForYear(year: number, data: ApiResult, fullYear: boolean): GraphData {
  const blocks = getBlocksForYear(year, data, fullYear);
  const monthLabels = getMonthLabels(blocks, fullYear);
  const totalCount = fullYear
    ? getContributionCountForLastYear(data)
    : getContributionCountForYear(data, year);

  return {
    year,
    blocks,
    monthLabels,
    totalCount,
  };
}

export async function getGitHubGraphData(options: RequestOptions): Promise<GraphData[]> {
  const { fullYear, username, years } = options;

  const data: ApiResult = await fetch(API_URL + username).then(response => {
    if (response.ok) {
      return response.json();
    } else {
      return response.json().then(response => {
        throw new Error(response.error);
      });
    }
  });

  if (data.years.length === 0) {
    return [];
  }

  return years.map(year => {
    const isCurrentYear = isSameYear(parseISO(String(year)), new Date());

    return getGraphDataForYear(year, data, isCurrentYear && fullYear);
  });
}
