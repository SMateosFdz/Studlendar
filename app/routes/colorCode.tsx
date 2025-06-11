import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link } from "@remix-run/react";
import { useState } from "react";

import styles from "~/styles/colorCode.css";

export const meta: MetaFunction = () => {
  return [{ title: "Studlendar" }];
};

const colors = [
  { label: 'Red', value: '#FF5733' },
  { label: 'Green', value: '#33FF57' },
  { label: 'Blue', value: '#3357FF' },
  { label: 'Yellow', value: '#F1C40F' },
  { label: 'Purple', value: '#8E44AD' },
  { label: 'Orange', value: '#E67E22' },
];

export default function ColorCode() {
  const [selectedColorStudy, setSelectedColorStudy] = useState('');
  const [selectedColorClass, setSelectedColorClass] = useState('');
  const [selectedColorEvent, setSelectedColorEvent] = useState('');

  return (
    <>
      <header>
        <h1>Bienvenido a Studlendar</h1>
      </header>
      <main>
        <h2>Código de colores por defecto</h2>
        <Form method="post" id="colorForm">
          <label>Color de bloques de estudio:</label>
          <select
            id="color-select"
            value={selectedColorStudy}
            onChange={() => setSelectedColorStudy(event?.target.value)}
            style={{
              background: selectedColorStudy
            }}
          >
            <option value="" disabled style={{background: "white"}}>
              -- Select a color --
            </option>
            {colors.map(({ label, value }) => (
              <option key={value} value={value} style={{background: value}}>
                {label}
              </option>
            ))}
          </select>
          <hr></hr>
          <label>Color de bloques de clase:</label>
           <select
            id="color-select"
            value={selectedColorClass}
            onChange={() => setSelectedColorClass(event?.target.value)}
            style={{
              background: selectedColorClass
            }}
          >
            <option value="" disabled style={{background: "white"}}>
              -- Select a color --
            </option>
            {colors.map(({ label, value }) => (
              <option key={value} value={value} style={{background: value}}>
                {label}
              </option>
            ))}
          </select>
          <hr></hr>
          <label>Color de eventos:</label>
           <select
            id="color-select"
            value={selectedColorEvent}
            onChange={() => setSelectedColorEvent(event?.target.value)}
            style={{
              background: selectedColorEvent
            }}
          >
            <option value="" disabled style={{background: "white"}}>
              -- Select a color --
            </option>
            {colors.map(({ label, value }) => (
              <option key={value} value={value} style={{background: value}}>
                {label}
              </option>
            ))}
          </select>
          <hr></hr>
          <input type="submit" name="return" value="Guardar y volver"></input>
        </Form>
      </main>
      <footer>
        <Link to={"/configurationForm"}>Cancelar</Link>
      </footer>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("return");

  if (intent === "Guardar y volver") {
    return redirect("/configurationForm");
  }

  throw new Error("Acción desconocida");
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
