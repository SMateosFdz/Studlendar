import type { ActionFunctionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form  } from "@remix-run/react";

import styles from "~/styles/formOne.css";

export default function Notifications() {
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
          <label>Sí</label>
          <input type="radio" value="no" name="not-rev-diaria"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="not-rev-semanal">
          Notificaciones revisión y feedback semanal
        </label>
        <fieldset id="not-rev-semanal">
          <input type="radio" value="si" name="not-rev-semanal"></input>
          <label>Sí</label>
          <input type="radio" value="no" name="not-rev-semanal"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="not-comienzo-bloque">
          Notificaciones de comienzo de bloques de estudio
        </label>
        <fieldset id="not-comienzo-bloque">
          <input type="radio" value="si" name="not-comienzo-bloque"></input>
          <label>Sí</label>
          <input type="radio" value="no" name="not-comienzo-bloque"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="not-comp">
          Notificaciones sobre compensación de bloques no completados
        </label>
        <fieldset id="not-comp">
          <input type="radio" value="si" name="not-comp"></input>
          <label>Sí</label>
          <input type="radio" value="no" name="not-comp"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="not-periodo-est">
          Notificaciones durante períodos de estudio
        </label>
        <fieldset id="not-periodo-est">
          <input type="radio" value="si" name="not-periodo-est"></input>
          <label>Sí</label>
          <input type="radio" value="no" name="not-periodo-est"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="not-descansos">
          Notificaciones para descansos
        </label>
        <fieldset id="not-descansos">
          <input type="radio" value="si" name="not-descansos"></input>
          <label>Sí</label>
          <input type="radio" value="no" name="not-descansos"></input>
          <label>No</label>
        </fieldset>
        <hr></hr>
        <input type="submit" name="move" value="Guardar y volver"></input>
      </Form>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("move");

  if (intent === "Guardar y volver") {
    return redirect("/configurationForm");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
