import { useState } from "react";
import styles from "~/styles/configuration.css";
import navStyles from "~/styles/navigation.css";
import notificationsStyles from "~/styles/notifications.css";
import colorCodeStyles from "~/styles/colorCode.css";
import Navigation from "~/components/Navigation";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

export default function Index() {
  const [flagColor, setFlagColor] = useState(false);
  const [flagNotif, setFlagNotif] = useState(false);
  const [flagCreate, setFlagCreate] = useState(false);

  const handleColorClick = () => {
    setFlagColor(!flagColor);
    setFlagNotif(false);
    setFlagCreate(false);
  };

  const handleNotifClick = () => {
    setFlagNotif(!flagNotif);
    setFlagColor(false);
    setFlagCreate(false);
  };

  const handleCreateClick = () => {
    setFlagCreate(!flagCreate);
    setFlagColor(false);
    setFlagNotif(false);
  };

  return (
    <>
      <header>
        <Navigation currentPage={"/configuration"} />
        <div className="menu">
          <button onClick={handleCreateClick}>Crear nueva asignatura</button>
          <button onClick={handleColorClick}>Código de colores</button>
          <button onClick={handleNotifClick}>Notificaciones</button>
        </div>
      </header>
      <main>
        {flagColor && (
          <>
            <h2>Código de colores</h2>
            <form id="colorForm">
              <label>Color bloque clase:</label>
              <input type="color" />
              <hr></hr>
              <input type="submit" value="Guardar cambios"></input>
            </form>
          </>
        )}

        {flagNotif && (
          <>
            <h2>Configuración de notificaciones</h2>
            <Form method="post" id="sessionForm">
              <div className="question-row">
                <label htmlFor="not-rev-diaria" className="question-label">
                  Notificaciones revisión diaria
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input
                      type="radio"
                      value="si"
                      name="not-rev-diaria"
                    ></input>
                  </label>
                  <label className="options__label">
                    No
                    <input
                      type="radio"
                      value="no"
                      name="not-rev-diaria"
                    ></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <div className="question-row">
                <label htmlFor="not-rev-semanal" className="question-label">
                  Notificaciones revisión y feedback semanal
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input
                      type="radio"
                      value="si"
                      name="not-rev-semanal"
                    ></input>
                  </label>

                  <label className="options__label">
                    No
                    <input
                      type="radio"
                      value="no"
                      name="not-rev-semanal"
                    ></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <div className="question-row">
                <label htmlFor="not-comienzo-bloque" className="question-label">
                  Notificaciones de comienzo de bloques de estudio
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input
                      type="radio"
                      value="si"
                      name="not-comienzo-bloque"
                    ></input>
                  </label>
                  <label className="options__label">
                    No
                    <input
                      type="radio"
                      value="no"
                      name="not-comienzo-bloque"
                    ></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <div className="question-row">
                <label htmlFor="not-comp" className="question-label">
                  Notificaciones sobre compensación de bloques no completados
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input type="radio" value="si" name="not-comp"></input>
                  </label>
                  <label className="options__label">
                    No
                    <input type="radio" value="no" name="not-comp"></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <div className="question-row">
                <label htmlFor="not-periodo-est" className="question-label">
                  Notificaciones durante períodos de estudio
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input
                      type="radio"
                      value="si"
                      name="not-periodo-est"
                    ></input>
                  </label>
                  <label className="options__label">
                    No
                    <input
                      type="radio"
                      value="no"
                      name="not-periodo-est"
                    ></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <div className="question-row">
                <label htmlFor="not-descansos" className="question-label">
                  Notificaciones para descansos
                </label>
                <div className="options">
                  <label className="options__label">
                    Sí
                    <input type="radio" value="si" name="not-descansos"></input>
                  </label>
                  <label className="options__label">
                    No
                    <input type="radio" value="no" name="not-descansos"></input>
                  </label>
                </div>
              </div>
              <hr></hr>
              <input type="submit" name="move" value="Guardar cambios"></input>
            </Form>
          </>
        )}

        {flagCreate && (
          <>
            <h2>Nueva asignatura</h2>
            <form method="post" id="sessionForm">
              <label htmlFor="name">Nombre de la asignatura</label>
              <input type="text" id="name" name="name"></input>
              <hr></hr>
              <label htmlFor="horas">
                ¿Cuántas horas a la semana quieres enfocarte en el estudio?
              </label>
              <input type="number" id="horas" name="horas" min={1}></input>
              <hr></hr>
              <label htmlFor="sesiones">
                Tamaño de las sesiones de estudio
              </label>
              <fieldset id="sesiones" name="sesiones">
                <input type="radio" value="1" name="sesiones"></input>
                <label>1h</label>
                <input type="radio" value="2" name="sesiones"></input>
                <label>2h</label>
                <input type="radio" value="3" name="sesiones"></input>
                <label>3h</label>
                <input type="radio" value="otro" name="sesiones"></input>
                <label>Otro</label>
              </fieldset>
              <hr></hr>
              <label htmlFor="org-sesiones">
                Organización de las sesiones de estudio
              </label>
              <select name="org-sesiones" id="org-sesiones">
                <option value="por-dia">Por día</option>
                <option value="dia-antes">Día antes</option>
                <option value="dia-despues">Día después</option>
              </select>
              <hr></hr>
              <label htmlFor="fecha-inicio">
                Fecha de inicio de la asignatura
              </label>
              <input type="date" id="fecha-inicio" name="fecha-inicio"></input>
              <hr></hr>
              <label htmlFor="fecha-fin">Fecha de fin de la asignatura</label>
              <input type="date" id="fecha-fin" name="fecha-fin"></input>
              <hr></hr>
              <input
                type="submit"
                name="return"
                value="Guardar y crear una nueva asignatura"
              ></input>
              <input
                type="submit"
                name="return"
                value="Guardar y volver"
              ></input>
              <button
                onClick={handleCreateClick}
                name="return"
                value="Cancelar"
              >
                Cancelar
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");

  if (intent === "Cancelar") {
    return null;
  }

  if (intent === "Guardar y volver") {
    return redirect("/configuration");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: notificationsStyles },
    { rel: "stylesheet", href: colorCodeStyles },
  ];
}
