import { NavLink } from "@remix-run/react";

function Navigation({ currentPage }) {
  let content;
  switch (currentPage) {
    case "/pomodoro":
      content = (
        <header>
          <h1 id="title">Studlendar</h1>
          <nav id="full-navigation">
          <ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/main"} className={"link"}>
                Volver al calendario
              </NavLink>
            </li>
          </ul>
        </nav>
        </header>
      );
      break;
    
    case "/configuration":
      content = (
        <header>
          <h1 id="title">Studlendar</h1>
          <nav id="full-navigation">
          <ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/main"} className={"link"}>
                Volver al calendario
              </NavLink>
            </li>
          </ul>
        </nav>
        </header>
      );
      break;
    
    case "/study-mode":
      content = (
        <header>
          <h1 id="title">Studlendar</h1>
          <nav id="full-navigation">
          <ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/main"} className={"link"}>
                Volver al calendario
              </NavLink>
            </li>
          </ul>
        </nav>
        </header>
      );
      break;

      case "/importFile":
      content = (
        <header>
          <h1 id="title">Studlendar</h1>
          <nav id="full-navigation">
          <ul className="navigation">
            <li className="nav-item">
              <NavLink to={"/configurationForm"} className={"link"}>
                Volver a configuración
              </NavLink>
            </li>
          </ul>
          </nav>
          <h2 id="subtitle">Importar fichero ICS y extraer eventos</h2>
        </header>
      );
      break;
  }

  return content;
}

export default Navigation;
