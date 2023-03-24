import { useError } from "../Logger";
import prisma from "../Prisma";

export async function getUser(id: string) {
 try {
  const user = await prisma.user.findUnique({
   where: { id },
   select: {
    id: true,
    name: true,
   },
  });
  return user;
 } catch (error) {
  useError(error);
  return null;
 }
}
