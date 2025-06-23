
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, json, Link, redirect, useActionData } from "@remix-run/react";
import nodemailer from "nodemailer";
import { useState } from "react";
import Email from "~/components/email";
import { prisma } from "~/data/database.server";
import { updateUser } from "~/data/users.server";
import styles from "~/styles/resetPassword.css";

export async function loader() {
  return json({
    ENV: {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
    }
  })
}

export default function ResetPassword() {
  const actionData = useActionData();

  const [passwordForm, setPasswordForm] = useState(false);
  const [emailForm, setEmailForm] = useState(true);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(true);

  function handleCodeChange() {
    if (event?.target.value == actionData?.code) {
      setPasswordForm(true);
    } else {
      setPasswordForm(false);
    }
  }

  function handleSubmit() {
    setEmailForm(false);
  }

  function isValidEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
      setValidEmail(false);
    } else {
      setValidEmail(true);
      setEmail(email);
    }
  }

  return (
    <div>
      <header>
        <h1>Studlendar: Recuperación de contraseña</h1>
      </header>
      <main>
        <div className="containerRecovery">
          <p>Para recuperar su contraseña, introduzca su correo electrónico.</p>
          <p>Se le enviará un código al correo para que pueda actualizar su contraseña.</p>
          {(<Form method="post">
            <label>Introduzca su dirección de correo:</label>
            <input type="email" id="to" name="to" required onChange={() => isValidEmail(event?.target.value)}></input>
            {!validEmail && (<p className="email--error">Se debe introducir una dirección de correo válida</p>)}
            <button type="submit" onClick={handleSubmit} disabled={!validEmail}>Pedir código para recuperar contraseña</button>
          </Form>)}
          {actionData?.message == "success" && (
            <Form method="post">
              {!passwordForm && (<><label>Introduzca el código recibido al correo:</label>
                <input type="text" id="code" name="code" required onInput={handleCodeChange}></input>
                <button type="submit" >Cambiar su contraseña</button></>)}
              {passwordForm && (
                <>
                  <input type="hidden" id="email" name="email" value={email} aria-hidden="true"></input>
                  <label htmlFor="password">Contraseña:</label>
                  <input type="password" name="password" id="password"></input>
                  <label htmlFor="password2">Repetir la contraseña:</label>
                  <input type="password" name="password2" id="password2"></input>
                  <button type="submit" >Cambiar su contraseña</button>
                </>

              )}
            </Form>
          )}
          <Link to={"/"}>Cancelar</Link>
          {actionData?.error && (
            <p className="email--error">{actionData.error}</p>
          )}
        </div>
      </main>
      <footer>

      </footer>
    </div>
  );
}

function generateRandomCode(length = 6) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charsetLength = charset.length;
  // Use crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charsetLength];
    }
  } else {
    // Fallback to Math.random (less secure)
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charsetLength);
      result += charset.charAt(randomIndex);
    }
  }
  return result;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const to = formData.get("to")?.toString();
  const pass1 = formData.get("password")?.toString();
  const pass2 = formData.get("password2")?.toString();
  const email = formData.get("email")?.toString();

  if (to) {
    const user = await prisma.user.findFirst({
      where: { email: to },
    });

    if (user === null) {
      return json({ error: "email no asociado a una cuenta de Studlendar. Introduzca el que usó para crear su cuenta." })
    }

    const transporter = Email();

    const code = generateRandomCode();

    const subject = "Recuperación de contraseña";
    const message = `
      Este es un mensaje automático de la aplicación Studlendar.
      Este mensaje es para la recuperación de la contraseña de su cuenta.
      El código para recuperar la contraseña es el siguiente: ${code}
      <br/>
      Si no ha pedido la recuperación de la contraseña, ignore este mensaje.
    `;

    try {
      transporter.sendMail({
        from: '"Recuperación de contraseña" <studlendar@gmail.com>', // sender address
        to,
        subject,
        text: message,
        html: `
      <h1>Recuperación de contraseña de Studlendar</h1>
      <p>${message}</p>
      `,
      });

      return json({ message: "success", code: code })
    } catch (error) {
      return json({ error: error.message }, { status: 500 });
    }
  }else{
    if(pass1 !== pass2){
      return {message: "Contraseñas diferentes, pruebe de nuevo."};
    }

    const bcrypt = require('bcryptjs');
    
    const newPass = bcrypt.hashSync(pass1, 8);

    const userData = {
      email: email,
      password: newPass,
    };

    await updateUser(userData);
    return redirect("/");
  }


}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}


