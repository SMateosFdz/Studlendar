import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Navigation from "~/components/Navigation";
import { userId } from "~/cookies.server";
import { prisma } from "~/data/database.server";
import navStyles from "~/styles/navigation.css";
import styles from "~/styles/studyMode.css";
import { getCurrentDate } from "~/utils/date";


export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = await userId.parse(request.headers.get("Cookie"));
  const existingSubjects = await prisma.subject.findMany({
    where: { authorId: cookie.userId },
  });

  const existingStudyBlocks = [];

  const studyBlocks = existingSubjects.map(async (subject) => {
    const studyBlocks = await prisma.studyBlock.findMany({
      where: { subjectName: subject.name },
    });
    return studyBlocks;
  });

  const allStudyBlocks = await Promise.all(studyBlocks);

  existingStudyBlocks.push(...allStudyBlocks.flat());

  return existingStudyBlocks;
}

export function Calculate(blocks, hours: number, day: number){
    let flag = false;
    const ids: number[] = [];
    for(let i=25; i <= 209; i += 8){
        ids.push(i + day - 1);
    }

    const id = ids[hours];

    blocks.map((block: {blockId: number}) => {
        if(block.blockId == id){
            flag = true;
        }
    })

    return flag;
}

export default function Pomodoro() {
    const studyBlocks = useLoaderData();
    const { month, hours, minutes, seconds, dayOfWeek} = getCurrentDate();

  return (
    <>
      <Navigation currentPage={"/study-mode"} />
      <main>
          <h1 className="studyMode__title">Modo estudio</h1>
          <div className="studyMode__container">
            {Calculate(studyBlocks, hours, dayOfWeek) ? "Hay bloque en esta hora" : "No hay bloque en esta hora"}
          </div>
      </main>
    </>
  );
}

export function links() {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: styles },
  ];
}
