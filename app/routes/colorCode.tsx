import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";

import styles from "~/styles/colorCode.css";

export const meta: MetaFunction = () => {
  return [{ title: "Studlendar" }];
};

export default function ColorCode() {
  return (
    <>
      <header>
        <h1>Bienvenido a Studlendar</h1>
      </header>
      <main>
        <h2>Código de colores</h2>
      <Form method="post" id="colorForm">
        <label>Color de bloques de clase:</label>
        <input type="color" />
        <hr></hr>
        <label>Color de bloques de estudio:</label>
        <input type="color" />
        <hr></hr>
        <input type="submit" name="return" value="Guardar y volver"></input>
      </Form>
      </main>
      <footer>
        <Link to={"/configurationForm"}>Cancelar</Link>
      </footer>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");

  if (intent === "Guardar y volver") {
    return redirect("/configurationForm");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
