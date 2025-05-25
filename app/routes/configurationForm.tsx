import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { prisma } from "~/data/database.server";
import styles from "~/styles/configure.css";

export async function loader(){
  const allSubjects = await prisma.subject.findMany();

  return allSubjects.length;
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
        <Link className="sessionForm__link" to="/createSubject">
          Crear nueva asignatura
        </Link>
        <br></br>
        <Link className="sessionForm__link" to="/notifications">
          Configurar notificaciones
        </Link>
        <br></br>
        <Link className="sessionForm__link" to="/colorCode">
          Configurar código de color
        </Link>
        <br></br>
        <Form method="post">
          <input
            type="submit"
            name="move"
            value=
            {number === 0 ?
              "Crea una asignatura antes de avanzar al paso siguiente" : 
              "Guardar e ir al calendario"
            }
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
  const allSubjects = await prisma.subject.findMany();
  const number = allSubjects.length;

  if (intent === "Guardar e ir al siguiente paso") {
    if (number !== 0) {
      return redirect("/proposals");
    }
  } else{
    return redirect("/main");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
  ];
}
