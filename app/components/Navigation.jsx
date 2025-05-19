import { NavLink } from "@remix-run/react";

function Navigation({ currentPage }) {
  let content;
  switch (currentPage) {

    case "/proposals":
      content = (
        <header>
          <h1 id="title">Studlendar</h1>
          <nav id="full-navigation">
            <ul className="navigation">
              <li className="nav-item">
                <NavLink to={"/"} className={"link"}>
                  Empezar pomodoro
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/"} className={"link"}>
                  Modo estudio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/"} className={"link"}>
                  Apuntar horas de estudio
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to={"/"} className={"link"}>
                  Configuración
                </NavLink>
              </li>
            </ul>
          </nav>
        </header>
      );
      break;

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

  }

  return content;
}

export default Navigation;
