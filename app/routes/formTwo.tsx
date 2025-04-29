import type { ActionFunctionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import styles from "~/styles/formTwo.css";

export default function FormOne() {
  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Nueva asignatura</h2>
      <Form method="post" id="sessionForm">
        <label htmlFor="name">Nombre de la asignatura</label>
        <input type="text" id="name" ></input>
        <hr></hr>
        <label htmlFor="name">
          ¿Cuántas horas a la semana quieres enfocarte en el estudio?
        </label>
        <input type="number" id="name" min={1} ></input>
        <hr></hr>
        <label htmlFor="sesiones">Tamaño de las sesiones de estudio</label>
        <fieldset id="sesiones">
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
          <option value="volvo">Por día</option>
          <option value="saab">Día antes</option>
          <option value="mercedes">Día después</option>
        </select>
        <hr></hr>
        <label htmlFor="fecha-inicio">
          Fecha de inicio de la asignatura
        </label>
        <input type="date" id="fecha-inicio" ></input>
        <hr></hr>
        <label htmlFor="fecha-fin">
          Fecha de fin de la asignatura
        </label>
        <input type="date" id="fecha-fin" ></input>
        <hr></hr>
        <input type="reset" value="Reiniciar formulario"></input>
        <input type="submit" name="return" value="Guardar y crear una nueva asignatura"></input>
        <input type="submit" name="return" value="Guardar y volver al formulario"></input>
      </Form>
    </>
  );
}

export async function action( {request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");

  if(intent === "Guardar y crear una nueva asignatura"){
    return redirect("/formTwo");
  }

  if(intent === "Guardar y volver al formulario"){
    return redirect("/formOne");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
