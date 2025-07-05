import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, Form, useLoaderData } from "@remix-run/react";
import Navigation from "~/components/Navigation";
import styles from "~/styles/importFile.css";
import navStyles from "~/styles/navigation.css";
import type { Event } from "~/interfaces/event";
import { getDateValues } from "~/utils/date";
import { parseICS } from "~/utils/ics";
import { addEvent } from "~/data/events.server";
import { useState } from "react";
import { prisma } from "~/data/database.server";
import { getSession } from "~/sessions.server";
import { addClassBlock } from "~/data/classBlocks.server";
import type { ClassBlock } from "~/interfaces/classblock";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);

  if(session.data.userId == ""){
    throw new Error("Error de sesión");
  }

  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  const latestSubject = await prisma.subject.findMany({
    orderBy: {
      id: 'desc',
    },
    take: 1,
  })

  const response = {
    latestSubject: latestSubject[0].name,
    latestSubjectId: latestSubject[0].id,
  };

  return json(response);
}

export default function ImportICSFile() {
  const { latestSubject, latestSubjectId } = useLoaderData();
  const actionData = useActionData<{
    events?: { name?: string; start?: Date; end?: Date, duration?: number }[];
    error?: string;
  }>();
  const initialEvents: { id: string; checked: boolean }[] = [];
  const [currentSelection, setCurrentSelection] = useState(latestSubject);
  const [currentIdSelection, setCurrentIdSelection] = useState(latestSubjectId);
  const [isChecked, setIsChecked] = useState(initialEvents);

  if (actionData?.events && actionData.events.length > 0) {
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

  let eventIndex = -1;
  let blockIndex = -1;

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
            <h2>{`Eventos y bloques obtenidos: ${actionData.events.length} - ` + currentSelection}</h2>
            <Form method="post" name="eventsForm" id="eventsForm">
              <input type="hidden" id="form" name="form" value="events"></input>
              <input type="hidden" id="subjectId" name="subjectId" value={currentIdSelection}></input>
              <input type="hidden" id="subjectName" name="subjectName" value={currentSelection}></input>
              <p>Eventos y bloques de clase para la asignatura: {latestSubject}</p>
              <div className="all-container">
                <div className="events-container">
                  <h3>Eventos:</h3>
                  {
                    actionData.events.map((event, index) => {
                      if (event.duration === 0) {
                        eventIndex++;
                        return (<div className="event-item" key={eventIndex}>
                          <div className="event-name">
                            {event.name ?? "No Title"}
                            <input
                              type="checkbox"
                              id={`event-${index.toString()}`}
                              name={`event-${index.toString()}`}
                              checked={
                                isChecked.find((obj) => obj.id === index.toString())
                                  ?.checked
                              }
                              onChange={() =>
                                handleCheckboxChange(index.toString())
                              }
                            ></input>
                            <input type="hidden" id={`eventName-${eventIndex.toString()}`} name={`eventName-${eventIndex.toString()}`} value={event.name}></input>
                          </div>
                          <div className="event-datetime">
                            Comienzo: {event.start ?? "N/A"}
                            <input type="hidden" id={`eventStartDate-${eventIndex.toString()}`} name={`eventStartDate-${eventIndex.toString()}`} value={event.start}></input>
                          </div>
                          <div className="event-datetime">
                            Fin: {event.end ?? "N/A"}
                            <input type="hidden" id={`eventEndDate-${eventIndex.toString()}`} name={`eventEndDate-${eventIndex.toString()}`} value={event.end}></input>
                          </div>
                        </div>)
                      }
                    })
                  }
                </div>
                <div className="blocks-container">
                  <h3>Bloques: </h3>
                  {actionData.events.map((event, index) => {
                    if (event.duration !== 0) {
                      blockIndex++;
                      return (<div className="block-item" key={index}>
                        <div className="block-name">
                          {event.name ?? "No Title"}
                          <input
                            type="checkbox"
                            id={`block-${index.toString()}`}
                            name={`block-${index.toString()}`}
                            checked={
                              isChecked.find((obj) => obj.id === index.toString())
                                ?.checked
                            }
                            onChange={() =>
                              handleCheckboxChange(index.toString())
                            }
                          ></input>
                          <input type="hidden" id={`blockName-${blockIndex.toString()}`} name={`blockName-${blockIndex.toString()}`} value={event.name}></input>
                        </div>
                        <div className="event-datetime">
                          Comienzo: {event.start ?? "N/A"}
                          <input type="hidden" id={`blockStartDate-${blockIndex}`} name={`blockStartDate-${blockIndex}`} value={event.start}></input>
                        </div>
                        <div className="event-datetime">
                          Duración: {event.duration ?? "N/A"}
                          <input type="hidden" id={`blockDuration-${blockIndex}`} name={`blockDuration-${blockIndex}`} value={event.duration}></input>
                        </div>
                        <div className="event-datetime">
                          Fin: {event.end ?? "N/A"}
                          <input type="hidden" id={`blockEndDate-${blockIndex}`} name={`blockEndDate-${blockIndex}`} value={event.end}></input>
                        </div>
                      </div>)
                    }
                  })}
                </div>
              </div>
              <button type="submit">Guardar los eventos y bloques seleccionados</button>
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
      </footer>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const type = formData.get("form");

  if (type == "file") {
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
    const chosenBlocks: string[] = [];
    formData.forEach((element, key) => {
      if (element == "on" && key.includes("event")) {
        chosenEvents.push(key);
      } else {
        if (element == "on" && key.includes("block")) {
          chosenBlocks.push(key);
        }
      }
    });

    chosenEvents.forEach((i , index) => {
      const eventName = formData.get("eventName-" + index)?.toString();
      const eventDate = formData.get(`eventEndDate-` + index)?.toString().replace(".000", "");
      const subjectName = formData.get("subjectName")?.toString();
      const subjectId = formData.get("subjectId")?.toString();

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
        id: "",
        completed: false,
        subjectId: subjectId || "",
      };

      event.id = event.subjectName + event.date;
      console.log(event);
      addEvent(event);
    });

    chosenBlocks.forEach((i , index) => {
      const blockName = formData.get("blockName-" + index)?.toString();
      const blockDate = formData.get(`blockStartDate-` + index)?.toString().replace(".000", "");
      const duration = formData.get(`blockDuration-` + index)?.toString();
      const subjectName = formData.get("subjectName")?.toString();
      const subjectId = formData.get("subjectId")?.toString();

      const { hours, dayOfWeek } = getDateValues(blockDate);
      const hour = 8 * (3 + hours);
      const blockId = hour + dayOfWeek;

      let block: ClassBlock = {
        name: blockName || "",
        date: blockDate || "",
        notes: "",
        time: duration || "",
        repetition: "semanal",
        subjectName: subjectName?.toString() || "",
        blockId: blockId.toString(),
        id: "",
        completed: 0,
        subjectId: subjectId || "",
      };

      block.id = block.subjectName + block.date;
      console.log(block);
      addClassBlock(block);
    })

    return redirect("/createSubject");
  }

};

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: navStyles },
  ];
}
