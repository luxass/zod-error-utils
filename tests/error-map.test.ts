import { expect, it } from "vitest";
import { z } from "zod";
import { fixLineEndings, getParseErrorMessages } from "./test-utils";

it("should use custom error map", () => {
  const schema = z.object({
    name: z.string().min(5, "Name must be at least 5 characters long"),
    age: z.number().min(18, "Age must be at least 18"),
    email: z.string().email("Invalid email address"),
  });

  const data = {
    name: "John",
    age: 16,
    email: "john@example",
  };

  const error = getParseErrorMessages(schema, data);

  expect(error).toEqual([
    "Name must be at least 5 characters long",
    "Age must be at least 18",
    "Invalid email address",
  ]);
});

it("should use custom error map for union type", () => {
  const schema = z.union([
    z.string().min(5, "Name must be at least 5 characters long"),
    z.number().min(18, "Age must be at least 18"),
  ]);

  const data = 16;

  const error = getParseErrorMessages(schema, data);

  expect(error).toEqual(["Age must be at least 18"]);
});

it("should use custom error map for array type", () => {
  const schema = z.array(z.string().min(5, "Name must be at least 5 characters long"));

  const data = ["John", "Lucas", "Alice"];

  const error = getParseErrorMessages(schema, data);

  expect(error).toEqual([
    "Name must be at least 5 characters long",
  ]);
});

it("should use custom error map for literal type", () => {
  const schema = z.literal("John");

  const data = "Jane";

  const error = getParseErrorMessages(schema, data);

  expect(error).toEqual(["Expected `\"John\"`, received \"Jane\""]);
});

it("should use custom error map for union literal type", () => {
  const schema = z.union([z.literal("John"), z.literal("Jane")]);

  const data = "Alice";

  const error = getParseErrorMessages(schema, data);

  expect(error).toStrictEqual([
    fixLineEndings(
      "Did not match union:\n> Expected `\"John\" | \"Jane\"`, received \"Alice\"",
    ),
  ]);
});

it("should use custom error map for literals", () => {
  const schema = z.union([
    z.object({
      name: z.literal("John"),
    }),
    z.object({
      name: z.literal("Jane"),
    }),
  ]);

  const data = {
    name: "Alice",
  };

  const error = getParseErrorMessages(schema, data);

  expect(error).toStrictEqual([
    fixLineEndings(
      "Did not match union:\n> **name**: Expected `\"John\" | \"Jane\"`, received \"Alice\"",
    ),
  ]);
});
