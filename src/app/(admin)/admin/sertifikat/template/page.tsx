import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TemplateClient from "./TemplateClient";

export const dynamic = "force-dynamic";

export default async function CertificateTemplatePage() {
  await requireAdmin();
  const template = await prisma.certificateTemplate.findFirst({ orderBy: { createdAt: "asc" } });
  return <TemplateClient template={template} />;
}
