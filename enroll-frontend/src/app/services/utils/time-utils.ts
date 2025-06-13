export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return hrs > 0
    ? `${padZero(hrs)}:${padZero(mins)}:${padZero(secs)}`
    : `${padZero(mins)}:${padZero(secs)}`;
}

export function padZero(value: number): string {
  return value < 10 ? `0${value}` : value.toString();
}
