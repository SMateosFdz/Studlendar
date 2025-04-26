


function Calendar() {
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
  const numbers = Array.from({ length: 24 }, (_, index) => index);

  return (
    <div className="grid-container">
      <div className="grid-item" key={0}></div>
      {daysOfWeek.map((day, index) => (
        <div className="grid-item" key={index + 1}>
          {day}
        </div>
      ))}
      {Array.from({ length: 192 }, (_, index) => (
        index % 8 == 0 ? <div className="grid-item" key={index + 24}>{numbers[index / 8]}:00</div> : <div className="grid-item" key={index + 24}></div>
      ))}
    </div>
  );
}
export default Calendar;