import type { ActionFunctionArgs} from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { logout } from "~/sessions.server";
import styles from "~/styles/logout.css";

export default function Logout(){
    return (
        <div className="body">
            <header>
                <h1>Saliendo de Studlendar...</h1>
            </header>
            <main>
                <div className="container">
                    <h2>Mucha suerte y vuelve pronto.</h2>
                    <div className="container__form">
                        <p>¿Estás seguro de querer cerrar sesión?</p>
                        <Form method="post">
                        <input type="submit" value={"Sí"}></input>
                        </Form>
                        <Link to={"/main"}><button>Cancelar</button></Link>
                    </div>
                </div>
            </main>
        </div>
    )       
}

export async function action({ request }: ActionFunctionArgs){
    return logout(request);
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
