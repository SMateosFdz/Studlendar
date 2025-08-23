export function getCurrentDate() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const dayOfWeek = currentDate.getDay();
  return { month, hours, minutes, seconds, dayOfWeek};
}

/**
 * Function to get some of the values of a specific date
 * 
 * @param {Date} date 
 * @returns year, month, day, hours, minutes, seconds and day of week
 */
export function getDateValues(date){
  if(date.slice(-1) === "Z"){
    date = date.substring(0, date.length - 1);
    date = date + "+02:00";
  }
  const currentDate = new Date(date);
  const month = currentDate.getMonth() + 1;
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  let dayOfWeek = currentDate.getDay();
  let day = currentDate.getDate();
  const year = currentDate.getFullYear();
  if(dayOfWeek == 0){
    dayOfWeek = 7;
  }
  return { year, month, day, hours, minutes, seconds, dayOfWeek};
}

/**
 * Function to parse a date in ICS format to a date string
 * 
 * @param {Date} icsDate date in ICS format
 * @returns date string
 */
export function parseDate(icsDate) {
  const part1 = +icsDate.slice(0, 4);
  const part2 = +icsDate.slice(4, 6);
  const part3 = +icsDate.slice(6, 8);
  const part4 = +icsDate.slice(9, 11);
  const part5 = +icsDate.slice(11, 13);

  const dateString = new Date(part1, part2, part3, part4, part5);

  return dateString;
}

/**
 * Function to get the current month days and dates of a specific date
 * 
 * Example: 06/08/2025 returns [[4,5,6,...,10], [04/08/2025,...,10/08/2025]]
 * 
 * @param {Date} currentDate 
 * @returns List of two lists with the month days and dates
 */
export function getDaysOfWeek(currentDate){
  const date = new Date(currentDate);
  const dayOfWeek = (date.getDay() + 6) % 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  const monthNumbers = [];
  const datesOfWeek = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    datesOfWeek.push(currentDay.toISOString());
    const monthNumber = currentDay.getDate();
    monthNumbers.push(monthNumber);
  }
    
  return [monthNumbers, datesOfWeek];
}

/**
 * Function to get the current week number of the year
 * @param {Date} currentDate 
 * @returns week number of the year
 */
export function getWeekNumber(currentDate){
  const week = new Date(currentDate);
  week.setDate(week.getDate() + 4 - (week.getDay() || 7));
  const yearStart = new Date(week.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((week - yearStart) / 86400000) + 1) / 7);

  return weekNumber;
}