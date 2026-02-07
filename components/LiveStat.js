import { useState, useEffect } from 'react';

export default function LiveStat({ value = 0, duration = 1200, format = (v) => v }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const stepTime = Math.max(Math.floor(duration / Math.max(end, 1)), 8);
    const totalSteps = Math.ceil(duration / stepTime);
    let step = 0;
    const counter = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const current = Math.floor(end * progress);
      if (progress >= 1) {
        setDisplay(end);
        clearInterval(counter);
      } else {
        setDisplay(current);
      }
    }, stepTime);

    return () => clearInterval(counter);
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
