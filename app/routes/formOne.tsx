import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import React from "react";
import { getStoredSubjects } from "~/data/subjects";

import styles from "~/styles/formOne.css";

export async function loader(){
  const existingSubjects = await getStoredSubjects();

  return existingSubjects.length;
}

export default function FormOne() {
  const number = useLoaderData();

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Formulario inicial</h2>
      <div id="sessionForm">
        <label htmlFor="nueva-asignatura">Crear una nueva asignatura:</label>
        <Link to="/formTwo">
          +
        </Link>
        <hr></hr>
        <Form method="post">
          <label htmlFor="momento">¿En qué momento del día eres más productivo?</label>
          <fieldset id="momento">
            <input type="checkbox" id="mañana"></input>
            <label htmlFor="mañana">Mañana</label>
            <input type="checkbox" id="tarde"></input>
            <label htmlFor="tarde">Tarde</label>
            <input type="checkbox" id="noche"></input>
            <label htmlFor="noche">Noche</label>
          </fieldset>
          <hr></hr>
          <label htmlFor="curva-olvido">
            ¿Quieres enfocar el estudio basado en la Curva del Olvido?
          </label>
          <fieldset id="curva-olvido">
            <input type="radio" required value="si" name="curva-olvido"></input>
            <label>Sí</label>
            <input type="radio" required value="no" name="curva-olvido"></input>
            <label>No</label>
          </fieldset>
          <hr></hr>
          <label htmlFor="pomodoro">
            ¿Quieres complementar los bloques con el método Pomodoro?
          </label>
          <fieldset id="pomodoro">
            <input type="radio" value="si" name="pomodoro"></input>
            <label>Sí</label>
            <input type="radio" value="no" name="pomodoro"></input>
            <label>No</label>
          </fieldset>
          <hr></hr>
          <input type="reset" value="Reiniciar formulario"></input>
          <input
            type="submit"
            name="move"
            value="Guardar e ir al siguiente paso"
            disabled={number === 0}
          ></input>
        </Form>
      </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("move");
  const existingSubjects = await getStoredSubjects();
  const number = existingSubjects.length;

  if (intent === "Guardar e ir al siguiente paso") {
    if (number !== 0) {
      return redirect("/formFour");
    } else {
      console.log(
        "No se puede avanzar sin haber creado al menos una asignatura. Actualmente: " + number
      );
      return redirect("/formOne");
    }
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
