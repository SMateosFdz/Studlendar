import type { ActionFunctionArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import styles from "~/styles/newAccount.css";
import { addUser } from "~/data/users.server";
import { prisma } from "~/data/database.server";

export default function NewAccount() {
    const data: any = useActionData();

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Crear nueva cuenta</h2>
      <Form method="post" id="sessionForm">
        <label htmlFor="nameUser">Nombre:</label>
        <input type="text" name="nameUser" id="nameUser"></input>
        <label htmlFor="password">Contraseña:</label>
        <input type="password" name="password" id="password"></input>
        <label htmlFor="password2">Repetir la contraseña:</label>
        <input type="password" name="password2" id="password2"></input>
        <button>Crear usuario</button>
      </Form>

      {data?.message && <p>{data.message}</p>}

      <Link to={"/formOne"}>Regresar a inicio</Link>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userData = Object.fromEntries(formData);

  const allUser = await prisma.user.findMany();

  if (userData.password.toString().length < 8) {
    return { message: "Contraseña invalida - debe tener por lo menos 8 caracteres" };
  }

  if(userData.password !== userData.password2){
    return {message: "Contraseñas diferentes, pruebe de nuevo."};
  }

  for(var nameComprobation of allUser){
    if(userData.nameUser === nameComprobation.nameUser){
      return { message: "Este nombre ya existe. Escoja otro." };
    }
  }

  await addUser(userData);
  return redirect("/");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}