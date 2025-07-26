
/**
 * Funciton to filter events in a week
 * @param events - list with the events to filter
 * @param currentDate - date used to get the week and filter the data
 * @returns filteredEvents within the week
 */
export function filterDates(events, currentDate) {
    const date = new Date(currentDate);
    const actualDay = date.getDay();
    const millisPerDay = 24 * 60 * 60 * 1000;

    const monday = new Date(date.getTime() - ((actualDay === 0 ? 6 : actualDay - 1) * millisPerDay));
    monday.setHours(0,0,0,0);

    const sunday = new Date(date.getTime() + ((actualDay === 0 ? 0 : 7 - actualDay) * millisPerDay));
    sunday.setHours(23,59,59,999);

    const filteredEvents = events.filter(event => {
        /* if(event.repetition == "semanal"){ //TODO revisar si esta parte funciona correctamente
            return true;
        } */

        const eventDate = new Date(event.date);
        return eventDate >= monday && eventDate <= sunday;
    });

    return filteredEvents;
}

/**
 * Function to filter events in the current month
 * @param events - list with the events to filter
 * @param currentDate - date used to get the month and filter the data
 * @returns filteredEvents within the month
 */
export function filterDatesByMonth(events, currentDate) {
    const date = new Date(currentDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    // Get the first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Get the last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0); // 0 means the last day of the previous month
    lastDayOfMonth.setHours(23, 59, 59, 999);
    
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
    });
    return filteredEvents;
}