// Generación de slugs URL-safe a partir de texto libre (títulos de producto).
// Pura y testeable: quita acentos, pasa a minúsculas y colapsa separadores.

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina diacríticos
    .replace(/[^a-z0-9]+/g, "-") // no alfanumérico -> guion
    .replace(/^-+|-+$/g, ""); // sin guiones al principio/fin
}
