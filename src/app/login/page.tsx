import type { Metadata } from "next";
import { loginAction } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

const field = "w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-brand-500 focus:outline-none";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="container flex min-h-screen max-w-md flex-col justify-center py-12">
      <a href="/" className="mb-8 text-center text-2xl font-bold text-brand-700">Benito</a>
      <h1 className="text-xl font-bold">Iniciar sesión</h1>

      {searchParams.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {searchParams.error}
        </p>
      )}

      <form action={loginAction} className="mt-6 space-y-4">
        <input name="email" type="email" required placeholder="Email" className={field} />
        <input name="password" type="password" required placeholder="Contraseña" className={field} />
        <button type="submit" className="w-full rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">
          Entrar
        </button>
      </form>

      {process.env.GOOGLE_CLIENT_ID && (
        <a href="/api/auth/signin/google" className="mt-3 block rounded-full border border-gray-300 px-6 py-3 text-center font-medium hover:bg-gray-50">
          Continuar con Google
        </a>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="font-medium text-brand-600 hover:underline">Regístrate</a>
      </p>
    </main>
  );
}
