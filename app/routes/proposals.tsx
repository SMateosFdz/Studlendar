import Navigation from "~/components/Navigation";

import navStyles from "~/styles/navigation.css";
import calendarStyles from "~/styles/calendar.css";
import proposalsStyles from "~/styles/proposals.css";
import { getStoredSubjects } from "~/data/subjects";
import { Form, json, useLoaderData } from "@remix-run/react";
import { useState } from "react";

export async function loader() {
  const existingSubjects = await getStoredSubjects();

  return json(existingSubjects);
}

export default function Proposals() {
  const subjects: Subject[] = useLoaderData();

  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
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
        <Navigation currentPage={"/proposals"} />
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
              <div className="grid-block" key={index + 24}></div>
            )
          )}
        </div>
        <div className={`proposals-visible--${isVisible}`}>
          <span className="close" id="closePopup" onClick={toggleVisibility}>
            &times;
          </span>
          <h2>Listado de propuestas</h2>
          <Form>
            {subjects.map((subject) => (
              <>
                <label>{subject.name}</label>
                <input id={subject.id} type="checkbox"></input>
                <br></br>
              </>
            ))}
            <input type="submit" value="Guardar y cerrar" onClick={toggleVisibility}></input>
          </Form>
        </div>
      </main>
    </>
  );
}



export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
    { rel: "stylesheet", href: proposalsStyles },
  ];
}

type Subject = {
  id: string;
  name: string;
  horas: string;
  sesiones: string;
};
