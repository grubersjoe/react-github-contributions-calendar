import React, { useState, CSSProperties, useEffect, useCallback } from 'react';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import getYear from 'date-fns/getYear';
import { ColorInput } from 'tinycolor2';

import styles from './styles.css';

import {
  DEFAULT_THEME,
  LINE_HEIGHT,
  MIN_DISTANCE_MONTH_LABELS,
  NAMESPACE,
  Theme,
} from '../../utils/constants';
import { usePrevious } from '../../hooks/usePrevious';
import { getGitHubGraphData, GraphData, Block } from '../../services/contributions';
import { createCalendarTheme, getClassName } from '../../utils';

export type Props = {
  username: string;
  blockMargin?: number;
  blockSize?: number;
  color?: ColorInput;
  dateFormat?: string;
  fontSize?: number;
  fullYear?: boolean;
  showTotalCount?: boolean;
  style?: CSSProperties;
  theme?: Theme;
  years?: number[];
};

const GitHubCalendar: React.FC<Props> = ({
  username,
  blockMargin = 2,
  blockSize = 12,
  children,
  color = undefined,
  dateFormat = 'MMM d, yyyy',
  fontSize = 14,
  fullYear = true,
  showTotalCount = true,
  style = {},
  theme = undefined,
  years = [Number(format(new Date(), 'yyyy'))],
}) => {
  const [graphs, setGraphs] = useState<GraphData[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const prevYears = usePrevious(years);
  const prevUsername = usePrevious(username);
  const prevFullYear = usePrevious(fullYear);

  const fetchData = useCallback(() => {
    setError(null);
    getGitHubGraphData({
      years,
      username,
      fullYear,
    })
      .then(setGraphs)
      .catch(setError);
  }, [years, username, fullYear]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line

  // Refetch if relevant props change
  useEffect(() => {
    if (
      prevFullYear !== fullYear ||
      prevUsername !== username ||
      prevYears.some(y => !years.includes(y))
    ) {
      fetchData();
    }
  }, [fetchData, fullYear, prevFullYear, prevUsername, prevYears, username, years]);

  function getTheme(): Theme {
    if (theme) {
      return Object.assign({}, DEFAULT_THEME, theme);
    }

    if (color) {
      return createCalendarTheme(color);
    }

    return DEFAULT_THEME;
  }

  function getDimensions() {
    const textHeight = Math.round(fontSize * LINE_HEIGHT);

    // Since weeks start on Sunday, there is a good chance that the graph starts
    // in the week before January 1st. Therefore, the calendar shows 53 weeks.
    const width = (52 + 1) * (blockSize + blockMargin) - blockMargin;
    const height = textHeight + (blockSize + blockMargin) * 7 - blockMargin;

    return { width, height };
  }

  function getTooltipMessage(day: Required<Block>) {
    const date = parseISO(day.date);
    return `<strong>${day.info.count} contributions</strong> on ${format(date, dateFormat)}`;
  }

  function renderMonthLabels(monthLabels: GraphData['monthLabels']) {
    const style = {
      fill: getTheme().text,
      fontSize,
    };

    // Remove the first month label if there's not enough space to the next one
    // (end of previous month)
    if (monthLabels[1].x - monthLabels[0].x <= MIN_DISTANCE_MONTH_LABELS) {
      monthLabels.shift();
    }

    return monthLabels.map(month => (
      <text x={(blockSize + blockMargin) * month.x} y={fontSize} key={month.x} style={style}>
        {month.label}
      </text>
    ));
  }

  function renderBlocks(blocks: GraphData['blocks']) {
    const theme = getTheme();
    const textHeight = Math.round(fontSize * LINE_HEIGHT);

    return blocks
      .map(week =>
        week.map((day, y) => (
          <rect
            x="0"
            y={textHeight + (blockSize + blockMargin) * y}
            width={blockSize}
            height={blockSize}
            fill={theme[`grade${day.info ? day.info.intensity : 0}`]}
            data-tip={day.info ? getTooltipMessage(day as Required<Block>) : null}
            key={day.date}
          />
        )),
      )
      .map((week, x) => (
        <g key={x} transform={`translate(${(blockSize + blockMargin) * x}, 0)`}>
          {week}
        </g>
      ));
  }

  function renderTotalCount(year: number, totalCount: number) {
    const isCurrentYear = getYear(new Date()) === year;

    return (
      <div className={getClassName('meta')} style={{ fontSize }}>
        {isCurrentYear && fullYear ? 'Last year' : year}
        {' – '}
        {isCurrentYear && !fullYear ? 'So far ' : null}
        {totalCount} contributions
      </div>
    );
  }

  const { width, height } = getDimensions();

  if (error) {
    return (
      <p style={{ lineHeight: 1.1, color: 'red' }}>
        <small>{error.message}</small>
      </p>
    );
  }

  if (!graphs) {
    return <div className={getClassName('loading', styles.loading)}>Loading …</div>;
  }

  return (
    <article className={NAMESPACE} style={style}>
      {graphs.length === 0 && <p>No data :(</p>}
      {graphs.map(graph => {
        const { year, blocks, monthLabels, totalCount } = graph;

        return (
          <div key={year} className={getClassName('chart', styles.chart)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className={getClassName('calendar', styles.calendar)}
              style={{ backgroundColor: theme?.background }}
            >
              {renderMonthLabels(monthLabels)}
              {renderBlocks(blocks)}
            </svg>

            {showTotalCount && renderTotalCount(year, totalCount)}
            {children}
          </div>
        );
      })}
    </article>
  );
};

export default GitHubCalendar;
