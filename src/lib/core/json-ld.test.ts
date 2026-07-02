import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapa < y > para neutralizar la ruptura de </script>", () => {
    const out = serializeJsonLd({ name: "</script><img src=x onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(out).toContain("\\u003c");
  });

  it("escapa el ampersand", () => {
    expect(serializeJsonLd({ a: "Tom & Jerry" })).toContain("\\u0026");
  });

  it("sigue produciendo JSON válido tras desescapar", () => {
    const obj = { name: "Camiseta <b>", price: "19.95" };
    // Los \\uXXXX son secuencias JSON válidas: JSON.parse las restaura
    expect(JSON.parse(serializeJsonLd(obj))).toEqual(obj);
  });
});
