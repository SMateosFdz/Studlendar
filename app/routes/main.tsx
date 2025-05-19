/* eslint-disable array-callback-return */
import navStyles from "~/styles/navigation.css";
import calendarStyles from "~/styles/calendar.css";
import { getStoredSubjects } from "~/data/subjects";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getStoredStudyBlocks, storeStudyBlocks } from "~/data/studyBlocks";

export async function loader() {
  const existingSubjects = await getStoredSubjects();
  const existingStudyBlocks = await getStoredStudyBlocks();

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
  };

  return json(response);
}

export default function Main() {
  const { subjects, studyBlocks } = useLoaderData();

  // Store the values selected for each grid block (keyed by block id)
  const [selectedValues, setSelectedValues] = useState([]);
  // Track which block is currently being edited (null if none)
  const [editingBlock, setEditingBlock] = useState(false);
  const [recordHours, setRecordHours] = useState(false);
  const [subjectEvent, setSubjectEvent] = useState(false);
  const [editingId, setEditingId] = useState(0);
  // The current selection in the form dropdown
  const [currentSelection, setCurrentSelection] = useState("");
  // When a grid block is clicked, set it as editing block and load its current value
  function handleBlockClick(blockId: any) {
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

  function handleTitle(id: number) {
    let flag = false;
    let subject = "";
    if (studyBlocks.length == 0) {
      return (
        <h2 className="popup__title">
          {"Nuevo bloque de estudio - " + currentSelection}
        </h2>
      );
    } else {
      studyBlocks.map((studyBlock: { id: number; subjects: string }) => {
        if (studyBlock.id == id) {
          flag = true;
          subject = studyBlock.subjects;
        }
      });
    }
    return flag === false ? (
      <h2 className="popup__title">
        {"Nuevo bloque de estudio - " + currentSelection}
      </h2>
    ) : (
      <h2 className="popup__title">{"Bloque de estudio - " + subject}</h2>
    );
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
              <NavLink to={"/configuration"} className={"link"}>
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
                onClick={() => handleBlockClick(index + 24)}
              >
                {studyBlocks.map(
                  (studyBlock: { id: number; subjects: string }) =>
                    // eslint-disable-next-line react/jsx-key
                    studyBlock.id == index + 24 ? (
                      <p>{studyBlock.subjects}</p>
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
            {handleTitle(editingId)}
            <Form method="post">
              <input type="hidden" name="id" value={editingId} />
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
              <label htmlFor="color">
                Color asociado: 
              </label>
              <input id="color" type="color"></input>
              <hr></hr>
              <label htmlFor="fecha">
                Fecha del evento: 
              </label>
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
  const id = formData.get("id");
  const existingStudyBlocks = await getStoredStudyBlocks();

  existingStudyBlocks.map((block: any, index: number) => {
    if (block.id == id) {
      existingStudyBlocks.splice(index, 1);
    }
  });

  const userData = Object.fromEntries(formData);

  const updatedStudyBlocks = existingStudyBlocks.concat(userData);
  storeStudyBlocks(updatedStudyBlocks);

  return null;
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}
