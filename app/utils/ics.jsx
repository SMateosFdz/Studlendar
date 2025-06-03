import { parseDate } from "~/utils/date";

export function parseICS(icsText) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let event = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      event = {
        summary: "",
        end: new Date(),
        location: "",
      };
    } else if (line === "END:VEVENT") {
      if (event) events.push(event);
      event = null;
    } else if (event !== null) {
      const colonIndex = line.indexOf(":");

      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);
        if (key === "SUMMARY") event.summary = value;
        else if (key === "DTEND") event.end = parseDate(value);
      }
    }
  }
  return events;
}