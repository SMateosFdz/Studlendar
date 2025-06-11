import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import styles from "~/styles/formOne.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

export default function FormOne() {

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Formulario inicial</h2>
      <div id="sessionForm">
        <Form method="post">
          <label htmlFor="momento" id="momento">¿En qué momento del día prefieres los bloques de estudio?</label>
          <fieldset id="momento">
            <input type="checkbox" id="mañana"></input>
            <label htmlFor="mañana">Mañana</label>
            <input type="checkbox" id="tarde"></input>
            <label htmlFor="tarde">Tarde</label>
            <input type="checkbox" id="noche"></input>
            <label htmlFor="noche">Noche</label>
          </fieldset>
          <hr></hr>
          <label htmlFor="pomodoro">
            ¿Quieres complementar los bloques con el método Pomodoro?
          </label>
          <fieldset id="pomodoro">
            <input type="radio" required value="si" name="pomodoro"></input>
            <label>Sí</label>
            <input type="radio" required value="no" name="pomodoro"></input>
            <label>No</label>
          </fieldset>
          <hr></hr>
          <input
            type="submit"
            name="move"
            value="Guardar e ir al siguiente paso"
          ></input>
        </Form>
      </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("move");
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  if (intent === "Guardar e ir al siguiente paso") {
    if (existingSubjects.length !== 0) {
      return redirect("/configurationForm");
    }
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
