export function findStartAndEndDateForMonth(month: number, year: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // Last moment of month
  return { startDate: startDate, endDate: endDate };
}

export function findStartAndEndDateForYear(year:number){
  const startDate = new Date(Date.UTC(year, 0, 1));           // Jan 1 UTC
  // const endDate = new Date(Date.UTC(year, 11, 31));           // Dec 31 UTC
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  return {
    startDate, endDate
  };
}