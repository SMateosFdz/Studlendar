/* eslint-disable array-callback-return */
import navStyles from "~/styles/navigation.css";
import calendarStyles from "~/styles/calendar.css";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import { addStudyBlock } from "~/data/studyBlocks.server";

interface StudyBlock {
  blockId: string;
  name: string;
  subjectName: string;
  time: string;
  repetition: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  const existingStudyBlocks = [];

  const studyBlocks = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectName: subject.name },
    });
    return studyBlocks;
  });

  const allStudyBlocks = await Promise.all(studyBlocks);

  existingStudyBlocks.push(...allStudyBlocks.flat());

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
  };

  return json(response);
}

export default function Main() {
  const { subjects, studyBlocks } = useLoaderData();

  const [selectedValues, setSelectedValues] = useState([]);
  const [editingBlock, setEditingBlock] = useState(false);
  const [typeBlock, setTypeBlock] = useState(false);
  const [recordHours, setRecordHours] = useState(false);
  const [subjectEvent, setSubjectEvent] = useState(false);
  const [editingId, setEditingId] = useState(0);
  const [currentSelection, setCurrentSelection] = useState("");

  function handleBlockClick(blockId: any, e: Event) {
    e.stopPropagation();
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(true);
    setCurrentSelection(selectedValues[blockId] || subjects[0].name);
  }

  function handleGridBlockClick(blockId: any) {
    setEditingBlock(true);
    setEditingId(blockId);
    setTypeBlock(false);
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

  function handlePopup(id: number) {
    let form;
    let subject = "";
    let name = "";
    if (studyBlocks.length != 0) {
      studyBlocks.map((studyBlock: { blockId: number; name: string; subjectName: string; }) => {
        if (studyBlock.blockId == id) {
          name = studyBlock.name;
          subject = studyBlock.subjectName;
        }
      });
    }
    typeBlock === false
      ? (form = (
          <>
            <h2 className="popup__title">
              {"Nuevo bloque de estudio - " + currentSelection}
            </h2>
            <Form method="post">
              <input type="hidden" name="id" value={editingId} />
              <label htmlFor="name">Nombre del bloque:</label>
              <input
                type="text"
                id="name"
                name="name"
              ></input>
              <br></br>
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
              <br></br>
              <label htmlFor="time">Tiempo de estudio: </label>
              <input
                type="number"
                name="time"
                id="time"
                min={1}
                defaultValue={1}
              ></input>
              <br></br>
              <select name="repetition" id="repetition">
                <option value="no-rep">No se repite</option>
                <option value="diario">Se repite cada día</option>
                <option value="semanal">Se repite cada semana</option>
              </select>
              <br></br>
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
            <h2 className="popup__title">{"Bloque de estudio - " + name}</h2>
            <Form method="post">
              <input type="hidden" name="id" value={editingId} />
              <label htmlFor="name">Nombre del bloque:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder={name}
              ></input>
              <br></br>
              <label htmlFor="subjectName">Asignatura:</label>
              <input
                id="subjectName"
                name="subjectName"
                value={subject}
                readOnly
              ></input>
              <br></br>
              <label htmlFor="time">Tiempo de estudio: </label>
              <input
                type="number"
                name="time"
                id="time"
                min={1}
                defaultValue={1}
              ></input>
              <br></br>
              <select name="repetition" id="repetition">
                <option value="no-rep">No se repite</option>
                <option value="diario">Se repite cada día</option>
                <option value="semanal">Se repite cada semana</option>
              </select>
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
        <nav id="full-navigation">
          <ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/pomodoro"} className={"link"}>
                Empezar pomodoro
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to={"/studyMode"} className={"link"}>
                Modo estudio
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
              <NavLink to={"/configurationForm"} className={"link"}>
                Configuración
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <div className="grid-container">
          <div className="grid-item" key={0}></div>
          {daysOfWeek.map((day, index) => (
            <div className="grid-item" key={index + 1}>
              <p>{day}</p>
            </div>
          ))}
          {Array.from({ length: 192 }, (_, index) =>
            index % 8 == 0 ? (
              <div className="grid-item" key={index + 24}>
                <p>{numbers[index / 8]}:00</p>
              </div>
            ) : (
              <div
                className="grid-block"
                key={index + 24}
                onClick={() => handleGridBlockClick(index + 24)}
              >
                {studyBlocks.map(
                  (studyBlock: { blockId: number; name: string }) =>
                    // eslint-disable-next-line react/jsx-key
                    studyBlock.blockId == index + 24 ? (
                      <div
                        className="block"
                        onClick={(e) => handleBlockClick(index + 24, e)}
                      >
                        {studyBlock.name}
                      </div>
                    ) : (
                      selectedValues[index + 24]
                    )
                )}
              </div>
            )
          )}
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
              <input name="hours" id="hours" type="number"></input>
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
              <label htmlFor="name">Nombre del evento: </label>
              <input type="text" id="name" name="name"></input>
              <hr></hr>
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
              <label htmlFor="color">Color asociado:</label>
              <input id="color" type="color"></input>
              <hr></hr>
              <label htmlFor="fecha">Fecha del evento:</label>
              <input type="date" id="fecha" name="fecha"></input>
              <hr></hr>
              <label htmlFor="notas">Notas: </label>
              <br></br>
              <textarea></textarea>
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

  let studyBlock: StudyBlock = {
    blockId: "",
    name: "",
    subjectName: "",
    time: "",
    repetition: "",
  };

  studyBlock.blockId = formData.get("id")?.toString();
  studyBlock.name = formData.get("name")?.toString();
  studyBlock.subjectName = formData.get("subjectName")?.toString();
  studyBlock.time = formData.get("time")?.toString();
  studyBlock.repetition = formData.get("repetition")?.toString();

  addStudyBlock(studyBlock);

  return redirect("/main");
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}
