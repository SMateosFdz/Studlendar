import { Form, Link } from "@remix-run/react";

import styles from "~/styles/formOne.css";

export default function FormOne() {
  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Configuración de notificaciones</h2>
      <Form method="post" id="sessionForm">
        <label htmlFor="not-rev-diaria">
          Notificaciones revisión diaria
        </label>
        <fieldset id="not-rev-diaria">
          <input type="radio" value="si" name="not-rev-diaria"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-rev-diaria"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="not-rev-semanal">
          Notificaciones revisión y feedback semanal
        </label>
        <fieldset id="not-rev-semanal">
          <input type="radio" value="si" name="not-rev-semanal"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-rev-semanal"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="not-comienzo-bloque">
          Notificaciones de comienzo de bloques de estudio
        </label>
        <fieldset id="not-comienzo-bloque">
          <input type="radio" value="si" name="not-comienzo-bloque"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-comienzo-bloque"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="not-comp">
          Notificaciones sobre compensación de bloques no completados
        </label>
        <fieldset id="not-comp">
          <input type="radio" value="si" name="not-comp"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-comp"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="not-periodo-est">
          Notificaciones durante períodos de estudio
        </label>
        <fieldset id="not-periodo-est">
          <input type="radio" value="si" name="not-periodo-est"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-periodo-est"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <label htmlFor="not-descansos">
          Notificaciones para descansos
        </label>
        <fieldset id="not-descansos">
          <input type="radio" value="si" name="not-descansos"></input>
          <span>Sí</span>
          <input type="radio" value="no" name="not-descansos"></input>
          <span>No</span>
        </fieldset>
        <br></br>
        <Link to=""><button>Ir al siguiente paso</button></Link>
      </Form>
    </>
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
