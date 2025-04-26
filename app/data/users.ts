import fs from 'fs/promises';

export async function getStoredUsers() {
  try {
    const rawFileContent = await fs.readFile('users.json', {
      encoding: 'utf-8',
    });
    const data = JSON.parse(rawFileContent);
    const storedUsers = data.users ?? [];
    return storedUsers;
  } catch {
    return [];
  }
}

type User = {
  id: string;
  name: string;
  password: string;
}

export function storeUser(users: User[]) {
  return fs.writeFile('users.json', JSON.stringify({ users: users || [] }));
}