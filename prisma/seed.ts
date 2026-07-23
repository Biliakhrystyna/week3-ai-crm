import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const movie = await prisma.movie.create({
    data: { title: "Inception", genre: "Sci-Fi", duration: 148, rating: "8.8" }
  });
  const hall = await prisma.hall.create({
    data: { name: "Red Hall", capacity: 100 }
  });
  console.log('Seed дані додано!');
}
main().catch(e => { console.error(e); process.exit(1); });