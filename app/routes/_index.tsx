import type { ActionFunctionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { getStoredUsers } from "~/data/users";
import styles from "~/styles/index.css";

export default function Index() {
  const data: any = useActionData();
  
  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Inicio de sesión</h2>
      <Form method="post" id="sessionForm">
        <label htmlFor="name">Nombre:</label>
        <input type="text" name="name" required></input>
        <label htmlFor="password">Contraseña:</label>
        <input type="password" name="password" required></input>
        <button>Iniciar sesión</button>
      </Form>

      {data?.message && <p>{data.message}</p>}

      <h3>¿No tienes cuenta?</h3>
      <Link to="/newAccount">Crea una nueva cuenta</Link>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const existingUsers = await getStoredUsers();
  const userData = Object.fromEntries(formData);


  for(var nameComprobation of existingUsers){
    if(userData.name.toString() === nameComprobation.name){
      if(userData.password.toString() !== nameComprobation.password){
        return { message: "Wrong password, try again" };
      }
    }
  }

  return redirect("/main"); // redirection of the user after saving the data, it's a good practice to have this return statement
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
  ];
}

