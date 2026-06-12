const KEYS = [
  process.env.GOOGLE_GEMINI_API_KEY,
  process.env.GOOGLE_GEMINI_API_KEY_2,
  process.env.GOOGLE_GEMINI_API_KEY_3,
].filter(Boolean) as string[];

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function gradeEssay(question: string, expectedAnswer: string, studentAnswer: string): Promise<{ score: number; feedback: string }> {
  const prompt = `Kamu adalah penilai jawaban essay untuk kursus online.

Pertanyaan: ${question}

Rubrik/Jawaban yang diharapkan:
${expectedAnswer}

Jawaban siswa:
${studentAnswer}

Berikan penilaian dalam format JSON berikut (hanya JSON, tanpa teks lain):
{
  "score": <angka 0-100>,
  "feedback": "<feedback singkat dalam Bahasa Indonesia, maks 2 kalimat>"
}

Kriteria penilaian:
- 80-100: Jawaban sangat tepat dan lengkap
- 60-79: Jawaban sebagian besar benar tapi kurang lengkap
- 40-59: Jawaban ada poin yang benar tapi masih banyak kurang
- 0-39: Jawaban tidak relevan atau sangat kurang`;

  let lastError: Error | null = null;

  for (const key of KEYS) {
    try {
      const res = await fetch(`${API_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1,
            maxOutputTokens: 512,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      });

      if (res.status === 429 || res.status === 503) continue; // try next key

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid Gemini response");

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0))),
        feedback: String(parsed.feedback || ""),
      };
    } catch (err) {
      lastError = err as Error;
    }
  }

  console.error("All Gemini keys failed:", lastError);
  return { score: 0, feedback: "Penilaian otomatis gagal, harap hubungi admin." };
}
