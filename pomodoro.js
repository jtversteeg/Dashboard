// ✅ Destructure React hooks from global React object
const { useState, useEffect } = React;

/**
 * ✅ Pomodoro component
 * - 25-minute timer (1500 seconds)
 * - Start / Pause toggle
 * - Reset button
 */
function Pomodoro() {
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);

  // ✅ Timer logic
  useEffect(() => {
    let timer;

    if (running) {
      timer = setInterval(() => {
        setSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    // Cleanup when paused or component unmounts
    return () => clearInterval(timer);
  }, [running]);

  // ✅ Format time
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return React.createElement(
    'div',
    { style: { textAlign: 'center', width: '100%' } },

    React.createElement('h3', null, 'Pomodoro'),

    React.createElement(
      'div',
      { style: { fontSize: '28px' } },
      `${minutes}:${secs.toString().padStart(2, '0')}`
    ),

    // ✅ Start / Pause
    React.createElement(
      'button',
      { onClick: () => setRunning(!running) },
      running ? 'Pause' : 'Start'
    ),

    // ✅ Reset
    React.createElement(
      'button',
      {
        onClick: () => {
          setSeconds(1500);
          setRunning(false);
        }
      },
      'Reset'
    )
  );
}

/* ✅ Mount React app into panel3 */
ReactDOM.createRoot(document.getElementById("panel3"))
  .render(React.createElement(Pomodoro));
