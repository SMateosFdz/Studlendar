import { NavLink } from "@remix-run/react";

function Navigation({currentPage}) {
    let content;
  switch(currentPage){
    case "/":
        content = <nav id="full-navigation">
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

          <h1 id="nav-title">Studlendar</h1>

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
      </nav>;
    break;

    case "/proposals":
        content = <nav id="full-navigation">
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

          <h1 id="nav-title">Studlendar</h1>

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
      </nav>;
    break;
  }

  return content;
}

export default Navigation;
