export function filterDates(events, currentDate) {
    const date = new Date(currentDate);
    const actualDay = date.getDay();
    const millisPerDay = 24 * 60 * 60 * 1000;
    const monday = new Date(date.getTime() - ((actualDay === 0 ? 6 : actualDay - 1) * millisPerDay));
    monday.setHours(0,0,0,0);
    const sunday = new Date(date.getTime() + ((actualDay === 0 ? 0 : 7 - actualDay) * millisPerDay));
    sunday.setHours(23,59,59,999);

    const filteredEvents = events.filter(event => {
        /* if(event.date.slice(-1) === "Z"){
            dateF = event.date.substring(0, event.date.length - 1);
            dateF = event.date + "-02:00";
        } */
        const eventDate = new Date(event.date);
        return eventDate >= monday && eventDate <= sunday;
    });

    return filteredEvents;
}