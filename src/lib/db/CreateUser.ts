import { useError } from "../Logger";
import prisma from "../Prisma";

export default async function createUser(id: string, name: string) {
 try {
  const user = await prisma.user.create({
   data: { id, name },
   select: { name: true, id: true },
  });

  return user;
 } catch (error: any) {
  useError(error);
  return null;
 }
}
