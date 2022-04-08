import arc from "@architect/functions";
import cuid from "cuid";

import type { User } from "./user.server";

export type Note = {
  id: ReturnType<typeof cuid>;
  userId: User["id"];
  title: string;
  body: string;
};

type NoteItem = {
  pk: User["id"];
  sk: `note#${Note["id"]}`;
};

const skToId = (sk: NoteItem["sk"]): Note["id"] => sk.replace(/^note#/, "");
const idToSk = (id: Note["id"]): NoteItem["sk"] => `note#${id}`;

export async function getNote({
  id,
  userId,
}: Pick<Note, "id" | "userId">): Promise<Note | null> {
  const db = await arc.tables();

  const result = await await db.note.get({ pk: idToSk(id), sk: userId });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      title: result.title,
      body: result.body,
    };
  }
  return null;
}

export async function getNoteListItems({
  userId,
}: Pick<Note, "userId">): Promise<Array<Pick<Note, "id" | "title">>> {
  const db = await arc.tables();

  const result = await db.note.scan({
    FilterExpression: "sk = :userId",
    ExpressionAttributeValues: { ":userId": userId },
  });

  return result.Items.map((n: any) => ({
    title: n.title,
    id: skToId(n.sk),
  }));
}

export async function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title" | "userId">): Promise<Note> {
  const db = await arc.tables();

  const result = await db.note.put({
    pk: `note#${cuid()}`,
    sk: userId,
    title: title,
    body: body,
  });
  return {
    id: skToId(result.sk),
    userId: result.pk,
    title: result.title,
    body: result.body,
  };
}

export async function deleteNote({ id, userId }: Pick<Note, "id" | "userId">) {
  const db = await arc.tables();
  return db.note.delete({ pk: idToSk(id), sk: userId });
}
