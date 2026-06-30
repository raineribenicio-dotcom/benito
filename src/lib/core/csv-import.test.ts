import { describe, expect, it } from "vitest";
import { parseDelimited, parseProductsCsv } from "./csv-import";

describe("parseDelimited", () => {
  it("parsea filas y celdas simples", () => {
    expect(parseDelimited("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("respeta comas dentro de comillas", () => {
    expect(parseDelimited('title,desc\n"Camiseta","Suave, cómoda"')).toEqual([
      ["title", "desc"],
      ["Camiseta", "Suave, cómoda"],
    ]);
  });

  it("maneja comillas escapadas", () => {
    expect(parseDelimited('a\n"dice ""hola"""')).toEqual([["a"], ['dice "hola"']]);
  });

  it("soporta CRLF y descarta filas vacías", () => {
    expect(parseDelimited("a,b\r\n1,2\r\n\r\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("parseProductsCsv", () => {
  const header = "title,sku,price,stock,status,category";

  it("mapea una fila válida a producto con céntimos", () => {
    const { products, errors } = parseProductsCsv(`${header}\nCamiseta,TS-1,19.95,50,active,moda`);
    expect(errors).toEqual([]);
    expect(products[0]).toMatchObject({
      title: "Camiseta",
      sku: "TS-1",
      price: 1995,
      stock: 50,
      status: "ACTIVE",
      category: "moda",
    });
  });

  it("aplica defaults de stock y status", () => {
    const { products } = parseProductsCsv("title,sku,price\nProducto,SKU-1,10");
    expect(products[0].stock).toBe(0);
    expect(products[0].status).toBe("DRAFT");
  });

  it("reporta columnas obligatorias ausentes", () => {
    const { errors } = parseProductsCsv("title,price\nX,10");
    expect(errors[0].message).toContain("sku");
  });

  it("acumula errores por fila sin abortar el resto", () => {
    const { products, errors } = parseProductsCsv(`title,sku,price\n,BAD,10\nBueno,OK-1,12`);
    expect(products).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0].line).toBe(2);
  });
});
