import fs from 'fs/promises';

export async function getStoredSubjects() {
  try {
    const rawFileContent = await fs.readFile('subjects.json', {
      encoding: 'utf-8',
    });
    const data = JSON.parse(rawFileContent);
    const storedSubjects = data.subjects ?? [];
    return storedSubjects;
  } catch {
    return [];
  }
}

type Subject = {
  id: string;
  name: string;
}

export function storeSubjects(subjects: Subject[]) {
  return fs.writeFile('subjects.json', JSON.stringify({ subjects: subjects || [] }));
}