export function parseICS(icsContent) {
  const events = [];
  const lines = icsContent.split(/\r?\n/);
  let currentEvent = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent) {

        events.push({
          name: currentEvent.SUMMARY || 'Untitled Event',
          start: currentEvent.DTSTART ?transformICSDates(currentEvent.DTSTART) : null,
          end: currentEvent.DTEND ? transformICSDates(currentEvent.DTEND) : null,
          duration: getHoursDiffIfSameDay(transformICSDates(currentEvent.DTSTART), transformICSDates(currentEvent.DTEND)) || 0,
        });
        currentEvent = null;
      }
    } else if (currentEvent) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':');
      
      // Handle multi-line values and parameters
      if (key.includes(';')) {
        const [realKey] = key.split(';');
        currentEvent[realKey] = value;
      } else {
        currentEvent[key] = value;
      }
    }
  }

  return events;
}

function transformICSDates(icsDateString) {
  // Handle date format: YYYYMMDD or YYYYMMDDTHHMMSS (UTC)
  if (!icsDateString) return null;
  
  // Remove any timezone suffix if present
  const cleanDateString = icsDateString.replace(/Z$/, '');
  
  // Parse the components
  const year = cleanDateString.substring(0, 4);
  const month = cleanDateString.substring(4, 6) - 1; // JS months are 0-indexed
  const day = cleanDateString.substring(6, 8);
  
  // Check if time is included (format YYYYMMDDTHHMMSS)
  if (cleanDateString.includes('T')) {
    const timePart = cleanDateString.split('T')[1];
    const hours = timePart.substring(0, 2);
    const minutes = timePart.substring(2, 4);
    const seconds = timePart.substring(4, 6);
    
    return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
  }
  
  // Date-only format (YYYYMMDD)
  return new Date(Date.UTC(year, month, day));
}

function getHoursDiffIfSameDay(startDate, endDate) {
  if (!startDate || !endDate) return null;
  
  // Check if same day (ignoring time components)
  const isSameDay = 
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  if (!isSameDay) return null;

  // Calculate difference in milliseconds and convert to hours
  const diffMs = endDate - startDate;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  // Round to 2 decimal places for precision
  return Math.round(diffHours * 100) / 100;
}


