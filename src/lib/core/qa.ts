import { prisma } from "@/lib/db/client";

// Preguntas y respuestas de producto. Cualquier usuario autenticado pregunta;
// staff/admin responde (isStaff).

export async function askQuestion(userId: string, productId: string, body: string) {
  return prisma.question.create({ data: { userId, productId, body } });
}

export async function answerQuestion(params: {
  userId: string;
  questionId: string;
  body: string;
  isStaff: boolean;
}) {
  return prisma.answer.create({
    data: {
      questionId: params.questionId,
      userId: params.userId,
      body: params.body,
      isStaff: params.isStaff,
    },
  });
}
