import { prisma } from "@/lib/prisma";

type NotifType = "enrollment" | "completion" | "quiz_result" | "cert_issued" | "cert_download";

const settingKey: Record<NotifType, string> = {
  enrollment:    "notifEnrollment",
  completion:    "notifCompletion",
  quiz_result:   "notifQuizResult",
  cert_issued:   "notifCertIssued",
  cert_download: "notifCertDownload",
};

export async function createNotif(userId: string, type: NotifType, title: string, body: string) {
  try {
    const setting = await prisma.setting.findUnique({ where: { id: "singleton" } });
    const key = settingKey[type] as keyof typeof setting;
    const channel = (setting?.notifChannel as string | undefined) ?? "In-App";

    const inAppEnabled = channel === "In-App" || channel === "Email + In-App";
    const toggleEnabled = setting ? (setting[key] as boolean | undefined) ?? true : true;

    if (!toggleEnabled || !inAppEnabled) return;

    await prisma.notification.create({
      data: { userId, type, title, body },
    });
  } catch {
    // non-blocking — never fail the main request
  }
}
