import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, redirect } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/data/database.server";
import { updateUser } from "~/data/users.server";
import { getSession } from "~/sessions.server";
import styles from "~/styles/formOne.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Studlendar" },
  ];
};

export default function FormOne() {
  const daysWeek: { id: string; checked: boolean }[] = [];
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

  const createInitialDays = () => {
    days.map((day) => {
      daysWeek.push({
        id: day,
        checked: false,
      });
    })

    return daysWeek;
  };

  const [checkedDays, setCheckedDays] = useState(createInitialDays);

  const handleCheckboxChange = (id: string) => {
    setCheckedDays((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  return (
    <>
      <h1>Bienvenido a Studlendar</h1>
      <h2>Formulario inicial</h2>
      <p>
        Sí estás aquí, es porque estás por primera vez en esta aplicación. <br/>
        Es importante que realices un cuestionario inicial antes de empezar a usar la aplicación, merece la pena. <br/>
        Con éste podrás configura la aplicación a tu gusto (siempre podrás reconfigurarla más adelante).
      </p>
      <div id="sessionForm">
        <Form method="post">
          <label>Elige los días en los que quieres bloques de estudio: </label>
          <fieldset className="days-btn-container">
            <input className="day-btn" id="lunes" type="checkbox" onChange={() => handleCheckboxChange("lunes")} />
            <label className="day-label" htmlFor="lunes">L</label>

            <input className="day-btn" id="martes" type="checkbox" onChange={() => handleCheckboxChange("martes")} />
            <label className="day-label" htmlFor="martes">M</label>

            <input className="day-btn" id="miercoles" type="checkbox" onChange={() => handleCheckboxChange("miercoles")} />
            <label className="day-label" htmlFor="miercoles">X</label>

            <input className="day-btn" id="jueves" type="checkbox" onChange={() => handleCheckboxChange("jueves")} />
            <label className="day-label" htmlFor="jueves">J</label>

            <input className="day-btn" id="viernes" type="checkbox" onChange={() => handleCheckboxChange("viernes")} />
            <label className="day-label" htmlFor="viernes">V</label>

            <input className="day-btn" id="sabado" type="checkbox" onChange={() => handleCheckboxChange("sabado")} />
            <label className="day-label" htmlFor="sabado">S</label>

            <input className="day-btn" id="domingo" type="checkbox" onChange={() => handleCheckboxChange("domingo")} />
            <label className="day-label" htmlFor="domingo">D</label>
          </fieldset>
          <hr></hr>
          {checkedDays.map((day) => {
            if (day.checked) {
              return (
                <>
                  <label htmlFor={`momento-${day.id}`} id={`momento-${day.id}`}>¿En qué momento del día prefieres los bloques de estudio para el {day.id}?</label>
                  <fieldset id={`momento-${day.id}`}>
                    <input type="checkbox" id={`mañana-${day.id}`} name={`mañana-${day.id}`}></input>
                    <label htmlFor={`mañana-${day.id}`}>Mañana</label>
                    <input type="checkbox" id={`tarde-${day.id}`} name={`tarde-${day.id}`}></input>
                    <label htmlFor={`tarde-${day.id}`}>Tarde</label>
                    <input type="checkbox" id={`noche-${day.id}`} name={`noche-${day.id}`}></input>
                    <label htmlFor={`noche-${day.id}`}>Noche</label>
                  </fieldset>
                  <hr></hr>
                </>
              )
            }
          })}
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
  let preferences = {
    "lunes": [],
    "martes": [],
    "miercoles": [],
    "jueves": [],
    "viernes": [],
    "sabado": [],
    "domingo": [],
  };

  formData.forEach((element, key) => {
    if(key.includes("-")){
      const [value, day] = key.split("-");
      preferences[day].push(value); 
    }
  });

  const session = await getSession(request);
  const user = await prisma.user.findUnique({
    where: { nameUser: session.data.userId },
  });

  updateUser(user, preferences);

  if (intent === "Guardar e ir al siguiente paso") {
    return redirect("/configurationForm");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
