/* eslint-disable array-callback-return */
import calendarStyles from "~/styles/calendar.css";
import proposalsStyles from "~/styles/proposals.css";
import { getStoredSubjects } from "~/data/subjects";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { getStoredStudyBlocks, storeStudyBlocks } from "~/data/studyBlocks";

export function showSubjectProposals(subject: any) {
  const pool = Array.from({ length: 193 }, (_, i) => i);
  const result = [];

  for (let i = 0; i < subject.horas; i++) {
    let random;
    do {
      random = Math.floor(Math.random() * pool.length);
    } while (random % 8 === 0);
    let chosen = pool.splice(random, 1)[0];
    chosen = chosen + 24;
    result.push(chosen);
  }

  const proposal: Proposal = {
    id: subject.name,
    proposals: result,
  };

  return proposal;
}

export async function loader() {
  const existingSubjects = await getStoredSubjects();
  let selectedValues: Proposal[] = [];
  existingSubjects.map((subject: any) => {
    selectedValues.push(showSubjectProposals(subject));
  });

  return selectedValues;
}

interface Proposal {
  id: string;
  proposals: number[];
}

interface StudyBlock {
  id: string;
  subjects: string;
  time: string;
  repetition: string;
}

export default function Proposals() {
  const selectedValues: Proposal[] = useLoaderData();
  const initialSubjects: { id: string; checked: boolean }[] = [];

  const createInitialSubjects = () => {
    let i = 0;
    selectedValues.map((subject: { id: string; proposals: number[] }) => {
      i = 0;
      subject.proposals.map(() => {
        initialSubjects.push({
          id: subject.id + i,
          checked: true,
        });
        i++;
      });
    });

    return initialSubjects;
  };

  const [isVisible, setIsVisible] = useState(true);
  const [isChecked, setIsChecked] = useState(createInitialSubjects);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const handleCheckboxChange = (id: string) => {
    setIsChecked((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

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
      </header>
      <main>
        <button
          className={`proposals-button visible--${!isVisible}`}
          onClick={toggleVisibility}
        >
          Abrir listado de propuestas
        </button>
        <div className="grid-container">
          <div className="grid-item" key={0}></div>
          {daysOfWeek.map((day, index) => (
            <div className="grid-item" key={index + 1}>
              {day}
            </div>
          ))}
          {Array.from({ length: 192 }, (_, index) =>
            index % 8 == 0 ? (
              <div className="grid-item" key={index + 24}>
                {numbers[index / 8]}:00
              </div>
            ) : (
              <div className="grid-block" key={index + 24}>
                {selectedValues.map((value: any) =>
                  value.proposals.map((proposal: number, ind: number) =>
                    proposal === index + 24
                      ? isChecked.map((obj) =>
                          obj.id == value.id + ind ? (
                            obj.checked === true ? (
                              <p>{value.id}</p>
                            ) : (
                              ""
                            )
                          ) : (
                            ""
                          )
                        )
                      : ""
                  )
                )}
              </div>
            )
          )}
        </div>

        <div className={`popup-visible--${isVisible}`}>
          <div className={`proposals-visible--${isVisible}`}>
            <span className="close" id="closePopup" onClick={toggleVisibility}>
              &times;
            </span>
            <h2>Listado de propuestas</h2>
            <Form method="post">
              {selectedValues.map(
                (
                  subject: { id: string; proposals: number[] },
                  index: number
                ) => (
                  <>
                    <label htmlFor={subject.id}>{subject.id}</label>
                    {subject.proposals.map((element, index) => (
                      // eslint-disable-next-line react/jsx-key
                      <input
                        id={subject.id + index}
                        type="checkbox"
                        value={element}
                        name={subject.id + index}
                        checked={
                          isChecked.find((obj) => obj.id === subject.id + index)
                            ?.checked
                        }
                        onChange={() =>
                          handleCheckboxChange(subject.id + index)
                        }
                      ></input>
                    ))}
                    <br></br>
                  </>
                )
              )}
              <input
                type="submit"
                name="close"
                value="Guardar y cerrar"
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

  let elements: StudyBlock[] = [];

  formData.forEach((element, key) => {
    if (key.split(/(\d+)/)[0] !== "close") {
      elements.push({
        id: element.toString(),
        subjects: key.split(/(\d+)/)[0],
        time: "1",
        repetition: "semanal",
      });
    }
  });

  const existingStudyBlocks = await getStoredStudyBlocks();
  const updatedStudyBlocks = existingStudyBlocks.concat(elements);
  storeStudyBlocks(updatedStudyBlocks);

  return redirect("/main");
}

export function links() {
  return [
    { rel: "stylesheet", href: calendarStyles },
    { rel: "stylesheet", href: proposalsStyles },
  ];
}
