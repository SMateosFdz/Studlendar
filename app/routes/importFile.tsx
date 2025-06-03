import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import Navigation from "~/components/Navigation";
import styles from "~/styles/importFile.css";
import navStyles from "~/styles/navigation.css";
import type { Event } from "~/interfaces/event";
import { getDateValues  } from "~/utils/date";
import { parseICS } from "~/utils/ics";
import { addEvent } from "~/data/events.server";
import { useState } from "react";
import { prisma } from "~/data/database.server";
import { userId } from "~/cookies.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  const latestSubject = await prisma.subject.findMany({
    orderBy: {
      id: 'desc',
    },
    take: 1,
  })

  const response = {
    subjects: existingSubjects,
    latestSubject: latestSubject[0].name,
  };

  return json(response);
}

export default function ImportICSFile() {
  const {subjects, latestSubject} = useLoaderData();
  const actionData = useActionData<{
    events?: { summary?: string; start?: Date; end?: Date }[];
    error?: string;
  }>();
  const initialEvents: { id: string; checked: boolean }[] = [];
  const [currentSelection, setCurrentSelection] = useState(latestSubject);
  const [isChecked, setIsChecked] = useState(initialEvents);

  if(actionData?.events && actionData.events.length > 0){
    actionData.events.map((event, index) => {
      initialEvents.push({
        id: event + index.toString(),
        checked: false,
      })
    })
  }
  

  const handleCheckboxChange = (id: string) => {
    setIsChecked((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  function handleSelectionChange(e: any) {
    setCurrentSelection(e.target.value);
  }

  return (
    <div className="body">
      <Navigation currentPage={"/importFile"}></Navigation>
      <main className="container">
        <Form method="post" encType="multipart/form-data">
        <input type="hidden" id="form" name="form" value="file"></input>
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
                El fichero ha sido leído correctamente.
              </div>
              <div className="default">Elige un fichero o suéltalo en este área</div>
            </div>
          </div>
          <br></br>
          <button type="submit">Extraer</button>
        </Form>

        {actionData?.error && <div className="error">{actionData.error}</div>}

        {actionData?.events && actionData.events.length > 0 && (
          <div className="events-list">
            <h2>{`Eventos obtenidos: ${actionData.events.length} - `+ currentSelection}</h2>
            <Form method="post" name="eventsForm" id="eventsForm">
              <input type="hidden" id="form" name="form" value="events"></input>
              <label htmlFor="subjectName">Asignatura:</label>
              <select
                name="subjectName"
                id="subjectName"
                value={currentSelection}
                onChange={handleSelectionChange}
              >
                {subjects.map((subject: any) => (
                  <option key={subject.name} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {actionData.events.map((event, index) => (
              <div className="event-item" key={index}>
                <div className="event-summary">
                  {event.summary ?? "No Title"}
                  <input
                    type="checkbox"
                    id={index.toString()}
                    name={index.toString()}
                    checked={
                      isChecked.find((obj) => obj.id === index.toString())
                      ?.checked
                      }
                    onChange={() =>
                      handleCheckboxChange(index.toString())
                    }
                    ></input>
                    <input type="hidden" id={`event-${index.toString()}`} name={`event-${index.toString()}`} value={event.summary}></input> 
                </div>
                <div className="event-datetime">
                  Fin: {event.end ?? "N/A"}
                  <input type="hidden" id={`eventDate-${index}`} name={`eventDate-${index}`} value={event.end}></input>
                </div>
              </div>
            ))}
            <button type="submit">Guardar los eventos seleccionados</button>
            </Form>
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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const type = formData.get("form");

  if(type == "file"){
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
  } else {
    const chosenEvents: string[] = [];
    formData.forEach((element, key) => {
      if(element == "on"){
        chosenEvents.push(key);
      }
    })

    chosenEvents.forEach((i) => {
      const eventName = formData.get("event-" + i)?.toString();
      const eventDate = formData.get(`eventDate-` + i)?.toString();
      const subjectName = formData.get("subjectName");

      const { hours, dayOfWeek } = getDateValues(eventDate);
      const hour = 8 * (3 + hours);
      const blockId = hour + dayOfWeek;

      let event: Event = {
        name: eventName || "",
        color: "",
        date: eventDate || "",
        notes: "",
        subjectName: subjectName?.toString() || "",
        blockId: blockId.toString(),
      };

      addEvent(event);
    })
      

    return redirect("/configurationForm"); 
  }
  
};

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: navStyles },
  ];
}
