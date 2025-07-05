/* eslint-disable array-callback-return */
import navStyles from "~/styles/calendarNavigation.css";
import calendarStyles from "~/styles/calendar.css";
import pomodoroStyles from "~/styles/pomodoro.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getSession } from "~/sessions.server";
import { prisma } from "~/data/database.server";
import { addStudyBlock, deleteStudyBlock, updateStudyBlock } from "~/data/studyBlocks.server";
import { addClassBlock, deleteClassBlock, updateClassBlock } from "~/data/classBlocks.server";
import { addEvent, deleteEvent, updateEvent } from "~/data/events.server";
import { filterDates } from "~/utils/filterDates";
import { Calculate } from "~/utils/studyBlock";
import type { StudyBlock } from "~/interfaces/studyblock";
import type { ClassBlock } from "~/interfaces/classblock";
import type { Event } from "~/interfaces/event";
import { getCurrentDate, getDateValues, getDaysOfWeek, getWeekNumber } from "~/utils/date";
import Pomodoro from "./pomodoro";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  let existingStudyBlocks = [];
  let existingEvents = [];
  let existingClassBlocks = [];

  const studyBlocks = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectId: subject.id },
    });
    return studyBlocks;
  });

  const events = existingSubjects.map(async (subject) => {
    const events = await prisma.event.findMany({
      where: { subjectId: subject.id },
    });
    return events;
  });

  const classBlocks = existingSubjects.map(async (subject) => {
    const classBlocks = await prisma.classBlock.findMany({
      where: { subjectId: subject.id },
    });
    return classBlocks;
  });

  const allStudyBlocks = await Promise.all(studyBlocks);
  const allEvents = await Promise.all(events);
  const allClassBlocks = await Promise.all(classBlocks);

  existingStudyBlocks.push(...allStudyBlocks.flat());
  existingEvents.push(...allEvents.flat());
  existingClassBlocks.push(...allClassBlocks.flat());

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
    events: existingEvents,
    classBlocks: existingClassBlocks,
  };

  console.log("prueba");

  return json(response);
}

