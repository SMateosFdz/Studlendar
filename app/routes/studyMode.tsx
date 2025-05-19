import { useLoaderData } from "@remix-run/react";
import Navigation from "~/components/Navigation";
import { getStoredStudyBlocks } from "~/data/studyBlocks";
import navStyles from "~/styles/navigation.css";
import styles from "~/styles/studyMode.css";
import { getCurrentDate } from "~/utils/date";


export async function loader() {
  const existingStudyBlocks = await getStoredStudyBlocks();

  return existingStudyBlocks;
}

export function Calculate(blocks, hours: number, day: number){
    let flag = false;
    const ids: number[] = [];
    for(let i=25; i <= 209; i += 8){
        ids.push(i + day - 1);
    }

    const id = ids[hours];   

    blocks.map((block: {id: number}) => {
        if(block.id == id){
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
          <h1>Modo estudio</h1>
          <div>
            {Calculate(studyBlocks, hours, dayOfWeek) ? "hay bloque en esta hora" : "no hay bloque en esta hora"}
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
