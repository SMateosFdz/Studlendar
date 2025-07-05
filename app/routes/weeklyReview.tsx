import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Form, Link, useLoaderData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/data/database.server';
import { getSession } from '~/sessions.server';
import { filterDates } from '~/utils/filterDates';
import styles from "~/styles/review.css";
import { addReview } from "~/data/weeklyReview.server";
import { getDaysOfWeek } from '~/utils/date';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
  scales: {
    y: {
      max: 100,
    }
  }
};


export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request);
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  const existingWeeklyReviews = await prisma.weeklyReview.findMany({
    where: { authorId: session.data.userId },
  });

  let existingStudyBlocks = [];

  const studyBlocks = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectId: subject.id },
    });
    return studyBlocks;
  });

  const allStudyBlocks = await Promise.all(studyBlocks);

  existingStudyBlocks.push(...allStudyBlocks.flat());

  existingStudyBlocks = filterDates(existingStudyBlocks, new Date());

  const response = {
    subjects: existingSubjects,
    studyBlocks: existingStudyBlocks,
    weeklyReviews: existingWeeklyReviews,
  };

  return json(response);
}




export default function SubjectReview() {
  const { subjects, studyBlocks, weeklyReviews } = useLoaderData();
  const datasets: { label: string; data: number[]; backgroundColor: string; }[] = [];
  const pendingHours = [];
  let completed = 0;
  const satisf: {}[] = [];

  subjects.map((subject) => {
    satisf.push({
      name: subject.name,
      satisf: 0,
    });
  });

  const [satisfaction, setSatisfaction] = useState(satisf);

  if (studyBlocks.length > 0) {
    subjects.map((subject) => {
      studyBlocks.map((block) => {
        const object = {
          label: "",
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: subject.id === block.subjectId ? subject.color : "",
        }
        object.label = block.name;

        const date = new Date(block.date);
        let dayOfWeek = (date.getUTCDay() + 6) % 7;
        object.data.splice(dayOfWeek, 0, block.completed);
        object.backgroundColor !== "" ? datasets.push(object) : datasets.push();
        object.backgroundColor !== "" ? pendingHours.push([block.name, (Number(block.time) * Number(block.completed)) / 100, block.time]) : pendingHours.push();
      })
    })
  }

  pendingHours.map(([blockName, hours, time]) => {
    if(hours == time){
      completed++;
    }
  })

  const [data, setData] = useState({
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: datasets,
  });

  function handleSelectionChange(event){
      setSatisfaction((prevItems) =>
      prevItems.map((item) =>
        item.name === event.target.id ? { ...item, satisf: event.target.value } : item
      )
    );
  }

  const [numbersWeek, datesOfWeek] = getDaysOfWeek(new Date());
  let doneReview = null

  datesOfWeek.map((date) => {
    weeklyReviews.map((week) => {
      if(date.toString().includes(week.date.toString().split("T")[0])){
        doneReview = week;
      }
    })
  });

  subjects.map((subject) => {
    console.log(subject.id.toString().includes("9"))
  })

  return (
    <div>
      <header>
        <h1>Studlendar - revisión semanal</h1>
      </header>
      <main>
        <h2>Estadísticas semanales (valores en porcentaje):</h2>
        <div className='chart-container' style={{ position: "relative", height: "50vh", width: "95vw" }}>
          <Bar options={options} data={data} style={{ margin: "auto", height: "50vh", width: "95vw" }} />
        </div>
        <div className='container'>
          <div className='subjectContainer'>
            <h2 className='subjectContainer__title'>Grado de satisfacción con las asignaturas</h2>
            { !(doneReview !== null) && <Form method="post">
              {subjects.map((subject) => (
                <>
                  <label htmlFor={subject.name} className='subjectContainer__label'>Satisfacción con {subject.name}:</label>
                  <input type='range' min={0} max={100} defaultValue={0} id={subject.name} name={subject.name} className='subjectContainer__input' onChange={() => handleSelectionChange(event)}></input>
                  <span>{satisfaction.find(item => item.name === subject.name)?.satisf}</span>
                </>
              ))}
              
              <input type='submit' id="volver" name="Guardar y volver"></input>
            </Form>}
            {(doneReview !== null) && <>
              <h3>Esta semana ya has hecho la revisión, estos son los valores:</h3>
              {doneReview.satisfaction.map((review) => {
                return subjects.map((subject) => (
                  subject.id.toString().includes(review[0]) ? (<>
                    <p>Satisfacción con {subject.name}: {review[1]}</p>
                  </>) : ""
                ))
            })}
            </>}
          </div>
          <div className='proposalsContainer'>
              <h2 className='proposalsContainer__title'>Estadísticas semanales</h2>
              <p>Se han completado {completed} bloques de estudio</p>
              {pendingHours.map(([blockName, hours, time]) => (
                // eslint-disable-next-line react/jsx-key
                <p>Del bloque {blockName} se han completado: {hours} / {time} horas</p>
              ))
              }
          </div>
        </div>
      </main>
      <footer>
        <Link to={"/main"}>Volver al calendario</Link>
      </footer>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const session = await getSession(request);
  let satisfaction: string[][] = [];
  const weeklyReview = {
    date: new Date().toISOString(),
    satisfaction: [],
    authorId: session.data.userId,
  }
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: session.data.userId },
  });

  existingSubjects.map((subject) => {
    satisfaction.push([subject.id, formData.get(subject.name)?.toString() || ""])
  });

  let date = new Date().toISOString();

  weeklyReview.date=  weeklyReview.date.replace(/\.\d{3}/g, "");

  weeklyReview.satisfaction = satisfaction;
  
  addReview(weeklyReview);

  return null;
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
  ];
}

