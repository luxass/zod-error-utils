import { expect, it } from "vitest";
import { flattenErrorPath } from "../src/flatten";

it("should flatten the error path", () => {
  const errorPath = ["user", "address", 0, "city"];
  const flattenedPath = flattenErrorPath(errorPath);
  expect(flattenedPath).toBe("user.address.0.city");
});

it("should flatten the error path with string indices", () => {
  const errorPath = ["user", "address", "0", "city"];
  const flattenedPath = flattenErrorPath(errorPath);
  expect(flattenedPath).toBe("user.address.0.city");
});

it("should flatten the error path with a single index", () => {
  const errorPath = [0];
  const flattenedPath = flattenErrorPath(errorPath);
  expect(flattenedPath).toBe("0");
});

it("should flatten the error path with a single string index", () => {
  const errorPath = ["0"];
  const flattenedPath = flattenErrorPath(errorPath);
  expect(flattenedPath).toBe("0");
});

it("returns an empty string when given an empty error path", () => {
  const errorPath: string[] = [];
  const flattenedPath = flattenErrorPath(errorPath);
  expect(flattenedPath).toBe("");
});
