import type { ActionFunctionArgs, MetaFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getStoredSubjects, storeSubjects } from "~/data/subjects";

import styles from "~/styles/createSubject.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

export default function CreateSubject() {

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Nueva asignatura</h2>
      <form method="post" id="sessionForm">
        <label htmlFor="name">Nombre de la asignatura</label>
        <input type="text" id="name" name="name" ></input>
        <hr></hr>
        <label htmlFor="horas">
          ¿Cuántas horas a la semana quieres enfocarte en el estudio?
        </label>
        <input type="number" id="horas" name="horas" min={1} ></input>
        <hr></hr>
        <label htmlFor="sesiones">Tamaño de las sesiones de estudio</label>
        <fieldset id="sesiones" name="sesiones">
          <input type="radio" value="1" name="sesiones"></input>
          <label>1h</label>
          <input type="radio" value="2" name="sesiones"></input>
          <label>2h</label>
          <input type="radio" value="3" name="sesiones"></input>
          <label>3h</label>
          <input type="radio" value="otro" name="sesiones"></input>
          <label>Otro</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="org-sesiones">Organización de las sesiones de estudio</label>
        <select name="org-sesiones" id="org-sesiones">
          <option value="por-dia">Por día</option>
          <option value="dia-antes">Día antes</option>
          <option value="dia-despues">Día después</option>
        </select>
        <hr></hr>
        <label htmlFor="fecha-inicio">
          Fecha de inicio de la asignatura
        </label>
        <input type="date" id="fecha-inicio" name="fecha-inicio" ></input>
        <hr></hr>
        <label htmlFor="fecha-fin">
          Fecha de fin de la asignatura
        </label>
        <input type="date" id="fecha-fin" name="fecha-fin" ></input>
        <hr></hr>
        <input type="submit" name="return" value="Guardar y crear una nueva asignatura"></input>
        <input type="submit" name="return" value="Guardar y volver"></input>
      </form>
    </>
  );
}

export async function action( {request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");
  const existingSubjects = await getStoredSubjects();

  const newFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    if (key !== "return") {
      newFormData.append(key, value);
    }
  }

  newFormData.append("id", new Date().toISOString());
  const updatedSubject = existingSubjects.concat(Object.fromEntries(newFormData));
  storeSubjects(updatedSubject);

  if(intent === "Guardar y crear una nueva asignatura"){
    return redirect("/createSubject");
  }

  if(intent === "Guardar y volver"){
    return redirect("/configurationForm");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
