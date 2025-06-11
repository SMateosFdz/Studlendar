import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import styles from "~/styles/configure.css";

export async function loader() {
  const allSubjects = await prisma.subject.findMany();

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
        <Link className="sessionForm__link" to="/colorCode">
          <span>Configurar código de color</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-palette" viewBox="0 0 16 16">
            <path d="M8 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m4 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M5.5 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
            <path d="M16 8c0 3.15-1.866 2.585-3.567 2.07C11.42 9.763 10.465 9.473 10 10c-.603.683-.475 1.819-.351 2.92C9.826 14.495 9.996 16 8 16a8 8 0 1 1 8-8m-8 7c.611 0 .654-.171.655-.176.078-.146.124-.464.07-1.119-.014-.168-.037-.37-.061-.591-.052-.464-.112-1.005-.118-1.462-.01-.707.083-1.61.704-2.314.369-.417.845-.578 1.272-.618.404-.038.812.026 1.16.104.343.077.702.186 1.025.284l.028.008c.346.105.658.199.953.266.653.148.904.083.991.024C14.717 9.38 15 9.161 15 8a7 7 0 1 0-7 7"/>
          </svg>
        </Link>
        <br></br>
        <div className="form__container">
          <Form method="post">
          <input
            type="submit"
            name="move"
            value={
              number === 0
                ? "Crea una asignatura antes de avanzar al paso siguiente"
                : "Ir al calendario"
            }
            disabled={number === 0}
          ></input>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/>
          </svg>
        </Form>
        </div>
      </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  let selectedValues = [];
  let flag = false;
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const allSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
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

  selectedValues.forEach((value) => {
    if(value){
      flag = true;
    }
  })

  if (flag) {
    return redirect("/proposals");
  } else {
    return redirect("/main");
  }
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
