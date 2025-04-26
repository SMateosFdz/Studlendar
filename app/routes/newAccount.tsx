import type { ActionFunctionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { getStoredUsers, storeUser } from "~/data/users";
import styles from "~/styles/newAccount.css";

export default function NewAccount() {
    const data: any = useActionData();

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Crear nueva cuenta</h2>
      <Form method="post" id="sessionForm">
        <label>Nombre:</label>
        <input type="text"></input>
        <label>Contraseña:</label>
        <input type="password"></input>
        <label>Repetir la contraseña:</label>
        <input type="password"></input>
        <button>Crear usuario</button>
      </Form>

      {data?.message && <p>{data.message}</p>}

      <Link to={"/formOne"}>Regresar a inicio</Link>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const existingUsers = await getStoredUsers();
  const userData = Object.fromEntries(formData);

  /* if (userData.name.toString().length < 5) {
    return { message: "Invalid name - must be at least 5 characters long" };
  }

  if (userData.password.toString().length < 8) {
    return { message: "Invalid password - must be at least 8 characters long" };
  } */

  for(var nameComprobation of existingUsers){
    if(userData.name === nameComprobation.name){
      return { message: "This name already exists. Choose a different one" };
    }
  }

  
  userData.id = new Date().toISOString();
  const updatedUsers = existingUsers.concat(userData);
  storeUser(updatedUsers);
  return redirect("/formOne"); // redirection of the user after saving the data, it's a good practice to have this return statement
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}