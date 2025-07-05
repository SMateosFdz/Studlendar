/* eslint-disable array-callback-return */
import proposalsStyles from "~/styles/proposals.css";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getSession } from "~/sessions.server";
import { prisma } from "~/data/database.server";
import { addStudyBlock } from "~/data/studyBlocks.server";
import { getDaysOfWeek } from "~/utils/date";
import type { StudyBlock } from "~/interfaces/studyblock";

function getSubjectProposals(subject: any, preferences, allProposals) {
  const matrix = Array.from({ length: 200 }, (_, i) => i);
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const cols = 8;
  const rows = 25;
  const result: number[] = [];
  let lastBlock, preference, day, number;
  let prefs: number[] = [];

  const blocks = Math.floor(Number(subject.hours) / Number(subject.sessionSize));

  const pendingTime = Number(subject.hours) - blocks * Number(subject.sessionSize);

  pendingTime !== 0 ? (lastBlock = pendingTime) : lastBlock = 0;

  Object.values(preferences).map((pref, index) => {
    if (pref.length > 0) {
      prefs.push(index);
    }
  });

  const realHours = [];

  for (let i = 0; i < blocks; i++) {
    realHours.push(Number(subject.sessionSize));
  }

  lastBlock != 0 ? realHours.push(lastBlock) : realHours.push();
  let j = 0;

  for (let i = 0; i < realHours.length; i++) {
    let proposal = 0;
    let flag = true;
    do {
      flag = true;
      do {
        day = days[j];
        preference = preferences[day];
        j != 6 ? j++ : j = 0;
      } while (preference.length == 0);
      proposal = getRandomValueFromMatrix(matrix, cols, preference, j + 1, realHours[i]);
  
      // eslint-disable-next-line no-loop-func
      allProposals.map((prop: number[]) => {
        for (let i = 0; i < prop[1]; i++) {
          for(let x = 0; x < realHours[i]; x++){
            if (proposal + x * 8 == prop[0] + i * 8) {
              flag = false;
            }
          }
        }
      })


    } while (!flag);
    allProposals.push([proposal, realHours[i]]);
    result.push([proposal, realHours[i]]);
  }

  const proposal: Proposal = {
    id: subject.id,
    name: subject.name,
    proposals: result,
  };

  console.log(proposal);

  return { proposal, allProposals };
}

function getRandomValueFromMatrix(matrix, cols, preference, col, realHours) {

  const rowRanges = {
    "mañana": { start: 9, end: 15 },
    "tarde": { start: 16, end: 20 },
    "noche": { start: 21, end: 24 },
  }

  const selectedRange = preference[Math.floor(Math.random() * preference.length)];

  const { start, end } = rowRanges[selectedRange];

  let row = Math.floor(Math.random() * (end - start + 1)) + start;

  if (row + realHours - 1 > 24) {
    row = row - (realHours - 1);
  }

  const index = (row - 1) * cols + col;

  return matrix[index] + 24;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);

  const user = await prisma.user.findUnique({
    where: { nameUser: session.data.userId },
  });

  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  const preferences = user?.preferences;

  let selectedValues: Proposal[] = [];
  let array1 = [];

  const values = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectId: subject.id },
    });
    if (studyBlocks.length == 0) {
      const { proposal, allProposals } = getSubjectProposals(subject, preferences, array1);
      array1.push(allProposals);
      return proposal;
    }
  });


  let selected = await Promise.all(values);
  selectedValues.push(...selected.flat());

  selectedValues = selectedValues.filter(function (element) {
    return element !== undefined;
  });

  return selectedValues;
}

interface Proposal {
  id: string;
  name: string;
  proposals: any;
}

