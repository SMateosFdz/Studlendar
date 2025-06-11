export function getCurrentDate() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const dayOfWeek = currentDate.getDay();
  return { month, hours, minutes, seconds, dayOfWeek};
}

export function getDateValues(date){
  if(date.slice(-1) === "Z"){
    date = date.substring(0, date.length - 1);
    date = date + "-02:00";
  }
  const currentDate = new Date(date);
  const month = currentDate.getMonth() + 1;
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  let dayOfWeek = currentDate.getDay();
  const year = currentDate.getFullYear();
  if(dayOfWeek == 0){
    dayOfWeek = 7;
  }
  return { year, month, hours, minutes, seconds, dayOfWeek};
}

export function parseDate(icsDate) {
  const part1 = +icsDate.slice(0, 4);
  const part2 = +icsDate.slice(4, 6);
  const part3 = +icsDate.slice(6, 8);
  const part4 = +icsDate.slice(9, 11);
  const part5 = +icsDate.slice(11, 13);

  const dateString = new Date(part1, part2, part3, part4, part5);

  return dateString;
}

export function getDaysOfWeek(currentDate){
  const date = new Date(currentDate);
  const dayOfWeek = (date.getDay() + 6) % 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek);
  const monthNumbers = [];

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const monthNumber = currentDay.getDate();
    monthNumbers.push(monthNumber);
  }
    
  return monthNumbers;
}