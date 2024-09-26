export function dateToISO(value: Date) {
  const bruteDate = new Date(value);
  return bruteDate.toISOString();
}

export function isoToDate(value: string) {
  const bruteDate = new Date(value);
  return bruteDate;
}
