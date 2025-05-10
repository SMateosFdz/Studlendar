import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { getStoredUsers } from "~/data/users";
import styles from "~/styles/index.css";
import logo from "~/images/Studlendar.png";

export default function Index() {
  const data: any = useActionData();

  return (
    <>
      <header>
        <h1>Bienvenido a Studlendar</h1>
      </header>

      <main>
        <h2>Una aplicación de calendario para estudiantes que quieran mejorar su organización</h2>
        <img src={logo} alt=""></img>
        <h3>Inicio de sesión</h3>
        <Form method="post" id="sessionForm">
          <label htmlFor="name">Nombre:</label>
          <input type="text" name="name" id="name" required></input>
          <label htmlFor="password">Contraseña:</label>
          <input type="password" name="password" id="password" required></input>
          <button>Iniciar sesión</button>
        </Form>
        {data?.message && <div className="error">{data.message}</div>}
        
      </main>

      <footer>
        <h3>¿No tienes cuenta?</h3>
        <Link to="/newAccount">Crea una nueva cuenta</Link>
      </footer>
      
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const existingUsers = await getStoredUsers();
  const userData = Object.fromEntries(formData);

  for (var nameComprobation of existingUsers) {
    if (userData.name.toString() === nameComprobation.name) {
      if (userData.password.toString() !== nameComprobation.password) {
        return { message: "Contraseña incorrecta, prueba de nuevo" };
      } else{
          return redirect("/main");
      }
    }
  }
  return { message: "Nombre de usuario incorrecto, prueba de nuevo"};
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
