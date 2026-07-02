// Serializa un objeto JSON-LD para incrustarlo de forma segura dentro de un
// <script type="application/ld+json">. JSON.stringify por sí solo NO escapa
// "</script>" ni "<", lo que permitiría XSS almacenado si un campo (título,
// descripción...) contiene HTML. Escapamos los caracteres peligrosos y los
// separadores de línea Unicode (U+2028/U+2029).

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
