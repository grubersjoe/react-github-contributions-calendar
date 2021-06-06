import React, { useState, useEffect, useCallback, FunctionComponent } from 'react';
import ActivityCalendar, { Props as CalendarProps, CalendarData } from 'react-activity-calendar';

import { API_URL, DEFAULT_THEME } from './constants';
import { Year, ApiResponse } from './types';

interface Props extends Omit<CalendarProps, 'data'> {
  username: string;
  year?: Year;
}

async function fetchCalendarData(username: string, year: Year): Promise<ApiResponse> {
  return (await fetch(`${API_URL}${username}?y=${year}`)).json();
}

const GitHubCalendar: FunctionComponent<Props> = ({
  username,
  year = 'last',
  theme = DEFAULT_THEME,
  ...calendarProps
}) => {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchCalendarData(username, year)
      .then(({ contributions }) => setData(contributions))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [username, year]);

  useEffect(fetchData, []); // on mount
  useEffect(fetchData, [username, year]);

  if (error) {
    return <p>Error :(</p>;
  }

  if (loading || !data) {
    // TODO: show skeleton
    return <ActivityCalendar data={[]} theme={theme} loading />;
  }

  return <ActivityCalendar data={data} theme={theme} {...calendarProps} />;
};

export default GitHubCalendar;
