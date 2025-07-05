import type { ActionFunctionArgs } from "@remix-run/node";
import {  redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import styles from "~/styles/index.css";
import logo from "~/images/Studlendar.png";
import { prisma } from "~/data/database.server";
import { createUserSession, getSession } from "~/sessions.server";

export default function Index() {
  const data: any = useActionData();

  return (
    <div className="container">
      <header>
        <h1>Bienvenido a Studlendar</h1>
      </header>

      <main>
        <h2>
          Una aplicación de calendario para estudiantes que quieran mejorar su
          organización
        </h2>
        <img src={logo} alt=""></img>
        <h3>Inicio de sesión</h3>
        <Form method="post" id="sessionForm">
          <label htmlFor="nameUser">Nombre:</label>
          <input type="text" name="nameUser" id="nameUser" required></input>
          <label htmlFor="password">Contraseña:</label>
          <input type="password" name="password" id="password" required></input>
          <button>Iniciar sesión</button>
        </Form>
        {data?.message && <div className="error">{data.message}</div>}
      </main>

      <footer>
        <h3>¿Has olvidado tu contraseña?</h3>
        <a href={"/resetPassword"}>Recuperar contraseña</a>
        <h3>¿No tienes cuenta?</h3>
        <Link to={"/newAccount"}>Crea una nueva cuenta</Link>
      </footer>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const allUser = await prisma.user.findMany();
  const userData = Object.fromEntries(formData);

  const bcrypt = require('bcryptjs');

  for (var nameComprobation of allUser) {
    if (userData.nameUser.toString() === nameComprobation.nameUser) {
      if (!bcrypt.compareSync(userData.password.toString(),nameComprobation.password)) {
        return { message: "Contraseña incorrecta, prueba de nuevo" };
      } else {
        const user = await prisma.user.findFirst({
          where: { nameUser: userData.nameUser.toString() },
        });

        const allSubjects = await prisma.subject.findMany({
          where: { authorId: user?.nameUser },
        });

        if(allSubjects.length > 0){
          return createUserSession({
            request,
            userId: userData.nameUser.toString(),
            remember: true,
            redirectTo: "/main",
          })
        } else{
          return createUserSession({
            request,
            userId: userData.nameUser.toString(),
            remember: true,
            redirectTo: "/formOne",
          })
        }
      }
    }
  }
  return { message: "Nombre de usuario incorrecto, prueba de nuevo" };
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
