import type { LinksFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,

} from "@remix-run/react";

import appStylesHref from "~/styles/app.css";
import errorStyles from "~/styles/error.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
  { rel: "stylesheet", href: errorStyles }
];

export default function App() {

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let contentError = (<html>
    <head>
      <title>Oh no!</title>
      <Meta />
      <Links />
    </head>
    <body>
      <div className="error">
        <h1>
          Studlendar
        </h1>
        <h2>
          Error desconocido :&#40; <br/>
          Vuelva al inicio de sesión.
        </h2>
        <Link to={"/"}>Volver al inicio de sesión.</Link>
      </div>
      <Scripts />
    </body>
  </html>);

  if (error.message?.includes("sesión")) {
    contentError = (<html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="error">
          <h1>
            Studlendar
          </h1>
          <h2>
            Error de sesión :&#40; <br/>
            Por favor, vuelva al inicio de sesión.
          </h2>
          <Link to={"/"} className="error-link">Volver al inicio de sesión</Link>
        </div>
        <Scripts />
      </body>
    </html>);
  }

  return contentError;
}

