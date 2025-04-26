import { Form, redirect  } from "@remix-run/react";

import styles from "~/styles/formOne.css";

export default function FormOne() {
  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Formulario inicial</h2>
      <Form method="post" id="sessionForm">
        <label htmlFor="curva-olvido">
          ¿Quieres enfocar el estudio basado en la Curva del Olvido?
        </label>
        <fieldset id="curva-olvido">
          <input type="radio" required value="si" name="curva-olvido"></input>
          <span>Sí</span>
          <input type="radio" required value="no" name="curva-olvido"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="pomodoro">
          ¿Quieres complementar los bloques con el método Pomodoro?
        </label>
        <fieldset id="pomodoro">
          <input type="radio" value="si" name="pomodoro"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="pomodoro"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <input type="reset" value="Reiniciar formulario"></input>
        <input type="submit" value="Guardar e ir al siguiente paso"></input>
      </Form>
    </>
  );
}

export async function action() {
    return redirect("/formTwo");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
