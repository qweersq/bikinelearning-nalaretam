import { prisma } from "./lib/prisma";

async function main() {
  console.log("Prisma client keys for moduleWidget:");
  // Check the model metadata
  console.log(Object.keys(prisma.moduleWidget));
  
  // Let's do a direct raw query to get columns of module_widgets table
  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'module_widgets';
  `;
  console.log("Database columns for module_widgets:", columns);
}

main().catch(console.error).finally(() => prisma.$disconnect());