export default function Main() {
  let { subjects, studyBlocks, events, classBlocks } = useLoaderData();

  const [selectedValues, setSelectedValues] = useState([]);
  const [editingBlock, setEditingBlock] = useState(false);
  const [typeBlock, setTypeBlock] = useState(false);
  const [isToggledMode, setIsToggledMode] = useState(false);
  const [editingId, setEditingId] = useState(0);
  const [currentSelection, setCurrentSelection] = useState("");
  const [currentIdSelection, setCurrentIdSelection] = useState("");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => new Date());
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentEvents, setCurrentEvents] = useState(filterDates(events, new Date()));
  const [currentStudyBlocks, setcurrentStudyBlocks] = useState(filterDates(studyBlocks, new Date()));
  const [currentClassBlocks, setCurrentClassBlocks] = useState(filterDates(classBlocks, new Date()));
  const [completedValue, setCompletedValue] = useState(0);
  const [hoursFlag, setHoursFlag] = useState(false);
  const [maxHours, setMaxHours] = useState(0);
  const [creatingDate, setCreatingDate] = useState("");
  const [nameError, setNameError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const formTypes = ["Evento", "Bloque de estudio", "Bloque de clase"];
  const [selectedType, setSelectedType] = useState(0);

  function handleBlockClick(blockId: any, e: MouseEvent, type: number) {
    e.stopPropagation();
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(true);
    setSelectedType(type);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
    setCurrentIdSelection(selectedValues[blockId] || subjects[0].id);
  }

  function handleGridBlockClick(blockId: any) {
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(false);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
    setCurrentIdSelection(selectedValues[blockId] || subjects[0].id);
  }

  function handleEventClick(blockId: any) {
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(true);
    setSelectedType(0);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
    setCurrentIdSelection(selectedValues[blockId] || subjects[0].name);
  }

  useEffect(() => {
    setCurrentEvents(events);
    setcurrentStudyBlocks(studyBlocks);
    setCurrentClassBlocks(classBlocks);
  }, [events, studyBlocks, classBlocks])

  // When form selection changes, update currentSelection state
  function handleSelectionChange(e: any) {
    setCurrentSelection(e.target.value.split("-")[0]);
    setCurrentIdSelection(e.target.value.split("-")[1]);
    switch (selectedType) {
      case 1:
        let flag = false;
        currentStudyBlocks.map((block: { id: string; }) => {
          if (block.id === e.target.value + creatingDate) {
            flag = true;
          }
        })
        !flag ? setNameError("") : setNameError("Error en este bloque, ya hay uno para esta asignatura y fecha");
        break;
    }
  }
  // When form is submitted, update the stored block value and close form
  function handleFormSubmit() {
    setSelectedValues((prev) => ({
      ...prev,
      [editingBlock]: currentSelection,
    }));
    setEditingBlock(false);
  }

  function handleCompletedChange(event: { target: { value: string; }; }) {
    setCompletedValue(Number(event.target.value));
    setHoursFlag(true);
  }

  function handleModeChange() {
    setIsToggledMode(!isToggledMode);
    window.scrollTo(0, 0);
  }

  function handleDateChange(event) {
    const date = new Date(event.target.value);
    setCreatingDate(event.target.value + ":00");
    setMaxHours(date.getHours());
    let flag = false;
    if (selectedType === 1) {
      currentStudyBlocks.map((block: { id: string; time: string }) => {
        const hours = Number(block.time);
        for (let i = 0; i < hours; i++) {
          if (block.id.includes(currentSelection + event.target.value + ":00")) {
            flag = true;
          }
        }
      })
    }
    !flag ? setNameError("") : setNameError("Error en el nombre del bloque, ya existe uno con el mismo nombre");
  }

  function handleComprobation() {
    const currentDays = getDaysOfWeek(new Date());
    const dayIndex = Number(editingId) % 8;
    const startHour = (Number(editingId) - dayIndex - 24) / 8;
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":00:00";
    let flag = false;
    if (selectedType === 1) {
      currentStudyBlocks.map((block: { id: string; }) => {
        if (block.id.includes(currentSelection + date)) {
          flag = true;
        }
      })
    }
    !flag ? setNameError("") : setNameError("Error en el nombre del bloque, ya existe uno con el mismo nombre");
  }

  function handlePopup(id: number, offset: number) {
    let form;
    let subject, name, time, date = "";
    let subjectId = "";
    let completed = 0;
    let completedEvent = false;

    switch (selectedType) {
      case 0:
        if (events.length != 0) {
          events.map(
            (event: {
              name: string;
              subjectId: string;
              subjectName: string;
              date: string;
              blockId: number;
              completed: boolean;
            }) => {
              const { year, month, day, hours, minutes } = getDateValues(event.date);
              if (event.blockId == id) {
                name = event.name;
                subject = event.subjectName;
                subjectId = event.subjectId;
                completedEvent = event.completed;
                date =
                  year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0") + "T" + hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":00";
              }
            }
          );
        }
        break;
      case 1:
        if (studyBlocks.length != 0) {
          studyBlocks.map(
            (studyBlock: {
              blockId: number;
              name: string;
              subjectId: string;
              subjectName: string;
              date: string;
              time: string;
              completed: number;
            }) => {
              if (studyBlock.blockId == id) {
                const { year, month, day, hours, minutes } = getDateValues(studyBlock.date);
                name = studyBlock.name;
                subject = studyBlock.subjectName;
                subjectId = studyBlock.subjectId;
                time = studyBlock.time;
                completed = studyBlock.completed;
                date =
                  year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0") + "T" + hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":00Z";
              }
            }
          );
        }
        break;
      case 2:
        if (classBlocks.length != 0) {
          classBlocks.map(
            (classBlock: {
              blockId: number;
              name: string;
              subjectId: string;
              subjectName: string;
              date: string;
              time: string;
              completed: number;
            }) => {
              if (classBlock.blockId == id) {
                const { year, month, day, hours, minutes } = getDateValues(classBlock.date);
                name = classBlock.name;
                subject = classBlock.subjectName;
                subjectId = classBlock.subjectId;
                time = classBlock.time;
                completed = classBlock.completed;
                date =
                  year + "-" + month.toString().padStart(2, "0") + "-" + day.toString().padStart(2, "0") + "T" + hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":00Z";
              }
            }
          )
        }
        break;
    }

    typeBlock === false
      ? (id != 0 ? (form = (
        <>
          <h2 className="popup__title">
            {`Nuevo ${formTypes[selectedType]} - ` +
              currentSelection}
          </h2>
          <Form method="post">
            <input type="hidden" aria-hidden="true" name="id" value={editingId} />
            <input type="hidden" aria-hidden="true" name="weekOffset" value={offset} />
            <input type="hidden" aria-hidden="true" name="subjectId" value={currentIdSelection} />
            <input type="hidden" aria-hidden="true" name="type" value={formTypes[selectedType] + " c"} />
            <input type="hidden" aria-hidden="true" name="innerId" value={classBlocks.length || "0"} />
            <div className="popup__type">
              {formTypes.map((type, index) => (
                <button
                  key={index}
                  type="button"
                  className={`
                      ${selectedType === index ? "selected" : ""}
                      ${index === 0 ? "popup__type--first" : index === formTypes.length - 1 ? "popup__type--last" : ""}`
                  }
                  onClick={() => setSelectedType(index)}
                >
                  {type}
                </button>
              ))}
            </div>
            <hr></hr>
            <label htmlFor="blockName">Nombre del {selectedType === 0 ? "evento:" : "bloque:"}</label>
            <input type="text" id="blockName" name="blockName" onInput={handleComprobation}></input>
            <hr></hr>
            <label htmlFor="subjectName">Asignatura:</label>
            <select
              name="subjectName"
              id="subjectName"
              defaultValue={currentSelection}
              onChange={handleSelectionChange}
            >
              {subjects.map((subject: any) => (
                <option key={subject.name} value={subject.name + "-" + subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <hr></hr>
            {selectedType !== 0 && (
              <>
                <label htmlFor="time">Tiempo de estudio: </label>
                <input
                  type="number"
                  name="time"
                  id="time"
                  min={1}
                  max={24 - ((editingId - (editingId % 8) - 24) / 8)}
                  step={0.5}
                  defaultValue={1}
                ></input>
                <hr></hr>
              </>
            )}
            {selectedType === 0 && (
              <>
                <label htmlFor="datetime">Hora: </label>
                <input
                  type="time"
                  name="datetime"
                  id="datetime"
                  min={`${String((editingId - (editingId % 8) - 24) / 8).length === 1 ? ("0" + ((editingId - (editingId % 8) - 24) / 8).toString()) : (editingId - (editingId % 8) - 24) / 8}:00`}
                  max={`${String((editingId - (editingId % 8) - 24) / 8).length === 1 ? ("0" + ((editingId - (editingId % 8) - 24) / 8).toString()) : (editingId - (editingId % 8) - 24) / 8}:59`}
                ></input>
                <hr></hr>
              </>
            )}
            <label htmlFor="notes">Notas:</label>
            <textarea id="notes" name="notes"></textarea>
            <hr></hr>
            {nameError !== "" ? <><span className="nameError">{nameError}</span><br></br></> : ""}
            <input
              type="submit"
              name="return"
              value="Guardar y volver"
              onClick={handleFormSubmit}
            ></input>
          </Form>
        </>
      ))
        : (form =
          <>
            <h2 className="popup__title">
              {`Nuevo ${formTypes[selectedType]} - ` +
                currentSelection}
            </h2>
            <Form method="post" className="popup__form">
              <input type="hidden" aria-hidden="true" name="id" value={0} />
              <input type="hidden" aria-hidden="true" name="weekOffset" value={offset} />
              <input type="hidden" aria-hidden="true" name="subjectId" value={currentIdSelection} />
              <input type="hidden" aria-hidden="true" name="type" value={formTypes[selectedType] + " c"} />
              <input type="hidden" aria-hidden="true" name="innerId" value={classBlocks.length || "0"} />
              <div className="popup__type">
                {formTypes.map((type, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`
                      ${selectedType === index ? "selected" : ""}
                      ${index === 0 ? "popup__type--first" : index === formTypes.length - 1 ? "popup__type--last" : ""}`
                    }
                    onClick={() => setSelectedType(index)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <hr></hr>
              <label htmlFor="blockName">Nombre del {selectedType === 0 ? "evento:" : "bloque:"}</label>
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
                  <option key={subject.name} value={subject.name + "-" + subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <hr></hr>
              <label htmlFor="datetime">Fecha: </label>
              <input
                type="datetime-local"
                name="datetime"
                id="datetime"
                onChange={handleDateChange}
              ></input>
              <hr></hr>
              {selectedType !== 0 && (
                <>
                  <label htmlFor="time">Tiempo de estudio: </label>
                  <input
                    type="number"
                    name="time"
                    id="time"
                    min={1}
                    max={24 - maxHours}
                    step={0.5}
                    defaultValue={1}
                  ></input>
                  <hr></hr>
                </>
              )}
              <label htmlFor="notes">Notas:</label>
              <textarea id="notes" name="notes"></textarea>
              <hr></hr>
              {nameError !== "" ? <><span className="nameError">{nameError}</span><br></br></> : ""}
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                disabled={nameError !== ""}
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </>
        ))
      : (form = (
        <>
          <h2 className="popup__title">
            {` ${formTypes[selectedType]} - ` + subject}
          </h2>
          <Form method="post" id="editingForm">
            <input type="hidden" aria-hidden="true" name="id" value={editingId} />
            <input type="hidden" aria-hidden="true" name="weekOffset" value={offset} />
            <input type="hidden" aria-hidden="true" name="subjectId" value={currentIdSelection} />
            <input type="hidden" aria-hidden="true" name="type" value={formTypes[selectedType] + " u"} />
            <input type="hidden" aria-hidden="true" name="date" value={date} />
            <input type="hidden" aria-hidden="true" name="subjectName" value={subject} />
            <label htmlFor="name">Nombre del bloque:</label>
            <input type="text" id="name" name="name" placeholder={name}></input>
            <hr></hr>
            <label>Asignatura:</label>
            <p>{subject}</p>
            <hr></hr>
            {selectedType !== 0 && (
              <>
                <label htmlFor="time">Tiempo de estudio: </label>
                <input
                  type="number"
                  name="time"
                  id="time"
                  min={1}
                  step={0.5}
                  defaultValue={time}
                ></input>
                <hr></hr>
              </>
            )}
            {selectedType === 0 && (
              <>
                <label htmlFor="datetime">Hora: </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  id="datetime"
                  value={date}
                  readOnly
                ></input>
                <hr></hr>
              </>
            )}
            {selectedType === 0 ?
              <>
                <label htmlFor="completed">Completado: </label>
                <input type="checkbox" name="completed" id="completed" defaultChecked={completedEvent}></input>
                <hr></hr>
              </> :
              selectedType === 1 ?
              <>
                <label htmlFor="completed">Completado: </label>
                <input type="range" name="completed" id="completed"
                  min={0}
                  max={100}
                  step={25}
                  defaultValue={completed}
                  onChange={handleCompletedChange}
                ></input>
                <span>{!hoursFlag ? completed : completedValue}%</span>
                <hr></hr>
              </> :
              ""
            }

            <input
              type="submit"
              name="return"
              value="Guardar y volver"
              onClick={handleFormSubmit}
            ></input>
            <input
              type="submit"
              name="delete"
              value="Borrar item"
              onClick={handleFormSubmit}
            ></input>
          </Form>
        </>
      ));

    return form;
  }

  function handleNewSelection(e: any) {
    if (e.target.value == "event") {
      handleGridBlockClick(0);
      setSelectedType(0);
    } else {
      if (e.target.value == "classBlock") {
        handleGridBlockClick(0);
        setSelectedType(2)
      } else {
        handleGridBlockClick(0);
        setSelectedType(1);
      }
    }
  }

  function handleReviewSelection(e: any) {
    const form = document.getElementsByClassName("nav-item-form")[0] as HTMLFormElement;
    form.submit();
  }

  function changeWeek(offset: number) {
    setCurrentOffset(currentOffset + offset);
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + offset * 7);
    setCurrentWeekStart(newStart);
    setCurrentEvents(filterDates(events, newStart));
    setcurrentStudyBlocks(filterDates(studyBlocks, newStart));
    setCurrentClassBlocks(filterDates(classBlocks, newStart));
    setCurrentWeek(getWeekNumber(newStart));
  }

  function handleClose() {
    setEditingBlock(false);
    setCompletedValue(0);
    const form = document.getElementById("editingForm") as HTMLFormElement;
    form.reset();
  }

  function handleNavOpen() {
    setIsOpen(!isOpen);
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
  const [numbersWeek, datesOfWeek] = getDaysOfWeek(currentWeekStart);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = now.toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const { flag, blockName } = Calculate(studyBlocks, getCurrentDate().hours, getCurrentDate().dayOfWeek);

  function setBorder(value: string){
    let border = "";
    switch(value){
      case 0:
        border = "3px solid red";
        break;

      case 25:
         border = "3px solid #FF4500";
        break;

      case 50:
         border = "3px solid orange";
        break;

      case 75:
         border = "3px solid yellow";
        break;

      case 100:
         border = "3px solid green";
        break;
    }
    
    return border;
  }

  function setBackgroundColor(value: string){
    let color = "";
    subjects.map((subject: { id: any; color: string; }) => {
      if(subject.id === value){
        color = subject.color;
      }
    })
    return color;
  }

  return (
    <>
      <header>
        <h1 id="title">
          Studlendar
        </h1>
        <nav id={`full-navigation`}>
          <ul className="navigation">
            <li className="nav-item">
              <select onChange={handleNewSelection}>
                <option selected disabled>Añadir </option>
                <option value={"event"}>Evento</option>
                <option value={"studyBlock"}>Bloque de estudio</option>
                <option value={"classBlock"}>Bloque de clase</option>
              </select>
            </li>
            <li className="nav-item">
              <Form method="post" className="nav-item-form">
                <select onChange={handleReviewSelection} id="review" name="review">
                  <option selected disabled>Revisar</option>
                  <option value={"daily"}>Diaria</option>
                  <option value={"weekly"}>Semanal</option>
                  <option value={"subject"}>Por asignatura</option>
                </select>
              </Form>
            </li>
            <li className="nav-item">
              <a href={`#${new Date().getHours()}`}>
                <button className={"link"}>
                  <span>Bajar a la hora actual</span>
                  <i className="bi bi-clock"></i>
                </button>
              </a>
            </li>
            <li className="nav-item">
              <NavLink to={"/configurationForm"} >
                <button className={"link"}>
                  <span>Configurar</span>
                  <i className="bi bi-gear"></i>
                </button>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={"/logout"} >
                <button className={"link"}>
                  <span>Cerrar sesión</span>
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </NavLink>
            </li>
          </ul>
        </nav>
        <nav id={`full-navigation-smallWidth`}>
          <button onClick={handleNavOpen} className={`navigation-button open-${isOpen}`}>
            <i className="bi bi-caret-down"></i>
          </button>
          {isOpen && (<ul className="navigation-smallWidth">
            <li className="nav-item-smallWidth">
              <select onChange={handleNewSelection}>
                <option selected disabled>Añadir </option>
                <option value={"event"}>Evento</option>
                <option value={"studyBlock"}>Bloque de estudio</option>
                <option value={"classBlock"}>Bloque de clase</option>
              </select>
            </li>
            <li className="nav-item-smallWidth">
              <Form method="post" className="nav-item-form">
                <select onChange={handleReviewSelection} id="review" name="review">
                  <option selected disabled>Revisar</option>
                  <option value={"daily"}>Diaria</option>
                  <option value={"weekly"}>Semanal</option>
                  <option value={"subject"}>Por asignatura</option>
                </select>
              </Form>
            </li>
            <li className="nav-item-smallWidth">
              <a href={`#${new Date().getHours()}`}>
                <button className={"link"}>
                  <span>Bajar a la hora actual</span>
                  <i className="bi bi-clock"></i>
                </button>
              </a>
            </li>
            <li className="nav-item-smallWidth">
              <NavLink to={"/configurationForm"} >
                <button className={"link"}>
                  <span>Configurar</span>
                  <i className="bi bi-gear"></i>
                </button>
              </NavLink>
            </li>
            <li className="nav-item-smallWidth">
              <NavLink to={"/logout"} >
                <button className={"link"}>
                  <span>Cerrar sesión</span>
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </NavLink>
            </li>
          </ul>)}
        </nav>
      </header>
      <main>
        <div className="current-date">
          <button className={`left ${!isToggledMode}`} onClick={() => changeWeek(-1)}><span>&#60;</span></button>
          <p>Fecha: {formattedDateTime} {currentOffset !== 0 && (<> | <button onClick={() => changeWeek(-currentOffset)}>Volver a la semana actual</button> </>)} | Semana actual: {currentWeek}</p>

          <button className={`right ${!isToggledMode}`} onClick={() => changeWeek(1)}><span>&#62;</span></button>
        </div>

        <div className="toggle__mode">
          <p className={`toogle__mode-calendar highlight--${!isToggledMode}`}>Modo calendario</p>
          <label className="switch">
            <input type="checkbox" onChange={handleModeChange} />
            <span className="slider round"></span>
          </label>
          <p className={`toggle__mode-study highlight--${isToggledMode}`}>Modo estudio</p>
        </div>
        <div className={`container ${!isToggledMode}`}>
          <div className={`calendar ${!isToggledMode}`}>
            <div className="calendar__corner" key={0}></div>
            {daysOfWeek.map((day, index) => (
              <div className={`calendar__day ${index + 1 == 7 ? "final-day" : ""}`} key={index + 1}>
                <p>{`${day} ${numbersWeek[index]}`}</p>
              </div>
            ))}
            {Array.from({ length: 192 }, (_, index) =>
              index % 8 == 0 ? (
                <div className={`calendar__hour ${index + 24 == 208 ? "final-hour" : ""}`} id={numbers[index / 8].toString()} key={index + 24}>
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

            {currentStudyBlocks?.map(
              (
                studyBlock: { blockId: number; time: number; name: string; date: Date; completed: string, subjectId: string },
                i: number
              ) => {
                const date = new Date(studyBlock.date);
                let hours = date.getUTCHours();
                let dayOfWeek = (date.getUTCDay() + 6) % 7;
                if (hours >= 24) {
                  hours -= 24;
                  dayOfWeek = (dayOfWeek + 1) % 7;
                }
                dayOfWeek += 1;
                const dayIndex = dayOfWeek - 1;
                const startHour = hours;
                return (
                  <div
                    key={i}
                    className="class-item"
                    style={{
                      top: `calc(3dvh + 6.8dvh * ${startHour})`,
                      height: `calc(${studyBlock.time} * 6.8dvh)`,
                      left: `calc(13dvw * (${dayIndex}) + 50px)`,
                      position: "absolute",
                      border: setBorder(studyBlock.completed),
                      backgroundColor: setBackgroundColor(studyBlock.subjectId)
                    }}
                    title={studyBlock.name}
                    onClick={(e) => handleBlockClick(studyBlock.blockId, e, 1)}
                  >
                    {studyBlock.name}
                  </div>
                );
              }
            )}

            {currentClassBlocks?.map(
              (
                classBlock: { blockId: number; time: number; name: string; date: Date, subjectId: string },
                i: number
              ) => {
                const date = new Date(classBlock.date);
                let hours = date.getUTCHours();
                let dayOfWeek = (date.getUTCDay() + 6) % 7;
                if (hours >= 24) {
                  hours -= 24;
                  dayOfWeek = (dayOfWeek + 1) % 7;
                }
                dayOfWeek += 1;
                const dayIndex = dayOfWeek - 1;
                const startHour = hours;
                return (
                  <div
                    key={i}
                    className="class-item"
                    style={{
                      top: `calc(3dvh + 6.8dvh * ${startHour})`,
                      height: `calc(${classBlock.time} * 6.8dvh)`,
                      left: `calc(13dvw * (${dayIndex}) + 50px)`,
                      position: "absolute",
                      backgroundColor: setBackgroundColor(classBlock.subjectId),
                    }}
                    title={classBlock.name}
                    onClick={(e) => handleBlockClick(classBlock.blockId, e, 2)}
                  >
                    {classBlock.name}
                  </div>
                );
              }
            )}

            {currentEvents?.map((event: { date: Date; name: string, subjectId: string; blockId: string; }, i: number) => {
              const date = new Date(event.date);
              let hours = date.getUTCHours();
              let dayOfWeek = (date.getUTCDay() + 6) % 7;
              if (hours >= 24) {
                hours -= 24;
                dayOfWeek = (dayOfWeek + 1) % 7;
              }
              dayOfWeek += 1;
              const dayIndex = dayOfWeek - 1;
              const startHour = hours;
              return (
                <div
                  key={i}
                  className="class-item"
                  style={{
                    top: `calc(3dvh + 6.8dvh * ${startHour})`,
                    height: `calc(1 * 3dvh)`,
                    left: `calc(13dvw * (${dayIndex}) + 50px)`,
                    position: "absolute",
                    backgroundColor: setBackgroundColor(event.subjectId),
                  }}
                  title={event.name}
                  onClick={(e) => handleEventClick(event.blockId)}
                >
                  {event.name}
                </div>
              );
            })}
          </div>

          <div className={`back ${isToggledMode}`}>
            <h2 className="studyMode__title">Modo estudio</h2>
            <div className="studyMode__container">
              {flag ? `Hay un bloque en esta hora: "${blockName}"` : "No hay bloque en esta hora"}
              {Pomodoro()}
            </div>
          </div>
        </div>

        <div id="popup" className={`popup-show--${editingBlock}`}>
          <div className={`show--${editingBlock}`}>
            <span className="close" id="closePopup" onClick={handleClose}>
              &times;
            </span>
            {handlePopup(editingId, currentOffset)}
          </div>
        </div>
      </main>
    </>
  );

}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const offset = Number(formData.get("weekOffset")?.toString()) || 0;
  const date = new Date();
  date.setDate(date.getDate() + offset * 7);
  const [currentDays, datesOfWeek] = getDaysOfWeek(date);
  const review = formData.get("review")?.toString() || "";
  const del = formData.get("delete")?.toString() || "";

  console.log("input: ", formData.get("name")?.toString());
  console.log("input: ", formData.get("completed")?.toString());

  if (review !== "") {
    switch (review) {
      case "daily":
        return redirect("/dailyReview");

      case "weekly":
        return redirect("/weeklyReview");

      case "subject":
        return redirect("/subjectReview");
    }
  }

  let classBlock: ClassBlock = {
    id: "",
    blockId: "",
    name: "",
    subjectId: "",
    subjectName: "",
    repetition: "",
    time: "",
    date: "",
    completed: 0,
    notes: ""
  };

  let studyBlock: StudyBlock = {
    id: "",
    blockId: "",
    name: "",
    subjectId: "",
    subjectName: "",
    time: "",
    repetition: "",
    date: "",
    completed: 0,
    notes: ""
  };

  let event: Event = {
    id: "",
    name: "",
    color: "",
    date: "",
    notes: "",
    subjectId: "",
    subjectName: "",
    blockId: "",
    completed: false,
  };

  if (del !== "") {
    switch (formData.get("type")?.toString()) {
      case "Evento u":
        if (formData.get("id")?.toString() != "0") {
          event.blockId = formData.get("id")?.toString() || "";
          event.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
          const dayIndex = Number(event.blockId) % 8;
          const startHour = (Number(event.blockId) - dayIndex - 24) / 8;
          const minutes = formData.get("datetime")?.toString().split(":")[1];
          console.log(datesOfWeek[dayIndex - 1]);
          const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
          const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
          const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":" + minutes?.padStart(2, "0") + ":00Z";
          event.date = date;
        } else {
          event.date = formData.get("datetime")?.toString() + ":00Z" || "";
        }
        event.id = event.subjectName + event.date.replace(".000", "");
        deleteEvent(event);
        break;

      case "Bloque de estudio u":
        studyBlock.blockId = formData.get("id")?.toString() || "";
        studyBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";

        if (formData.get("id")?.toString() != "0") {
          const dayIndex = Number(studyBlock.blockId) % 8;
          const startHour = (Number(studyBlock.blockId) - dayIndex - 24) / 8;
          const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
          const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
          const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":00:00Z";
          studyBlock.date = date;
        } else {
          studyBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        }
        studyBlock.id = studyBlock.subjectName + studyBlock.date.replace(".000", "");
        deleteStudyBlock(studyBlock);
        break;

      case "Bloque de clase u":
        classBlock.blockId = formData.get("id")?.toString() || "";
        classBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";

        if (formData.get("id")?.toString() != "0") {
          const dayIndex = Number(classBlock.blockId) % 8;
          const startHour = (Number(classBlock.blockId) - dayIndex - 24) / 8;
          const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
          const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
          const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":00:00Z";
          classBlock.date = date;
        } else {
          classBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        }
        classBlock.id = classBlock.subjectName + classBlock.date.replace(".000", "");
        deleteClassBlock(classBlock);
        break;
    }
    return null;
  }

  switch (formData.get("type")?.toString()) {
    case "Evento c":
      event.name = formData.get("blockName")?.toString() || "";
      event.color = formData.get("color")?.toString() || "";
      event.notes = formData.get("notes")?.toString() || "";
      event.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      event.blockId = formData.get("id")?.toString() || "";
      event.subjectId = formData.get("subjectName")?.toString().split("-")[1] || "";

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(event.blockId) % 8;
        const startHour = (Number(event.blockId) - dayIndex - 24) / 8;
        const minutes = formData.get("datetime")?.toString().split(":")[1];
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":" + minutes?.padStart(2, "0") + ":00Z";
        event.date = date.replace(".000", "");
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        event.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        event.blockId = blockId.toString();
      }
      event.id = event.subjectName + event.date.replace(".000", "");
      console.log(currentDays);
      addEvent(event);
      break;

    case "Bloque de estudio c":
      studyBlock.blockId = formData.get("id")?.toString() || "";
      studyBlock.name = formData.get("blockName")?.toString() || "";
      studyBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      studyBlock.time = formData.get("time")?.toString() || "";
      studyBlock.subjectId = formData.get("subjectName")?.toString().split("-")[1] || "";

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(studyBlock.blockId) % 8;
        const startHour = (Number(studyBlock.blockId) - dayIndex - 24) / 8;
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":00:00Z";
        studyBlock.date = date.replace(".000", "");
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        studyBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        studyBlock.blockId = blockId.toString();
      }
      studyBlock.id = studyBlock.subjectName + studyBlock.date.replace(".000", "");

      addStudyBlock(studyBlock);
      break;

    case "Bloque de clase c":
      classBlock.blockId = formData.get("id")?.toString() || "";
      classBlock.name = formData.get("blockName")?.toString() || "";
      classBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      classBlock.time = formData.get("time")?.toString() || "";
      classBlock.subjectId = formData.get("subjectName")?.toString().split("-")[1] || "";

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(classBlock.blockId) % 8;
        const startHour = (Number(classBlock.blockId) - dayIndex - 24) / 8;
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":00:00Z";
        classBlock.date = date;
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        classBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        classBlock.blockId = blockId.toString();
      }
      classBlock.id = classBlock.subjectName + classBlock.date.replace(".000", "");
      addClassBlock(classBlock);
      break;

    case "Evento u":
      event.name = formData.get("name")?.toString() || "";
      event.color = formData.get("color")?.toString() || "";
      event.notes = formData.get("notes")?.toString() || "";
      event.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      event.blockId = formData.get("id")?.toString() || "";
      event.subjectId = formData.get("subjectId")?.toString() || "";
      event.completed = formData.get("completed")?.toString() === "on" ? true : false;

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(event.blockId) % 8;
        const startHour = (Number(event.blockId) - dayIndex - 24) / 8;
        const minutes = formData.get("datetime")?.toString().split(":")[1];
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":" + minutes?.padStart(2, "0") + ":00Z";
        event.date = date;
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        event.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        event.blockId = blockId.toString();
      }
      event.id = event.subjectName + event.date.replace(".000", "");
      updateEvent(event);
      break;

    case "Bloque de estudio u":
      studyBlock.blockId = formData.get("id")?.toString() || "";
      studyBlock.name = formData.get("name")?.toString() || "";
      studyBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      studyBlock.time = formData.get("time")?.toString() || "";
      studyBlock.completed = Number(formData.get("completed")?.toString()) || 0;
      studyBlock.subjectId = formData.get("subjectId")?.toString() || "";

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(studyBlock.blockId) % 8;
        const startHour = (Number(studyBlock.blockId) - dayIndex - 24) / 8;
        const minutes = formData.get("date")?.toString().split(":")[1];
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":" + minutes?.padStart(2, "0") + ":00Z";
        studyBlock.date = date;
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        studyBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        studyBlock.blockId = blockId.toString();
      }
      studyBlock.id = studyBlock.subjectName + studyBlock.date.replace(".000", "");
      console.log(studyBlock);
      updateStudyBlock(studyBlock);
      break;

    case "Bloque de clase u":
      classBlock.blockId = formData.get("id")?.toString() || "";
      classBlock.name = formData.get("name")?.toString() || "";
      classBlock.subjectName = formData.get("subjectName")?.toString().split("-")[0] || "";
      const minutes = formData.get("date")?.toString().split(":")[1];
      classBlock.time = formData.get("time")?.toString() || "";
      classBlock.completed = Number(formData.get("completed")?.toString()) || 0;
      classBlock.subjectId = formData.get("subjectId")?.toString() || "";

      if (formData.get("id")?.toString() != "0") {
        const dayIndex = Number(classBlock.blockId) % 8;
        const startHour = (Number(classBlock.blockId) - dayIndex - 24) / 8;
        const year = datesOfWeek[dayIndex - 1].toString().split("-")[0];
        const month = datesOfWeek[dayIndex - 1].toString().split("-")[1];
        const date = year + "-" + month.toString().padStart(2, "0") + "-" + currentDays[dayIndex - 1].toString().padStart(2, "0") + "T" + startHour.toString().padStart(2, "0") + ":" + minutes?.padStart(2, "0") + ":00Z";
        classBlock.date = date;
      } else {
        const { hours, dayOfWeek } = getDateValues(
          formData.get("datetime")?.toString()
        );
        classBlock.date = formData.get("datetime")?.toString() + ":00Z" || "";
        const hour = 24 + dayOfWeek;
        const blockId = hour + hours * 8;
        classBlock.blockId = blockId.toString();
      }
      classBlock.id = classBlock.subjectName + classBlock.date.replace(".000", "");
      updateClassBlock(classBlock);
      break;
  }

  return redirect("/main");
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
    { rel: "stylesheet", href: pomodoroStyles },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" }
  ];
}
