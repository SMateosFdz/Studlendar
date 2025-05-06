import { useState } from "react";
import { Form } from '@remix-run/react';
import { redirect } from "@remix-run/node";

function Calendar({subjects}) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = (event) => {
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
            <div
              className="grid-block"
              key={index + 24}
              id={index + 24}
              onClick={toggleVisibility}
            ></div>
          )
        )}
      </div>
      <div
        id="popup"
        className={`popup-show--${isVisible}`}
      >
        <div className={`block show--${isVisible}`}>
        <span className="close" id="closePopup" onClick={toggleVisibility}>&times;</span>
          <h2>Nuevo bloque de estudio</h2>
          <Form>
            <label htmlFor="subjects">Asignatura:</label>
            <select name="subjects" id="subjects">
              {subjects.map((subject) => (
                  <option value={subject.name}>{subject.name}</option>
              ))}
            </select>
            <br></br>
            <label htmlFor="time">Tiempo de estudio: </label>
            <input type="number" id="time" min={1}></input>
            <br></br>
            <select name="repetition" id="repetition">
              <option value="rep1">No se repite</option>
              <option value="rep2">Se repite cada día</option>
              <option value="rep3">Se repite cada semana</option>
            </select>
            <input type="submit" name="return" value="Guardar y volver" onClick={toggleVisibility}></input>
          </Form>
        </div>
      </div>
    </>
  );
}
export default Calendar;

export async function action( {request}) {
  const formData = await request.formData();
  const intent = formData.get("return");

  if(intent === "Guardar y volver"){
    return redirect("/main");
  }

  throw new Error("Acción desconocida");
}