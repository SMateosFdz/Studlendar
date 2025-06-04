/* eslint-disable array-callback-return */
import calendarStyles from "~/styles/calendar.css";
import proposalsStyles from "~/styles/proposals.css";
import { Form, redirect, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import { addStudyBlock } from "~/data/studyBlocks.server";
import { getDaysOfWeek } from "~/utils/date";
import { StudyBlock } from "~/interfaces/studyblock";

export function showSubjectProposals(subject: any) {
  const pool = Array.from({ length: 193 }, (_, i) => i);
  const result = [];

  for (let i = 0; i < subject.sessions; i++) {
    let random;
    do {
      random = Math.floor(Math.random() * pool.length);
    } while (random % 8 === 0);
    result.push(random + 24);
  }

  const proposal: Proposal = {
    id: subject.name,
    proposals: result,
  };

  return proposal;
}

export async function loader({request}: LoaderFunctionArgs) {
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  let selectedValues: Proposal[] = [];

  const values = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectName: subject.name },
    });
    if(studyBlocks.length == 0){
      const proposal = showSubjectProposals(subject);
      return proposal;
    }
  });


  let selected = await Promise.all(values);
  selectedValues.push(...selected.flat());

  selectedValues = selectedValues.filter(function(element){
    return element !== undefined;
  });

  return selectedValues;
}

interface Proposal {
  id: string;
  proposals: number[];
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
                // onClick={() => handleGridBlockClick(index + 24)}
              >
                {selectedValues.map((value: any) =>
                  value.proposals.map((proposal: number, ind: number) =>
                    proposal === index + 24
                      ? isChecked.map((obj) =>
                          obj.id == value.id + ind ? (
                            obj.checked === true ? 
                              (
                              <div
                  className="class-item"
                  style={{
                    top: `calc(3dvh + 3.4dvh * ${value.id})`,
                    /* height: `calc(${studyBlock.time} * 3.4dvh)`,
                    lineHeight: `calc(${studyBlock.time} * 1.7dvh)`, */
                    left: `calc(13dvw * (${value.id - value.id % 8 - 1}) + 3dvw)`,
                    position: "absolute",
                  }}
                  title={value.id}
                >
                  {value.id}
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
                        id={"" + index}
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
      </main>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  let elements: StudyBlock[] = [];

  formData.forEach((element, key) => {
    if (key.split(/(\d+)/)[0] !== "close") {
      const dayIndex = element.toString() % 8;
      const startHour = (element.toString() - dayIndex - 24) / 8 + 2;
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const days = getDaysOfWeek();
      
      const date = new Date(year, month, days[dayIndex - 1], startHour);
      elements.push({
        name: key.toString(),
        subjectName: key.split(/(\d+)/)[0],
        time: "1",
        repetition: "semanal",
        blockId: element.toString(),
        date: date.toDateString(),
      });
    }
  });

  elements.forEach((element) => {
    addStudyBlock(element);
  })

  if(formData.get("close") == "Guardar y volver a configuración"){
    return redirect("/configurationForm");
  } else{
    return redirect("/main");
  }
}

export function links() {
  return [
    { rel: "stylesheet", href: calendarStyles },
    { rel: "stylesheet", href: proposalsStyles },
  ];
}
