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
import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/data/database.server';
import { getSession } from '~/sessions.server';
import { filterDates } from '~/utils/filterDates';
import styles from "~/styles/review.css";

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
  };

  return json(response);
}




export default function SubjectReview() {
  const { subjects, studyBlocks } = useLoaderData();
  const datasets: { label: string; data: number[]; backgroundColor: string; }[] = [];

  const actualDay = (new Date().getUTCDay() + 6) % 7;
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const pendingHours = [];

  if (studyBlocks.length > 0) {
    subjects.map((subject) => {
      studyBlocks.map((block) => {
        const date = new Date(block.date);
        let dayOfWeek = (date.getUTCDay() + 6) % 7;
        if (actualDay == dayOfWeek) {
          const object = {
            label: "",
            data: [],
            backgroundColor: subject.id === block.subjectId ? subject.color : "",
          }
          object.label = block.name;
          object.data.push(block.completed);
          object.backgroundColor !== "" ? datasets.push(object) : datasets.push();
          object.backgroundColor !== "" ? pendingHours.push([block.name, (Number(block.time) * Number(block.completed)) / 100, block.time]) : pendingHours.push();
        }

      })
    })

  }

  const [data, setData] = useState({
    labels: [days[actualDay]],
    datasets: datasets,
  });

  return (
    <div>
      <header>
        <h1>Studlendar - revisión diaria</h1>
      </header>
      <main>
        <h2>Gráfico con los bloques de estudio completados en el día de hoy (valores en porcentaje):</h2>
        <div className='chart-container' style={{ position: "relative", height: "60vh", width: "90vw" }}>
          <Bar options={options} data={data}  style={{ margin: "auto", height: "60vh", width: "90vw" }} />
        </div>
        <div className='stats-container'>
          <h2>Estadísticas del día de hoy</h2>
          {pendingHours.map(([blockName, hours, time]) => (
            // eslint-disable-next-line react/jsx-key
            <p>Del bloque de estudio "{blockName}" se han completado: {hours} / {time} horas </p>
          ))}
        </div>
      </main>
      <footer>
        <Link to={"/main"}>Volver al calendario</Link>
      </footer>
    </div>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: styles },
  ];
}