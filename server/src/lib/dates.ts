export function daysBetween(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysUntilBirthday(birthday: Date | null): number | null {
  if (!birthday) return null;
  const today = new Date();
  const next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  next.setHours(0, 0, 0, 0);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (next.getTime() < t.getTime()) next.setFullYear(next.getFullYear() + 1);
  return Math.round((next.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
}
