/* eslint-disable array-callback-return */
import navStyles from "~/styles/calendarNavigation.css";
import calendarStyles from "~/styles/calendar.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import { addStudyBlock } from "~/data/studyBlocks.server";
import { addClassBlock } from "~/data/classBlocks.server";
import { addEvent } from "~/data/events.server";
import { filterDates } from "~/utils/filterDates";
import type { StudyBlock } from "~/interfaces/studyblock";
import type { ClassBlock } from "~/interfaces/classblock";
import type { Event } from "~/interfaces/event";
import { getDateValues, getDaysOfWeek } from "~/utils/date";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  let existingStudyBlocks = [];
  let existingEvents = [];
  let existingClassBlocks = [];

  const studyBlocks = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectName: subject.name },
    });
    return studyBlocks;
  });

  const events = existingSubjects.map(async (subject) => {
    const events = await prisma.event.findMany({
      where: { subjectName: subject.name },
    });
    return events;
  });

  const classBlocks = existingSubjects.map(async (subject) => {
    const classBlocks = await prisma.classBlock.findMany({
      where: { subjectName: subject.name },
    });
    return classBlocks;
  });

  const allStudyBlocks = await Promise.all(studyBlocks);
  const allEvents = await Promise.all(events);
  const allClassBlocks = await Promise.all(classBlocks);

  existingStudyBlocks.push(...allStudyBlocks.flat());
  existingEvents.push(...allEvents.flat());
  existingClassBlocks.push(...allClassBlocks.flat());

  existingStudyBlocks = filterDates(existingStudyBlocks);
  existingEvents = filterDates(existingEvents);
  existingClassBlocks = filterDates(existingClassBlocks);

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
    events: existingEvents,
    classBlocks: existingClassBlocks,
  };

  return json(response);
}

