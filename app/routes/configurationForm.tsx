import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { getStoredSubjects } from "~/data/subjects";
import styles from "~/styles/configure.css";

export async function loader(){
  const existingSubjects = await getStoredSubjects();

  return existingSubjects.length;
}

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

export default function Configure() {
  const number = useLoaderData();

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Configuración de la aplicación</h2>
      <div id="sessionForm">
        <Link to="/createSubject">
          Crear nueva asignatura
        </Link>
        <Link to="/notifications">
          Configurar notificaciones
        </Link>
        <Link to="/colorCode">
          Configurar código de color
        </Link>
        <hr></hr>
        <Form method="post">
          <input
            type="submit"
            name="move"
            value= {number === 0 ? "Crea una asignatura antes de avanzar al paso siguiente" : "Guardar e ir al siguiente paso"}
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
      return redirect("/proposals");
    }
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
  ];
}
