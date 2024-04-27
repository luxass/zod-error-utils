import type { ZodErrorMap } from 'zod'
import { flattenErrorPath } from './flatten'

// This is a zod error map based on Astro's zod error map.
// https://github.com/withastro/astro/blob/main/packages/astro/src/content/error-map.ts

export interface Options {
  /**
   * A function that prefixes the error message with additional information.
   *
   * @param path - The path of the error.
   * @param message - The error message.
   * @returns The prefixed error message.
   */
  prefixFn?: (path: string, message: string) => string

  /**
   * Whether to flatten union errors
   * @default true
   *
   * NOTE: This combines type and literal errors for keys that are common across ALL union types.
   * Ex. a union between `{ name: z.literal('John') }` and `{ key: z.literal('Henny') }` will
   * raise a single error when `name` does not match:
   * > Did not match union.
   * > name: Expected `'John' | 'Henny'`, received 'foo'
   */
  flattenUnion?: boolean
}

const DEFAULT_PREFIX: NonNullable<Options['prefixFn']> = (path, message) => (path.length ? `**${path}**: ${message}` : message)

/**
 * Builds an error map based on the provided options.
 *
 * @param options - The options used to build the error map.
 * @returns The built error map.
 */
export function buildErrorMap(options: Options): ZodErrorMap {
  return (baseError, ctx) => {
    const prefixFn = options.prefixFn ?? DEFAULT_PREFIX
    const flattenUnionErrors = options.flattenUnion ?? true
    const baseErrorPath = flattenErrorPath(baseError.path)

    if (baseError.code === 'invalid_union' && flattenUnionErrors) {
      const typeOrLiteralErrByPath = new Map<string, TypeOrLiteralErrByPathEntry>()
      for (const unionError of baseError.unionErrors.map((e) => e.errors).flat()) {
        if (unionError.code === 'invalid_type' || unionError.code === 'invalid_literal') {
          const flattenedErrorPath = flattenErrorPath(unionError.path)
          if (typeOrLiteralErrByPath.has(flattenedErrorPath)) {
            typeOrLiteralErrByPath.get(flattenedErrorPath)!.expected.push(unionError.expected)
          } else {
            typeOrLiteralErrByPath.set(flattenedErrorPath, {
              code: unionError.code,
              received: (unionError as any).received,
              expected: [unionError.expected],
            })
          }
        }
      }
      const messages: string[] = [
        prefixFn(
          baseErrorPath,
          typeOrLiteralErrByPath.size ? 'Did not match union:' : 'Did not match union.',
        ),
      ]
      return {
        message: messages
          .concat(
            [...typeOrLiteralErrByPath.entries()]
              // If type or literal error isn't common to ALL union types,
              // filter it out. Can lead to confusing noise.
              .filter(([, error]) => error.expected.length === baseError.unionErrors.length)
              .map(([key, error]) =>
                key === baseErrorPath // Avoid printing the key again if it's a base error
                  ? `> ${getTypeOrLiteralMsg(error)}`
                  : `> ${prefixFn(key, getTypeOrLiteralMsg(error))}`,
              ),
          )
          .join('\n'),
      }
    }
    if (baseError.code === 'invalid_literal' || baseError.code === 'invalid_type') {
      return {
        message: prefixFn(
          baseErrorPath,
          getTypeOrLiteralMsg({
            code: baseError.code,
            received: baseError.received,
            expected: [baseError.expected],
          }),
        ),
      }
    }

    if (baseError.message) {
      return {
        message: prefixFn(baseErrorPath, baseError.message),
      }
    }

    return {
      message: prefixFn(baseErrorPath, ctx.defaultError),
    }
  }
}

interface TypeOrLiteralErrByPathEntry {
  code: 'invalid_type' | 'invalid_literal'
  received: unknown
  expected: unknown[]
}

function getTypeOrLiteralMsg(error: TypeOrLiteralErrByPathEntry): string {
  if (error.received === 'undefined') return 'Required'
  const expectedDeduped = new Set(error.expected)
  switch (error.code) {
    case 'invalid_type':
      return `Expected type \`${unionExpectedVals(expectedDeduped)}\`, received ${JSON.stringify(
        error.received,
      )}`
    case 'invalid_literal':
      return `Expected \`${unionExpectedVals(expectedDeduped)}\`, received ${JSON.stringify(
        error.received,
      )}`
  }
}

function unionExpectedVals(expectedVals: Set<unknown>) {
  return [...expectedVals]
    .map((expectedVal, idx) => {
      if (idx === 0) return JSON.stringify(expectedVal)
      const sep = ' | '
      return `${sep}${JSON.stringify(expectedVal)}`
    })
    .join('')
}

/**
 * Map that defines custom error messages for Zod validation errors.
 */
export const zodErrorMap: ZodErrorMap = buildErrorMap({
  prefixFn: DEFAULT_PREFIX,
  flattenUnion: true,
})
