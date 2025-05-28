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
            value={
              number === 0
                ? "Crea una asignatura antes de avanzar al paso siguiente"
                : "Ir al calendario"
            }
            disabled={number === 0}
          ></input>
        </Form>
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
