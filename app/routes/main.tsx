import Navigation from '~/components/Navigation';
import Calendar from '~/components/Calendar';

import navStyles from '~/styles/Navigation.css';
import calendarStyles from '~/styles/Calendar.css';

export default function Main(){
    return (
        <>
          <header>
            <Navigation />
          </header>
          <main>
            <Calendar />
          </main>
        </>
      );
}


export function links() {return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: calendarStyles },
  ];
}