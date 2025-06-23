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
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

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
            <input className="day-btn" id="monday" type="checkbox" onChange={() => handleCheckboxChange("monday")} />
            <label className="day-label" htmlFor="monday">L</label>

            <input className="day-btn" id="tuesday" type="checkbox" onChange={() => handleCheckboxChange("tuesday")} />
            <label className="day-label" htmlFor="tuesday">M</label>

            <input className="day-btn" id="wednesday" type="checkbox" onChange={() => handleCheckboxChange("wednesday")} />
            <label className="day-label" htmlFor="wednesday">X</label>

            <input className="day-btn" id="thursday" type="checkbox" onChange={() => handleCheckboxChange("thursday")} />
            <label className="day-label" htmlFor="thursday">J</label>

            <input className="day-btn" id="friday" type="checkbox" onChange={() => handleCheckboxChange("friday")} />
            <label className="day-label" htmlFor="friday">V</label>

            <input className="day-btn" id="saturday" type="checkbox" onChange={() => handleCheckboxChange("saturday")} />
            <label className="day-label" htmlFor="saturday">S</label>

            <input className="day-btn" id="sunday" type="checkbox" onChange={() => handleCheckboxChange("sunday")} />
            <label className="day-label" htmlFor="sunday">D</label>
          </fieldset>
          <hr></hr>
          {checkedDays.map((day) => {
            if (day.checked) {
              return (
                <>
                  <label htmlFor={`momento-${day.id}`} id={`momento-${day.id}`}>¿En qué momento del día prefieres los bloques de estudio para el {day.id.id}?</label>
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
    "monday": [],
    "tuesday": [],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": [],
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
