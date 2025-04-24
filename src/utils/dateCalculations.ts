export function findStartAndEndDateForMonth(month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month
  return { startDate, endDate };
}

export function findStartAndEndDateForYear(year:number){
  const startDate = new Date(year, 0, 1); // January 1st of the year
  const endDate = new Date(year + 1, 0, 0); // December 31st of the year
  return { startDate, endDate };
}