import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, Form } from "@remix-run/react";
import Navigation from "~/components/Navigation";
import styles from "~/styles/importFile.css";
import navStyles from "~/styles/navigation.css";

function parseDate(icsDate: string) {
  const part1 = +icsDate.slice(0, 4);
  const part2 = +icsDate.slice(4, 6);
  const part3 = +icsDate.slice(6, 8);
  const part4 = +icsDate.slice(9, 11);
  const part5 = +icsDate.slice(11, 13);

  const dateString = new Date(part1, part2, part3, part4, part5);

  return dateString;
}

function parseICS(icsText: string) {
  const events = [];
  const lines = icsText.split(/\r?\n/);
  let event = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      event = {};
    } else if (line === "END:VEVENT") {
      if (event) events.push(event);
      event = null;
    } else if (event !== null) {
      const colonIndex = line.indexOf(":");

      if (colonIndex > -1) {
        const key = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);
        if (key === "SUMMARY") event.summary = value;
        else if (key === "DTSTART") event.start = parseDate(value);
        else if (key === "DTEND") event.end = parseDate(value);
        else if (key === "LOCATION") event.location = value;
      }
    }
  }
  return events;
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("icsFile");

  if (!file || !(file instanceof File)) {
    return json({ error: "No se ha cargado un fichero ICS" }, { status: 400 });
  }

  const text = await file.text();

  try {
    const events = parseICS(text);

    return json({ events });
  } catch (e) {
    return json({ error: "Error al cargar el fichero ICS" }, { status: 400 });
  }
};

export default function ImportICSFile() {
  const actionData = useActionData<{
    events?: { summary?: string; start?: Date; end?: Date }[];
    error?: string;
  }>();


  return (
    <div className="body">
      <Navigation currentPage={"/importFile"}></Navigation>
      <main className="container">
        <Form method="post" encType="multipart/form-data">
          <div className="form-group file-area">
            <input
              type="file"
              name="icsFile"
              id="icsFile"
              accept="ics"
              required
            />
            <div className="file-dummy">
              <div className="success">
                El fichero ha sido seleccionado correctamente.
              </div>
              <div className="default">Elige un fichero o suéltalo en este área</div>
            </div>
          </div>
          <hr></hr>
          <button type="submit">Subir y extraer</button>
        </Form>

        {actionData?.error && <div className="error">{actionData.error}</div>}

        {actionData?.events && actionData.events.length > 0 && (
          <div className="events-list">
            <h3>Eventos obtenidos ({actionData.events.length})</h3>
            {actionData.events.map((event, index) => (
              <div className="event-item" key={index}>
                <div className="event-summary">
                  {event.summary ?? "No Title"}
                </div>
                <div className="event-datetime">
                  Comienzo: {event.start ?? "N/A"} <br />
                  Fin: {event.end ?? "N/A"}
                </div>
              </div>
            ))}
          </div>
        )}

        {actionData?.events && actionData.events.length === 0 && (
          <div className="error">
            No se encontraron eventos en este fichero.
          </div>
        )}
      </main>
      <footer>
        <h2>Studlendar</h2>
      </footer>
    </div>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: navStyles },
  ];
}
