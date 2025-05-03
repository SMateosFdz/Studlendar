import { useState } from "react";

function Calendar() {
  const [isVisible, setIsVisible] = useState(false);

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
              className="grid-item"
              key={index + 24}
              id = {index + 24}
              onClick={toggleVisibility}
            ></div>
          )
        )}
      </div>
      <div id="popup" className={`popup-show--${isVisible}`} onClick={toggleVisibility}>
        <div className={`block show--${isVisible}`}>
          <h2>Nuevo bloque de estudio</h2>
          <label htmlFor="subjects">Asignatura:</label>
          <select name="subjects" id="subjects">
            <option value="asignatura1">Asignatura 1</option>
            <option value="asignatura2">Asignatura 2</option>
            <option value="asignatura3">Asignatura 3</option>
            <option value="asignatura4">Asignatura 4</option>
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
        </div>
      </div>
    </>
  );
}
export default Calendar;
