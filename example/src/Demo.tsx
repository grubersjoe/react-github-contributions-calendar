import React, { useState, FunctionComponent, FormEventHandler } from 'react';
import GitHubCalendar from 'react-github-calendar';
import ReactTooltip from 'react-tooltip';

import 'typeface-public-sans';
import './Demo.css';

import CodeBlock from './CodeBlock';
import ForkMe from './ForkMe';

const Demo: FunctionComponent = () => {
  const [username, setUsername] = useState('grubersjoe');
  const input = React.createRef<HTMLInputElement>();

  const updateUsername: FormEventHandler = event => {
    event.preventDefault();
    if (input.current) {
      setUsername(String(input.current.value).trim().toLowerCase());
    }
  };

  return (
    <div>
      <header>
        <ForkMe />
        <div className="container">
          <h1>GitHub Contributions Calendar</h1>
          <div>A React component to display a GitHub contributions calendar </div>
          <form onSubmit={updateUsername}>
            <input
              type="text"
              placeholder="Enter your GitHub username"
              name="name"
              autoComplete="on"
              ref={input}
              required
            />
            <button type="submit">Show calendar</button>
          </form>
        </div>
      </header>

      <main className="container">
        <section>
          <iframe
            src="https://ghbtns.com/github-btn.html?user=grubersjoe&repo=react-github-calendar&type=star&count=true&size=large"
            frameBorder="0"
            scrolling="0"
            width="170"
            height="30"
            title="GitHub"
          />

          <h4 style={{ fontWeight: 'normal', margin: '1em 0 0.75em' }}>
            <a href={`https://github.com/${username}`} style={{ textDecoration: 'none' }}>
              @{username}
            </a>{' '}
            on GitHub
          </h4>

          <GitHubCalendar username={username} showWeekdayLabels>
            <ReactTooltip delayShow={50} html />
          </GitHubCalendar>

          <p>
            Made with love by <a href="https://jogruber.de">@grubersjoe</a>
          </p>
        </section>

        <section>
          <h2>Installation</h2>
          <CodeBlock style={{ marginTop: '0.5rem' }}>yarn install react-github-calendar</CodeBlock>
          <p>Then in your code:</p>
          <CodeBlock>
            {`import GitHubCalendar from 'react-github-calendar';

<GitHubCalendar username="${username}" />`}
          </CodeBlock>
        </section>

        <section>
          <h2>Upgrading from v2 to v3</h2>
          <p>
            With Version 3 lots of code has been rewritten and refactored, the contribution data is
            fetched more efficiently and most importantly: the calendar itself has been extracted to
            an agnostic, independent React component that can be used to display all kinds of
            calendar intensity data:{' '}
            <a href="https://grubersjoe.github.io/react-activity-calendar/?path=/docs/activity-calendar--default">
              <em>React Activity Calendar</em>
            </a>
            .
          </p>
          <h3>New</h3>
          <ul>
            <li>
              There is a new <code>weekStart</code> property that allows you to specify what day
              should be taken as start of a week (one column in the calendar). By default Sunday is
              used like on GitHub. Note that days are zero indexed (0 represents Sunday).
            </li>
            <li>
              Weekday labels have been added left of the calendar, showing which day of the week the
              rows correspond to. This legend is <b>hidden by default</b> and can be enabled by
              setting the <code>showDayLegend</code> property.
            </li>
            <li>
              There is a new color legend below the calendar. You can hide it by passing the{' '}
              <code>hideColorLegend</code> property.
            </li>
            <li>
              The overall design of the calendar has changed slightly. You can use CSS to style or
              overwrite elements if you do not like the look.
            </li>
          </ul>
          <h3>Breaking changes</h3>
          <ul>
            <li>
              <p>
                The <code>fullYear</code> property has been removed. Render the calendar for the
                current year for the same effect:
              </p>
              <CodeBlock>{`<GitHubCalendar username="${username}" year={new Date().getFullYear()} />`}</CodeBlock>
            </li>
            <li>
              The property names of the <code>Theme</code> object have changed. Also it no longer
              contains a <code>background</code> and <code>text</code> property. Use CSS to set the
              colors explicitly if desired.
            </li>
            <li>
              Because the calendar is a different component now, all elements have different class
              names now. Sorry.
            </li>
          </ul>
        </section>

        <section>
          <h2>Component properties</h2>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>username</td>
                  <td>string</td>
                  <td />
                  <td>
                    A GitHub username (<em>required, obviously</em>).
                  </td>
                </tr>
                <tr>
                  <td>year</td>
                  <td>number|'last'</td>
                  <td>'last'</td>
                  <td>To be rendered year. Defaults to the last year like on GitHub.</td>
                </tr>
                <tr>
                  <td>blockMargin</td>
                  <td>number</td>
                  <td>4</td>
                  <td>Margin between blocks in pixels.</td>
                </tr>
                <tr>
                  <td>blockRadius</td>
                  <td>number</td>
                  <td>2</td>
                  <td>Border radius of blocks in pixels.</td>
                </tr>
                <tr>
                  <td>blockSize</td>
                  <td>number</td>
                  <td>12</td>
                  <td>Size of one block (one day) in pixels.</td>
                </tr>
                <tr>
                  <td>color</td>
                  <td>
                    string|<a href="https://www.npmjs.com/package/tinycolor2">Color</a>
                  </td>
                  <td />
                  <td>
                    Base color to compute graph intensity hues (darkest color). Any valid CSS color
                    is accepted. Note that the <code>theme</code> property has higher precedence.
                  </td>
                </tr>
                <tr>
                  <td>dateFormat</td>
                  <td>string</td>
                  <td>'MMM d, yyyy'</td>
                  <td>
                    A{' '}
                    <a href="https://date-fns.org/docs/format">
                      <code>date-fns/format</code>
                    </a>{' '}
                    compatible date string used in tooltips.
                  </td>
                </tr>
                <tr>
                  <td>fontSize</td>
                  <td>number</td>
                  <td>14</td>
                  <td>Font size for text in pixels.</td>
                </tr>
                <tr>
                  <td>hideColorLegend</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Toggle to hide color legend below calendar.</td>
                </tr>
                <tr>
                  <td>hideMonthLabels</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Toggle to hide month labels above calendar.</td>
                </tr>
                <tr>
                  <td>hideTotalCount</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Toggle to hide total count below calendar.</td>
                </tr>
                <tr>
                  <td>showWeekdayLabels</td>
                  <td>boolean</td>
                  <td>false</td>
                  <td>Toggle to show weekday labels left to the calendar.</td>
                </tr>
                <tr>
                  <td>theme</td>
                  <td>Theme</td>
                  <td>GitHub theme</td>
                  <td>An object specifying all theme colors explicitly.</td>
                </tr>
                <tr>
                  <td>weekStart</td>
                  <td>number</td>
                  <td>0 (Sunday)</td>
                  <td>Index of day to be used as start of week. 0 represents Sunday.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2>Examples</h2>
          <p>
            Please refer to the{' '}
            <a href="https://grubersjoe.github.io/react-activity-calendar">Storybook</a> of the used
            calendar component <code>react-activity-calendar</code> for interactive examples.
          </p>
        </section>

        <p style={{ marginTop: '4rem' }}>
          <button onClick={() => window.scroll({ top: 0, behavior: 'smooth' })}>Back to top</button>
        </p>
      </main>
    </div>
  );
};

export default Demo;
