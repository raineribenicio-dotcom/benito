import { z } from "zod";

// Importación masiva de productos por CSV. El parseo y la validación son puros y
// testeables; la persistencia vive en la server action (lib/actions/admin).

// --- Tokenizer CSV (RFC 4180: comillas, comas y comillas escapadas "") ---

export function parseDelimited(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // comilla escapada
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++; // CRLF
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  // Última celda/fila si el archivo no acaba en salto de línea
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Descarta filas totalmente vacías
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// --- Mapeo y validación de filas a productos ---

export type ParsedProduct = {
  title: string;
  sku: string;
  price: number; // céntimos
  compareAt: number | null;
  stock: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category?: string; // slug
  description?: string;
};

export type RowError = { line: number; message: string };

const rowSchema = z.object({
  title: z.string().min(2),
  sku: z.string().min(1),
  price: z.coerce.number().min(0),
  compareat: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  status: z
    .string()
    .transform((s) => s.toUpperCase())
    .pipe(z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]))
    .default("DRAFT"),
  category: z.string().optional(),
  description: z.string().optional(),
});

const REQUIRED_HEADERS = ["title", "sku", "price"];

export function parseProductsCsv(text: string): { products: ParsedProduct[]; errors: RowError[] } {
  const rows = parseDelimited(text);
  if (rows.length === 0) return { products: [], errors: [{ line: 0, message: "CSV vacío" }] };

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return { products: [], errors: [{ line: 1, message: `Faltan columnas: ${missing.join(", ")}` }] };
  }

  const products: ParsedProduct[] = [];
  const errors: RowError[] = [];

  for (let i = 1; i < rows.length; i++) {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => (record[h] = (rows[i][idx] ?? "").trim()));

    // Campos opcionales vacíos -> undefined para que apliquen los defaults
    for (const key of Object.keys(record)) if (record[key] === "") delete record[key];

    const parsed = rowSchema.safeParse(record);
    if (!parsed.success) {
      errors.push({ line: i + 1, message: parsed.error.issues[0]?.message ?? "Fila inválida" });
      continue;
    }

    const d = parsed.data;
    products.push({
      title: d.title,
      sku: d.sku,
      price: Math.round(d.price * 100),
      compareAt: d.compareat != null ? Math.round(d.compareat * 100) : null,
      stock: d.stock,
      status: d.status,
      category: d.category,
      description: d.description,
    });
  }

  return { products, errors };
}
