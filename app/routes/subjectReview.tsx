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

  if (studyBlocks.length > 0) {
    subjects.map((subject) => {
      studyBlocks.map((block) => {
        const object = {
          label: "",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          backgroundColor: subject.id === block.subjectId ? subject.color : "",
        }
        object.label = block.name;

        const date = new Date(block.date);
        let day = date.getDate() - 1;
        object.data.splice(day, 0, block.completed);
        object.backgroundColor !== "" ? datasets.push(object) : datasets.push();
      })
    })
  }

  const [data, setData] = useState({
    labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
    datasets: datasets,
  });

  return (
    <div>
      <header>
        <h1>Studlendar - revisión por asignatura</h1>
      </header>
      <main>
        <h2>Estadísticas por asignatura, período mensual (valores en porcentaje):</h2>
        <div className='chart-container' style={{position: "relative", height:"75vh", width:"100vw"}}>
          <Bar options={options} data={data} style={{ margin: "auto", height:"75vh", width:"100vw"}}/>
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

