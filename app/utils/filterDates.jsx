export function filterDates(events) {
    const date = new Date();
    const actualDay = date.getDay();
    const millisPerDay = 24 * 60 * 60 * 1000;
    const monday = new Date(date.getTime() - ((actualDay === 0 ? 6 : actualDay - 1) * millisPerDay));
    const sunday = new Date(date.getTime() + ((actualDay === 0 ? 0 : 7 - actualDay) * millisPerDay));

    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= monday && eventDate <= sunday;
    });

    return filteredEvents;
}