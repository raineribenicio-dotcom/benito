"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db/client";
import { signIn, signOut } from "@/lib/auth/config";
import { hashPassword } from "@/lib/auth/password";
import { mergeGuestCartIntoUser } from "@/lib/core/cart";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Datos inválidos";
    redirect(`/registro?error=${encodeURIComponent(msg)}`);
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/registro?error=${encodeURIComponent("Ese email ya está registrado")}`);
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });

  const token = cookies().get("cart_token")?.value;
  if (token) await mergeGuestCartIntoUser(user.id, token);

  await signIn("credentials", { email, password, redirectTo: "/cuenta" });
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const token = cookies().get("cart_token")?.value;

  try {
    // Asocia el carrito de invitado antes de redirigir
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (user && token) await mergeGuestCartIntoUser(user.id, token);

    await signIn("credentials", { email, password, redirectTo: "/cuenta" });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect(`/login?error=${encodeURIComponent("Credenciales incorrectas")}`);
    }
    throw err; // redirect() lanza internamente; no lo capturamos
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
