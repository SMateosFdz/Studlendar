import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { addSubject } from "~/data/subjects.server";
import styles from "~/styles/createSubject.css";
import { prisma } from "~/data/database.server";
import { SetStateAction, useState } from "react";
import { Tooltip } from "~/components/Tooltip";
import { getSession } from "~/sessions.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

const colors = [
  { label: 'Grey', value: '#CCCCCC' },
  { label: 'Yellow', value: '#F1C40F' },
  { label: 'Orange', value: '#FE9D5E' },
  { label: 'Red', value: '#FF3A3A' },
  { label: 'Green', value: '#33FF57' },
  { label: 'Blue', value: '#023E8A' },
  { label: 'Purple', value: '#CB5EFE' },
];

export default function CreateSubject() {
  const data: any = useActionData();
  const [selectedColor, setSelectedColor] = useState('');
  const [colorInput, setColorInput] = useState(false);
  const [sessionSize, setSessionSize] = useState(0.5);

  function handleSelectedColor(colorValue: string, inputFlag: boolean){
    setSelectedColor(colorValue);
    setColorInput(inputFlag);
  }

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Nueva asignatura</h2>
      <form method="post" id="sessionForm">
        <label htmlFor="name">Nombre de la asignatura</label>
        <input type="text" id="name" name="name" required></input>
        <hr></hr>
        <label htmlFor="hours">
          ¿Cuántas horas a la semana quieres enfocarte en el estudio?
        </label>
        <input type="number" id="hours" name="hours" min={1} required></input>
        <hr></hr>
        <label htmlFor="sessionSize">Tamaño de las sesiones de estudio: {sessionSize} horas</label>
        <input type="range" id="sessionSize" name="sessionSize" min={0.5} max={6} step={0.5} defaultValue={0.5} onChange={() => setSessionSize(event?.target.value)}></input>
        <hr></hr>
        <label htmlFor="sessionOrg">Organización de las sesiones de estudio
          <Tooltip content={"Esta opción permite establecer los bloques de estudio en función de los bloques de clase"} placement="right"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
          </svg></Tooltip>
        </label>

        <select name="sessionOrg" id="sessionOrg" required>
          <option value="por-dia">En el día</option>
          <option value="dia-antes">Previo</option>
          <option value="dia-despues">Posterior</option>
        </select>
        <hr></hr>
        <label htmlFor="initialDate">
          Fecha de inicio de la asignatura
        </label>
        <input type="date" id="initialDate" name="initialDate" required></input>
        <hr></hr>
        <label htmlFor="endDate">
          Fecha de fin de la asignatura
        </label>
        <input type="date" id="endDate" name="endDate" required></input>
        <hr></hr>
        <label>Color asociado a la asignatura:</label>
        <div className="color-container">
          <select
            id="color"
            name="color"
            value={selectedColor}
            onChange={() => handleSelectedColor(event?.target.value, false)}
            style={{
              background: selectedColor,
              color: selectedColor === "#023E8A" ? "white" : "black",
              border: `2px solid ${selectedColor === "#023E8A" ? "white" : "black"}`,
            }}
          >
            <option value="" disabled style={{ background: "white" }}>
              -- Selecciona un color --
            </option>
            {colors.map(({ label, value }) => (
              <option key={value} value={value} style={{ background: value, color: value === "#023E8A" ? "white" : "black" }}>
                {label}
              </option>
              
            ))}
            <option value={selectedColor} hidden={!colorInput} style={{ background: "white" }}>
              Otro color
            </option>
          </select>
          <button type="button" id="add-color-button" aria-label="Add a new color" title="Add a new color" onClick={() => setColorInput(!colorInput)}>
            Elige otro color
          </button>
          {colorInput && (<input type="color" id="color" name="color" aria-label="Choose a new color to add to the palette" onChange={() => handleSelectedColor(event?.target.value, true)}/>)}
        </div>
        <hr></hr>
        <input type="submit" name="return" value="Guardar y crear una nueva asignatura"></input>
        <input type="submit" name="return" value="Guardar y avanzar a propuestas"></input>
        <input type="submit" name="return" value="Guardar e importar fichero con eventos"></input>
      </form>
      <footer>
        {data?.message && <p>{data.message}</p>}
        <Link to={"/configurationForm"}>Cancelar</Link>
      </footer>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");
  const subjectData = Object.fromEntries(formData);
  const session = await getSession(request);
  let sameName = false;

  if (intent === "Cancelar") {
    return redirect("/configurationForm");
  }

  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  existingSubjects.forEach((subject) => {
    if (subject.name == subjectData.name.toString()) {
      sameName = true;
    }
  })

  if (sameName) {
    return { message: "El nombre de esta asignatura ya existe. Escoja otro" };
  }

  const [year, month, day] = subjectData.initialDate.toString().split("-");
  const [year2, month2, day2] = subjectData.endDate.toString().split("-");

  if (year > year2) {
    return { message: "La año de fin debe ser mayor que la de inicio" };
  } else {
    if (year == year2) {
      if (month > month2) {
        return { message: "El mes de fin debe ser mayor que la de inicio" };
      }
    } else {
      if (month == month2) {
        if (day >= day2) {
          return { message: "El día de fin debe ser mayor que la de inicio" };
        }
      }
    }
  }

  const newData = Object.assign({}, subjectData, { author: session.get("userId") });

  if (intent === "Guardar y crear una nueva asignatura") {
    addSubject(newData);
    return redirect("/createSubject");
  }

  if (intent === "Guardar y avanzar a propuestas") {
    addSubject(newData);
    return redirect("/proposals");
  }

  if (intent === "Guardar e importar fichero con eventos") {
    addSubject(newData);
    return redirect("/importFile");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
