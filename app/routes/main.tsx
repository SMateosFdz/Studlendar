import Navigation from '~/components/Navigation';
import Calendar from '~/components/Calendar';

import navStyles from '~/styles/navigation.css';
import calendarStyles from '~/styles/calendar.css';
import { getStoredSubjects } from '~/data/subjects';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader() {
    const existingSubjects = await getStoredSubjects();

    return json(existingSubjects);
}

export default function Main(){
  const subjects: Subject[] = useLoaderData();
  
    return (
        <>
          <header>
            <Navigation currentPage={"/"} />
          </header>
          <main>
            <Calendar subjects={subjects} />
          </main>
        </>
      );
}


export function links() {return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}

type Subject = {
  id: string;
  name: string;
  horas: string;
  sesiones: string;
}