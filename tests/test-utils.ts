import { expect } from 'vitest'
import type { ZodErrorMap, ZodSchema, z } from 'zod'
import { zodErrorMap } from '../src/error-map'

interface ParseOptions {
  errorMap?: ZodErrorMap
}

/**
 * Parses the entry using the provided schema and returns the error messages if any.
 *
 * @template TSchema - The Zod schema type.
 * @param {TSchema} schema - The Zod schema to use for parsing.
 * @param {Partial<ZodTypeAny['shape']>} entry - The entry to parse.
 * @param {ParseOptions} parseOpts - The options for parsing.
 * @returns {string[] | undefined} The error messages if the parsing was not successful.
 */
export function getParseErrorMessages<TSchema extends ZodSchema>(
  schema: TSchema,
  entry: Partial<Record<keyof z.infer<TSchema>, unknown>>,
  parseOpts: ParseOptions = {
    errorMap: zodErrorMap,
  },
): string[] | undefined {
  const res = schema.safeParse(entry, parseOpts)
  expect(res.success, 'schema should raise error').toBe(false)

  if (res.error) {
    return res.error.errors.map((e) => e.message)
  }
}

export function fixLineEndings(str: string): string {
  return str.replace(/\r\n/g, '\n')
}
