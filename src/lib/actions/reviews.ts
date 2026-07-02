"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/session";
import { createReview } from "@/lib/core/reviews";
import { askQuestion } from "@/lib/core/qa";
import { prisma } from "@/lib/db/client";

// Envío de reseña y de pregunta desde la ficha de producto.

const reviewSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

export async function submitReviewAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const data = reviewSchema.parse(Object.fromEntries(formData));
  if (!userId) redirect("/login");

  await createReview({
    userId,
    productId: data.productId,
    rating: data.rating,
    title: data.title,
    body: data.body,
  });
  revalidatePath(`/producto/${data.slug}`);
}

const questionSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().min(5).max(500),
});

export async function submitQuestionAction(formData: FormData) {
  const userId = await getCurrentUserId();
  const data = questionSchema.parse(Object.fromEntries(formData));
  if (!userId) redirect("/login");

  await askQuestion(userId, data.productId, data.body);
  revalidatePath(`/producto/${data.slug}`);
}

// Respuesta de staff/admin a una pregunta (desde la propia ficha).
const answerSchema = z.object({
  questionId: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().min(2).max(1000),
});

export async function submitAnswerAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const data = answerSchema.parse(Object.fromEntries(formData));

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";

  await prisma.answer.create({
    data: { questionId: data.questionId, userId, body: data.body, isStaff },
  });
  revalidatePath(`/producto/${data.slug}`);
}