export default function Main() {
  const { subjects, studyBlocks, events, classBlocks } = useLoaderData();

  const [selectedValues, setSelectedValues] = useState([]);
  const [editingBlock, setEditingBlock] = useState(false);
  const [editingEvent, setEditingEvent] = useState(false);
  const [typeBlock, setTypeBlock] = useState(false);
  const [recordHours, setRecordHours] = useState(false);
  const [subjectEvent, setSubjectEvent] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [editingId, setEditingId] = useState(0);
  const [currentSelection, setCurrentSelection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleBlockClick(blockId: any, e: MouseEvent, toggled: boolean) {
    e.stopPropagation();
    setEditingEvent(false);
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(true);
    setIsToggled(toggled);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
  }

  function handleGridBlockClick(blockId: any) {
    setEditingBlock(true);
    setEditingEvent(false);
    setEditingId(blockId);
    setTypeBlock(false);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
  }

  function handleEventClick(blockId: any, e: MouseEvent) {
    setEditingEvent(true);
    setEditingBlock(true);
    setEditingId(blockId);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
  }

  // When form selection changes, update currentSelection state
  function handleSelectionChange(e: any) {
    setCurrentSelection(e.target.value);
  }
  // When form is submitted, update the stored block value and close form
  function handleFormSubmit() {
    setSelectedValues((prev) => ({
      ...prev,
      [editingBlock]: currentSelection,
    }));
    setEditingBlock(false);
  }

  // When form cancel is clicked
  function handleCancel() {
    setEditingBlock(false);
  }

  function handleRecordHours() {
    setRecordHours(!recordHours);
  }

  function handleSubjectEvent() {
    setSubjectEvent(!subjectEvent);
  }

  function handleToggle() {
    setIsToggled(!isToggled);
  }

  function handlePopup(id: number) {
    let form;
    let subject,
      name,
      time,
      date = "";

    if (editingEvent) {
      if (events.length != 0) {
        events.map(
          (event: {
            name: string;
            subjectName: string;
            date: string;
            blockId: number;
          }) => {
            const { year, month, hours, minutes, dayOfWeek } = getDateValues(
              event.date
            );
            if (event.blockId == id) {
              name = event.name;
              subject = event.subjectName;
              date =
                date + year + "-" + month.toString().padStart(2, "0") + "-" + dayOfWeek.toString().padStart(2, "0") + "T" + hours + ":" + minutes.toString().padStart(2, "0");
            }
          }
        );
      }
    } else {
      if(isToggled){
        if (studyBlocks.length != 0) {
        studyBlocks.map(
          (studyBlock: {
            blockId: number;
            name: string;
            subjectName: string;
            time: string;
          }) => {
            if (studyBlock.blockId == id) {
              name = studyBlock.name;
              subject = studyBlock.subjectName;
              time = studyBlock.time;
            }
          }
        );
      }
      }else{
        if(classBlocks.length != 0){
          classBlocks.map(
            (classBlock : {
              blockId: number;
              name: string;
              subjectName: string;
              time: string;
            }) => {
              if(classBlock.blockId == id){
                name = classBlock.name;
                subject = classBlock.subjectName;
                time = classBlock.time;
              }
            }
          )
        }
      }
    }

    editingEvent === true
      ? (form = (
          <>
            <h2 className="popup__title">{`Evento`}</h2>
            <Form method="post">
              <label htmlFor="blockName">Nombre del evento:</label>
              <input
                type="text"
                id="blockName"
                name="blockName"
                defaultValue={name}
              ></input>
              <hr></hr>
              <label htmlFor="subjectName">Asignatura:</label>
              <input
                id="subjectName"
                name="subjectName"
                defaultValue={subject}
                readOnly
              ></input>
              <hr></hr>

              <label htmlFor="time">Fecha: </label>
              <input
                type="datetime-local"
                name="time"
                id="time"
                value={date}
                readOnly
              ></input>
              <hr></hr>

              <select name="repetition" id="repetition">
                <option value="no-rep">No se repite</option>
                <option value="diario">Se repite cada día</option>
                <option value="semanal">Se repite cada semana</option>
              </select>
              <hr></hr>
              <label htmlFor="completed">Completado: </label>
              <input type="checkbox" name="completed" id="completed"></input>
              <hr></hr>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </>
        ))
      : typeBlock === false
      ? (form = (
          <>
            <h2 className="popup__title">
              {`Nuevo bloque de ${isToggled ? "estudio" : "clase"} - ` +
                currentSelection}
            </h2>
            <Form method="post">
              <input type="hidden" name="id" value={editingId} />
              <input
                type="hidden"
                name="type"
                value={isToggled ? "estudio" : "clase"}
              />
              <div className="popup__type">
                <p>Bloque de clase</p>
                <label className="switch">
                  <input type="checkbox" onChange={handleToggle} />
                  <span className="slider round"></span>
                </label>
                <p>Bloque de estudio</p>
              </div>
              <hr></hr>
              <label htmlFor="blockName">Nombre del bloque:</label>
              <input type="text" id="blockName" name="blockName"></input>
              <hr></hr>
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
              <hr></hr>

              <label htmlFor="time">Tiempo de estudio: </label>
              <input
                type="number"
                name="time"
                id="time"
                min={1}
                step={0.5}
                defaultValue={1}
              ></input>
              <hr></hr>

              <select name="repetition" id="repetition">
                <option value="no-rep">No se repite</option>
                <option value="diario">Se repite cada día</option>
                <option value="semanal">Se repite cada semana</option>
              </select>
              <hr></hr>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </>
        ))
      : (form = (
          <>
            <h2 className="popup__title">{`Bloque de ${isToggled ? "estudio" : "clase"} - ` + name}</h2>
            <Form method="post">
              <input type="hidden" name="id" value={editingId} />
              <label htmlFor="blockName">Nombre del bloque:</label>
              <input
                type="text"
                id="blockName"
                name="blockName"
                placeholder={name}
              ></input>
              <br></br>
              <label htmlFor="subjectName">Asignatura:</label>
              <input
                id="subjectName"
                name="subjectName"
                defaultValue={subject}
                readOnly
              ></input>
              <br></br>
              <label htmlFor="time">Tiempo de estudio: </label>
              <input
                type="number"
                name="time"
                id="time"
                min={1}
                step={0.5}
                defaultValue={time}
              ></input>
              <br></br>
              <select name="repetition" id="repetition">
                <option value="no-rep">No se repite</option>
                <option value="diario">Se repite cada día</option>
                <option value="semanal">Se repite cada semana</option>
              </select>
              <br></br>
              <label htmlFor="completed">Completado: </label>
              <input type="checkbox" name="completed" id="completed"></input>
              <br></br>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </>
        ));

    return form;
  }

  const daysOfWeek = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  const numbers = Array.from({ length: 24 }, (_, index) => index);

  return (
    <>
      <header>
        <h1 id="title">Studlendar</h1>
        <nav id={`full-navigation`}>
          <button
            className="full-navigation__button"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <img 
              src={!menuOpen ? ` https://img.icons8.com/ios/50/menu--v4.png` : `https://img.icons8.com/ios/50/delete-sign--v3.png`}
              alt={!menuOpen ? "menu--v4" : "delete-sign--v3"}
            />
          </button>
          {menuOpen && (<ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/pomodoro"} >
                <button className={"link"}>Empezar pomodoro</button>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={"/studyMode"} >
                <button className={"link"}>Modo estudio</button>
              </NavLink>
            </li>
            <li className="nav-item">
              <button className={"link"} onClick={handleRecordHours}>
                Apuntar horas de estudio
              </button>
            </li>
            <li className="nav-item">
              <button className={"link"} onClick={handleSubjectEvent}>
                Añadir evento
              </button>
            </li>
            <li className="nav-item">
              <NavLink to={"/configurationForm"} >
                <button className={"link"}>Configuración</button>
              </NavLink>
            </li>
          </ul>)}
        </nav>
      </header>
      <main>
        <div className="calendar">
          <div className="calendar__corner" key={0}></div>
          {daysOfWeek.map((day, index) => (
            <div className={`calendar__day ${index + 1 == 7 ? "final-day" : ""}`} key={index + 1}>
              {day}
            </div>
          ))}
          {Array.from({ length: 192 }, (_, index) =>
            index % 8 == 0 ? (
              <div className={`calendar__hour ${index + 24 == 208 ? "final-hour" : ""}`} key={index + 24}>
                <p>{numbers[index / 8]}:00</p>
              </div>
            ) : (
              <div
                className={`calendar__grid ${index + 24 == 215 ? "final-grid" : ""}`}
                key={index + 24}
                onClick={() => handleGridBlockClick(index + 24)}
              ></div>
            )
          )}

          {studyBlocks?.map(
            (
              studyBlock: { blockId: number; time: number; name: string },
              i: number
            ) => {
              const dayIndex = studyBlock.blockId % 8;
              const startHour = (studyBlock.blockId - dayIndex - 24) / 8;
              return (
                <div
                  key={i}
                  className="class-item"
                  style={{
                    top: `calc(3dvh + 3.4dvh * ${startHour})`,
                    height: `calc(${studyBlock.time} * 3.4dvh)`,
                    lineHeight: `calc(${studyBlock.time} * 1.7dvh)`,
                    left: `calc(13dvw * (${dayIndex - 1}) + 3dvw)`,
                    position: "absolute",
                  }}
                  title={studyBlock.name}
                  onClick={(e) => handleBlockClick(studyBlock.blockId, e, true)}
                >
                  {studyBlock.name}
                </div>
              );
            }
          )}

          {classBlocks?.map(
            (
              classBlock: { blockId: number; time: number; name: string },
              i: number
            ) => {
              const dayIndex = classBlock.blockId % 8;
              const startHour = (classBlock.blockId - dayIndex - 24) / 8;
              return (
                <div
                  key={i}
                  className="class-item"
                  style={{
                    top: `calc(3dvh + 3.4dvh * ${startHour})`,
                    height: `calc(${classBlock.time} * 3.4dvh)`,
                    lineHeight: `calc(${classBlock.time} * 1.7dvh)`,
                    left: `calc(13dvw * (${dayIndex - 1}) + 3dvw)`,
                    position: "absolute",
                  }}
                  title={classBlock.name}
                  onClick={(e) => handleBlockClick(classBlock.blockId, e, false)}
                >
                  {classBlock.name}
                </div>
              );
            }
          )}

          {events?.map((event: { date: Date; name: string }, i: number) => {
            const { hours, dayOfWeek } = getDateValues(event.date);
            const hour = 8 * (3 + hours);
            const blockId = hour + dayOfWeek;
            const dayIndex = blockId % 8;
            const startHour = (blockId - dayIndex - 24) / 8;
            return (
              <div
                key={i}
                className="class-item"
                style={{
                  top: `calc(3dvh + 3.4dvh * ${startHour})`,
                  /* height: `calc(${event.time} * 3.4dvh)`,
                  lineHeight: `calc(${event.time} * 1.7dvh)`, */
                  left: `calc(13dvw * (${dayIndex - 1}) + 3dvw)`,
                  position: "absolute",
                  width: "13dvw",
                  backgroundColor: "gray",
                }}
                title={event.name}
                onClick={(e) => handleEventClick(blockId, e)}
              >
                {event.name}
              </div>
            );
          })}
        </div>

        <div id="popup" className={`popup-show--${editingBlock}`}>
          <div className={`show--${editingBlock}`}>
            <span className="close" id="closePopup" onClick={handleCancel}>
              &times;
            </span>
            {handlePopup(editingId)}
          </div>
        </div>

        <div id="popup" className={`popup-show--${recordHours}`}>
          <div className={`show--${recordHours}`}>
            <span className="close" id="closePopup" onClick={handleRecordHours}>
              &times;
            </span>
            <h2>Apuntar horas de estudio - {currentSelection}</h2>
            <Form>
              <label htmlFor="subjects">Asignatura:</label>
              <select
                name="subjects"
                id="subjects"
                value={currentSelection}
                onChange={handleSelectionChange}
              >
                {subjects.map((subject: any) => (
                  <option key={subject.name} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <hr></hr>
              <label htmlFor="hours">Horas de estudio: </label>
              <input name="hours" id="hours" type="number" step={0.5} min={1}></input>
              <hr></hr>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </div>
        </div>

        <div id="popup" className={`popup-show--${subjectEvent}`}>
          <div className={`show--${subjectEvent}`}>
            <span
              className="close"
              id="closePopup"
              onClick={handleSubjectEvent}
            >
              &times;
            </span>
            <h2>Crear nuevo evento</h2>
            <form method="post" id="sessionForm">
              <input type="hidden" name="id" value="event" />
              <label htmlFor="name">Nombre del evento: </label>
              <input type="text" id="name" name="name"></input>
              <hr></hr>
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
              <hr></hr>
              <label htmlFor="color">Color asociado:</label>
              <input id="color" name="color" type="color"></input>
              <hr></hr>
              <label htmlFor="date">Hora y fecha del evento:</label>
              <input type="datetime-local" id="date" name="date"></input>
              <hr></hr>
              <label htmlFor="notes">Notas: </label>
              <br></br>
              <textarea id="notes" name="notes"></textarea>
              <hr></hr>
              <input
                type="submit"
                name="return"
                value="Guardar y cerrar"
              ></input>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (formData.get("id")?.toString() == "event") {
    let event: Event = {
      name: "",
      color: "",
      date: "",
      notes: "",
      subjectName: "",
      blockId: "",
    };

    const { hours, dayOfWeek } = getDateValues(
      formData.get("date")?.toString()
    );
    const hour = 8 * (3 + hours);
    const blockId = hour + dayOfWeek;

    event.name = formData.get("name")?.toString() || "";
    event.color = formData.get("color")?.toString() || "";
    event.date = formData.get("date")?.toString() || "";
    event.notes = formData.get("notes")?.toString() || "";
    event.subjectName = formData.get("subjectName")?.toString() || "";
    event.blockId = blockId.toString();

    addEvent(event);
  } else {
    if (formData.get("type")?.toString() == "estudio") {
      let studyBlock: StudyBlock = {
        blockId: "",
        name: "",
        subjectName: "",
        time: "",
        repetition: "",
        date: "",
      };

      studyBlock.blockId = formData.get("id")?.toString() || "";
      studyBlock.name = formData.get("blockName")?.toString() || "";
      studyBlock.subjectName = formData.get("subjectName")?.toString() || "";
      studyBlock.time = formData.get("time")?.toString() || "";
      studyBlock.repetition = formData.get("repetition")?.toString() || "";

      const dayIndex = studyBlock.blockId % 8;
      const startHour = (studyBlock.blockId - dayIndex - 24) / 8 + 2;
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const days = getDaysOfWeek();

      const date = new Date(year, month, days[dayIndex - 1], startHour);
      studyBlock.date = date.toDateString();

      addStudyBlock(studyBlock);
    } else {
      let classBlock: ClassBlock = {
        blockId: "",
        name: "",
        subjectName: "",
        repetition: "",
        time: "",
        date: "",
      };

      classBlock.blockId = formData.get("id")?.toString() || "";
      classBlock.name = formData.get("blockName")?.toString() || "";
      classBlock.subjectName = formData.get("subjectName")?.toString() || "";
      classBlock.time = formData.get("time")?.toString() || "";
      classBlock.repetition = formData.get("repetition")?.toString() || "";

      const dayIndex = classBlock.blockId % 8;
      const startHour = (classBlock.blockId - dayIndex - 24) / 8 + 2;
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const days = getDaysOfWeek();

      const date = new Date(year, month, days[dayIndex - 1], startHour);
      classBlock.date = date.toDateString();

      addClassBlock(classBlock);
    }
  }

  return redirect("/main");
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}
