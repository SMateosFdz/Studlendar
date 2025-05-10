import fs from 'fs/promises';

export async function getStoredStudyBlocks() {
  try {
    const rawFileContent = await fs.readFile('studyBlocks.json', {
      encoding: 'utf-8',
    });
    const data = JSON.parse(rawFileContent);
    const storedStudyBlocks = data.studyBlocks ?? [];
    return storedStudyBlocks;
  } catch {
    return [];
  }
}

type StudyBlock = {
  id: string;
  name: string;
  time: number;
  repetition: string;
}

export function storeStudyBlocks(studyBlock: StudyBlock[]) {
  return fs.writeFile('studyBlocks.json', JSON.stringify({ studyBlocks: studyBlock || [] }));
}