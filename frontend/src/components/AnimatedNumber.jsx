import { useEffect, useState } from "react";

const AnimatedNumber = ({ value, duration = 1000, formatFn = (n) => n }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = parseFloat(value) || 0;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return <span>{formatFn(displayValue)}</span>;
};

export default AnimatedNumber;
