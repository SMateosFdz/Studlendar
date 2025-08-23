import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { getSession, requireUserId } from "~/sessions.server";
import { prisma } from "~/data/database.server";
import styles from "~/styles/configure.css";

export async function loader({ request }: LoaderFunctionArgs) {
  let userId = await requireUserId(request);
  const allSubjects = await prisma.subject.findMany({
    where: { authorId: userId },
  });

  return allSubjects.length;
}

export const meta: MetaFunction = () => {
  return [{ title: "Studlendar" }];
};

export default function Configure() {
  const number = useLoaderData();

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Configuración de la aplicación</h2>
      <div id="sessionForm">
        <Link className="sessionForm__link" to="/createSubject">
          <span>Crear nueva asignatura</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
          </svg>
        </Link>
        <br></br>
        <Link className="sessionForm__link" to="/notifications">
          <span>Configurar notificaciones</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6"/>
          </svg>
        </Link>
        <br></br>
        <div className="form__container">
          <Form method="post">
          <button
            type="submit"
            name="move"
            disabled={number === 0}
          >{number === 0
                ? "Crea una asignatura antes de avanzar al paso siguiente"
                : "Ir al calendario"} <i className="bi bi-arrow-right"></i></button>
        </Form>
        </div>
      </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  let selectedValues = [];
  let flag = false;
  const session = await getSession(request);
  
  const allSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  const values = allSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectName: subject.name },
    });
    if (studyBlocks.length == 0) {
      return true;
    }else{
      return false;
    }
  });

  let selected = await Promise.all(values);
  selectedValues.push(...selected.flat());

  // Verification of subjects with no study blocks
  selectedValues.forEach((value) => {
    if(value){
      flag = true;
    }
  })

  // If there is a subject with no study blocks redirects to proposals route
  if (flag) {
    return redirect("/proposals");
  } else {
    return redirect("/main");
  }
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
