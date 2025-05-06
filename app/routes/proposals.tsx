import Navigation from '~/components/Navigation';
import Calendar from '~/components/Calendar';

import navStyles from '~/styles/navigation.css';
import calendarStyles from '~/styles/calendar.css';
import proposalsStyles from '~/styles/proposals.css';
import { getStoredSubjects } from '~/data/subjects';
import { Form, json, useLoaderData } from '@remix-run/react';
import { useState } from 'react';

export async function loader() {
    const existingSubjects = await getStoredSubjects();

    return json(existingSubjects);
}

export function Prueba(){
    // const subjects: Subject[] = useLoaderData();
    const calendar = document.querySelectorAll(".grid-item");
    console.log(calendar[25]);
}

export default function Proposals() {
    const subjects: Subject[] = useLoaderData();

    Prueba();

    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => {
        setIsVisible((prev) => !prev);
    };

    return (
        <>
            <header>
                <Navigation currentPage={"/proposals"} />
            </header>
            <main>
                <button className={`proposals-button visible--${!isVisible}`} onClick={toggleVisibility}>Abrir listado de propuestas</button>
                <Calendar subjects={subjects} />
                <div className={`proposals-visible--${isVisible}`}>
                    <span className="close" id="closePopup" onClick={toggleVisibility}>&times;</span>
                    <h2>Listado de propuestas</h2>
                    <Form>
                        {subjects.map((subject) => (
                            <>
                                <label>{subject.name}</label>
                                <input id={subject.id} type="checkbox"></input>
                                <br></br>
                            </>
                        ))}
                    </Form>
                </div>
            </main>
        </>
    );
}


export function links() {
    return [
        { rel: "stylesheet", href: navStyles },
        { rel: "stylesheet", href: calendarStyles },
        { rel: "stylesheet", href: proposalsStyles },
    ];
}

type Subject = {
    id: string;
    name: string;
    horas: string;
    sesiones: string;
}