export default function Proposals() {
  const selectedValues: Proposal[] = useLoaderData();
  const initialSubjects: { id: string; checked: boolean }[] = [];

  const createInitialSubjects = () => {
    let i = 0;
    selectedValues.map((subject: { name: string; proposals: number[] }) => {
      i = 0;
      subject.proposals.map(() => {
        initialSubjects.push({
          id: subject.name + i,
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

  const handleAllCheck = () => {
    isChecked.map((proposal) => {
      handleCheckboxChange(proposal.id);
    })
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
        {/* <button
          className={`proposals-button visible--${!isVisible}`}
          onClick={toggleVisibility}
        >
          Abrir listado de propuestas
        </button> */}

        <div className="container">
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
              >
                {selectedValues.map((value: any) =>
                  value.proposals.map((proposal: number[], ind: number) =>
                    proposal[0] === index + 24
                      ? isChecked.map((obj) =>
                        obj.id == value.name + ind ? (
                          obj.checked === true ?
                            (
                              <div
                                className="class-item"
                                style={{
                                  top: `calc(3dvh + 3.4dvh * ${value.name})`,
                                  height: `calc(${proposal[1]} * 3.4dvh)`,
                                  left: `calc(13dvw * (${value.name - value.name % 8 - 1}) + 3dvw)`,
                                  position: "absolute",
                                }}
                                title={value.name + ind}
                              >
                                {value.name + ind}
                              </div>
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

        <div className="proposals">
          <h2>Propuesta de bloques de estudio</h2>
            <p>Ahora se te ofrecen una serie de propuesta de bloques de estudio respecto a las asignaturas creadas
              (o que actualmente no tienen bloques de estudio). Selecciona los bloques de estudio que prefieras:</p>
            <Form method="post">
              {selectedValues.map(
                (
                  subject: { id: string; name: string; proposals: number[] },
                  index: number,
                ) => {
                  const checkedCount = subject.proposals.reduce((count, _, idx) => {
                    return isChecked.find((obj) => obj.id === subject.name + idx)?.checked
                      ? count + 1 : count;
                  }, 0);

                  return (
                    <>
                      <input type="hidden" id={"subjectId"} name={"subjectId"} value={subject.id}></input>
                      <label htmlFor={subject.name} className={`${checkedCount === 0 ? "proposal--red" : ""}`}>
                        {`${subject.name}: 
                      ${checkedCount}  
                      bloque${checkedCount == 1 ? "" : "s"} 
                      seleccionado${checkedCount == 1 ? "" : "s"} de ${subject.proposals.length}`}</label>
                      {subject.proposals.map((element, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <input
                          id={"" + index}
                          type="checkbox"
                          value={element}
                          name={subject.name + index}
                          checked={
                            isChecked.find((obj) => obj.id === subject.name + index)
                              ?.checked
                          }
                          onChange={() =>
                            handleCheckboxChange(subject.name + index)
                          }
                        ></input>
                      ))}
                      <hr></hr>
                    </>)
                }
              )}
              <input
                type="button"
                value="Seleccionar todos"
                onClick={handleAllCheck}
              ></input>
              <br></br>
              <input
                type="submit"
                name="close"
                value="Guardar y volver a configuración"
              ></input>
              <input
                type="submit"
                name="close"
                value="Guardar e ir al calendario"
              ></input>
            </Form>
        </div>
        </div>
        
        {/* <div className={`popup-visible--${isVisible}`}>
          <div className={`proposals-visible--${isVisible}`}>
            <span className="close" id="closePopup" onClick={toggleVisibility}>
              &times;
            </span>
            <h2>Propuesta de bloques de estudio</h2>
            <p>Ahora se te ofrecen una serie de propuesta de bloques de estudio respecto a las asignaturas creadas
              (o que actualmente no tienen bloques de estudio). Selecciona los bloques de estudio que prefieras:</p>
            <Form method="post">
              {selectedValues.map(
                (
                  subject: { id: string; name: string; proposals: number[] },
                  index: number,
                ) => {
                  const checkedCount = subject.proposals.reduce((count, _, idx) => {
                    return isChecked.find((obj) => obj.id === subject.name + idx)?.checked
                      ? count + 1 : count;
                  }, 0);

                  return (
                    <>
                      <input type="hidden" id={"subjectId"} name={"subjectId"} value={subject.id}></input>
                      <label htmlFor={subject.name} className={`${checkedCount === 0 ? "proposal--red" : ""}`}>
                        {`${subject.name}: 
                      ${checkedCount}  
                      bloque${checkedCount == 1 ? "" : "s"} 
                      seleccionado${checkedCount == 1 ? "" : "s"} de ${subject.proposals.length}`}</label>
                      {subject.proposals.map((element, index) => (
                        // eslint-disable-next-line react/jsx-key
                        <input
                          id={"" + index}
                          type="checkbox"
                          value={element}
                          name={subject.name + index}
                          checked={
                            isChecked.find((obj) => obj.id === subject.name + index)
                              ?.checked
                          }
                          onChange={() =>
                            handleCheckboxChange(subject.name + index)
                          }
                        ></input>
                      ))}
                      <hr></hr>
                    </>)
                }
              )}
              <input
                type="button"
                value="Seleccionar todos"
                onClick={handleAllCheck}
              ></input>
              <br></br>
              <input
                type="submit"
                name="close"
                value="Guardar y volver a configuración"
              ></input>
              <input
                type="submit"
                name="close"
                value="Guardar e ir al calendario"
              ></input>
            </Form>
          </div>
        </div> */}
      </main>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  let elements: StudyBlock[] = [];
  let subjectId = "";

  formData.forEach((element, key) => {
    if (key.split(/(\d+)/)[0] !== "close") {
      if (key === "subjectId") {
        subjectId = element.toString();
      } else {
        const dayIndex = Number(element.toString().split(",")[0]) % 8;
        const startHour = (Number(element.toString().split(",")[0]) - dayIndex - 24) / 8 + 2;
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const days = getDaysOfWeek(new Date());
        const date = new Date(year, month, days[0][dayIndex - 1], startHour);

        elements.push({
          id: key.split(/(\d+)/)[0] + date.toISOString().replace(".000", ""),
          name: key.toString(),
          subjectId: subjectId,
          time: element.toString().split(",")[1],
          blockId: element.toString().split(",")[0],
          subjectName: key.split(/(\d+)/)[0],
          date: date.toISOString().replace(".000", ""),
          notes: "",
          completed: 0,
        });
      }
    }
  });



  elements.forEach((element) => {
    addStudyBlock(element);
  })

  if (formData.get("close") == "Guardar y volver a configuración") {
    return redirect("/configurationForm");
  } else {
    return redirect("/main");
  }
}

export function links() {
  return [
    { rel: "stylesheet", href: proposalsStyles },
  ];
}
