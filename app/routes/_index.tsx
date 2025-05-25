import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import styles from "~/styles/index.css";
import logo from "~/images/Studlendar.png";
import { prisma } from "~/data/database.server";
import { userId } from "~/cookies.server";

export default function Index() {
  const data: any = useActionData();

  return (
    <>
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
        <h3>¿No tienes cuenta?</h3>
        <Link to="/newAccount">Crea una nueva cuenta</Link>
      </footer>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const allUser = await prisma.user.findMany();
  const userData = Object.fromEntries(formData);

  for (var nameComprobation of allUser) {
    if (userData.nameUser.toString() === nameComprobation.nameUser) {
      if (userData.password.toString() !== nameComprobation.password) {
        return { message: "Contraseña incorrecta, prueba de nuevo" };
      } else {
        const user = await prisma.user.findFirst({
          where: { nameUser: userData.nameUser.toString() },
        });

        const allSubjects = await prisma.subject.findMany({
          where: { authorId: user?.nameUser },
        });


        const cookieHeader = request.headers.get("Cookie");
        const cookie = (await userId.parse(cookieHeader)) || {};
        
        cookie.userId = user?.nameUser;
        

        if (allSubjects.length > 0) {
          return redirect("/main", {
            headers: {
              "Set-Cookie": await userId.serialize(cookie),
            },
          });
        } else {
          return redirect("/formOne", {
            headers: {
              "Set-Cookie": await userId.serialize(cookie),
            },
          });
        }
      }
    }
  }
  return { message: "Nombre de usuario incorrecto, prueba de nuevo" };
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
