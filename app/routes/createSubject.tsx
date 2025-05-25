import type { ActionFunctionArgs,  MetaFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { addSubject } from "~/data/subjects.server";
import styles from "~/styles/createSubject.css";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

export default function CreateSubject() {
  const data: any = useActionData();
  
  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Nueva asignatura</h2>
      <form method="post" id="sessionForm">
        <label htmlFor="name">Nombre de la asignatura</label>
        <input type="text" id="name" name="name" required></input>
        <hr></hr>
        <label htmlFor="horas">
          ¿Cuántas horas a la semana quieres enfocarte en el estudio?
        </label>
        <input type="number" id="horas" name="horas" min={1} required></input>
        <hr></hr>
        <label htmlFor="sessions">Tamaño de las sesiones de estudio</label>
        <fieldset id="sessions" name="sessions">
          <input type="radio" value="1" name="sessions" required></input>
          <label>1h</label>
          <input type="radio" value="2" name="sessions"></input>
          <label>2h</label>
          <input type="radio" value="3" name="sessions"></input>
          <label>3h</label>
          <input type="radio" value="otro" name="sessions"></input>
          <label>Otro</label>
        </fieldset>
        <hr></hr>
        <label htmlFor="sessionOrg">Organización de las sesiones de estudio</label>
        <select name="sessionOrg" id="sessionOrg" required>
          <option value="por-dia">Por día</option>
          <option value="dia-antes">Día antes</option>
          <option value="dia-despues">Día después</option>
        </select>
        <hr></hr>
        <label htmlFor="initialDate">
          Fecha de inicio de la asignatura
        </label>
        <input type="date" id="initialDate" name="initialDate" required></input>
        <hr></hr>
        <label htmlFor="endDate">
          Fecha de fin de la asignatura
        </label>
        <input type="date" id="endDate" name="endDate" required></input>
        <hr></hr>
        <input type="submit" name="return" value="Guardar y crear una nueva asignatura"></input>
        <input type="submit" name="return" value="Guardar y avanzar a propuestas"></input>
      </form>
      {data?.message && <p>{data.message}</p>}
      <Link to={"/configurationForm"}>Cancelar</Link>
    </>
  );
}

export async function action( {request}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");
  const subjectData = Object.fromEntries(formData);
  const cookie = await userId.parse(request.headers.get("Cookie"));
  let sameName = false;
  

  if (intent === "Cancelar") {
    return redirect("/configurationForm");
  }

  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  existingSubjects.forEach((subject) => {
    if(subject.name == subjectData.name.toString()){
      sameName = true;
    }
  })

  if(sameName){
    return { message: "El nombre de esta asignatura ya existe. Escoja otro" };
  }

  const [year, month, day] = subjectData.initialDate.toString().split("-");
  const [year2, month2, day2] = subjectData.endDate.toString().split("-");

  if(year > year2){
    return { message: "La año de fin debe ser mayor que la de inicio" };
  } else{
    if(year == year2){
      if(month > month2){
       return { message: "El mes de fin debe ser mayor que la de inicio" };
      }
    }else {
      if(month == month2){
        if(day >= day2){
          return { message: "El día de fin debe ser mayor que la de inicio" };
        }
      }
    }
  }

  const newData = Object.assign({}, subjectData, { author: cookie.userId});

  if(intent === "Guardar y crear una nueva asignatura"){
    addSubject(newData);
    return redirect("/createSubject");
  }

  if(intent === "Guardar y avanzar a propuestas"){
    addSubject(newData);
    return redirect("/proposals");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
