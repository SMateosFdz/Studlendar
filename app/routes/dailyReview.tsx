/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-key */
import dailyReviewStyles from "~/styles/dailyReview.css";
import { useState } from "react";

export default function DailyReview(numbersWeek: number[], studyBlocks) {

    const [currentStudyBlocks, setCurrentStudyBlocks] = useState(studyBlocks);
    const date = new Date();
    const day = date.getDate();
    const [currentDay] = useState(day);
    const [currentSelection, setCurrentSelection] = useState(currentDay);
    const [pendingHours, setPendingHours] = useState(0);
    const currentBlocks: { blockId: number; time: number; name: string; date: Date; completed: number; }[] = [];

    function handleSelectionChange(event: { target: { value: string }; }) {
        let hours = 0;
        setCurrentSelection(Number(event.target.value));
        studyBlocks.map((
            studyBlock: { blockId: number; time: number; name: string; date: Date; completed: number },
            i: number
        ) => {
            const date = new Date(studyBlock.date);
            let dayOfWeek = date.getDate();
            if (dayOfWeek == Number(event.target.value)) {
                currentBlocks.push(studyBlock);
                hours = hours + (studyBlock.time - studyBlock.time * (studyBlock.completed / 100));
            }
        });
        setCurrentStudyBlocks(currentBlocks);
        setPendingHours(hours);
    }

    return (
        <div>
            <h2>Revisión diaria {`- ${currentSelection}`}</h2>
            <label htmlFor="subjectName">Día de revisión: </label>
            <select
                name="subjectName"
                id="subjectName"
                value={currentSelection}
                onChange={handleSelectionChange}
            >
                {numbersWeek.map((day: number) => {
                    if (day <= currentDay) {
                        return (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        )
                    }
                })}
            </select>
            <div className="daily-review__chart">
                {currentStudyBlocks.map((
                    studyBlock: { blockId: number; time: number; name: string; date: Date; completed: number },
                    i: number
                ) => {
                    const date = new Date(studyBlock.date);
                    let dayOfWeek = date.getDate();
                    if (dayOfWeek == currentSelection) {
                        let completedHeight = studyBlock.time * (studyBlock.completed / 100);
                        completedHeight = (completedHeight / studyBlock.time) * 300;
                        return (
                            <div className={"bar-container"}>
                                <div
                                    className={"bar"}
                                    style={{ height: `${completedHeight}px` }}
                                ></div>
                                <div
                                    className={"bar-completed"}
                                >
                                </div>
                                <div className="bar-label">
                                    <p>{studyBlock.name} ({studyBlock.time}h)</p>
                                    <p>{studyBlock.completed}%</p>
                                </div>
                            </div>
                        )
                    }
                }
                )}
            </div>
            <p>Quedan {pendingHours} horas pendientes</p>
        </div>
    );
}

export function links() {
    return [
        { rel: "stylesheet", href: dailyReviewStyles },
    ];
}