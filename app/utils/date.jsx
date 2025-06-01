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