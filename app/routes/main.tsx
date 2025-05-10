import Navigation from "~/components/Navigation";

import navStyles from "~/styles/navigation.css";
import calendarStyles from "~/styles/calendar.css";
import { getStoredSubjects } from "~/data/subjects";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getStoredStudyBlocks, storeStudyBlocks } from "~/data/studyBlocks";


export async function loader() {
  const existingSubjects = await getStoredSubjects();
  const existingStudyBlocks = await getStoredStudyBlocks();

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
  }

  return json(response);
}

export default function Main() {
  const {subjects, studyBlocks } = useLoaderData();

  // Store the values selected for each grid block (keyed by block id)
  const [selectedValues, setSelectedValues] = useState([]);
  // Track which block is currently being edited (null if none)
  const [editingBlock, setEditingBlock] = useState(false);
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
  function handleSelectionChange(e) {
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
        <Navigation currentPage={"/"} />
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
                {studyBlocks.map((studyBlock: { id: number; subjects: string; }) => 
                  // eslint-disable-next-line react/jsx-key
                  studyBlock.id == index + 24 ? (<p>{studyBlock.subjects}</p>): (selectedValues[index+24])
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
            <h2>Nuevo bloque de estudio</h2>
            <Form method="post" /* onSubmit={handleFormSubmit} */>
              <input type="hidden" name="id" value={editingId}/>
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
              <input type="number" name="time" id="time" min={1} defaultValue={1}></input>
              <br></br>
              <select name="repetition" id="repetition">
                <option value="rep1">No se repite</option>
                <option value="rep2">Se repite cada día</option>
                <option value="rep3">Se repite cada semana</option>
              </select>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
                onClick={handleFormSubmit}
              ></input>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const existingUsers = await getStoredStudyBlocks();
  const userData = Object.fromEntries(formData);

  const updatedStudyBlocks = existingUsers.concat(userData);
  storeStudyBlocks(updatedStudyBlocks);

  return null;
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}
