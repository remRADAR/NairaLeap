import { useEffect, useState } from "react";

const LAGOS_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Lagos",
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const LAGOS_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Africa/Lagos",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

export function NigeriaDateTime({ className = "" }: { className?: string }) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);
  return (
    <time
      data-testid="editorial-clock"
      aria-label="Current date and time in Nigeria"
      dateTime={currentTime?.toISOString()}
      className={className}
    >
      {currentTime ? (
        <>
          {LAGOS_DATE_FORMATTER.format(currentTime)}
          {" · "}
          {LAGOS_TIME_FORMATTER.format(currentTime)} WAT
        </>
      ) : (
        <span aria-hidden="true">&nbsp;</span>
      )}
    </time>
  );
}
