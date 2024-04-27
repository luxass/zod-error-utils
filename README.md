# zod-error-utils

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]

A set of utilities to work with Zod errors.

## 📦 Installation

```bash
npm install zod-error-utils
```

## 🚀 Usage

```ts
import { buildZodErrorMap, flattenErrorPath, zodErrorMap } from 'zod-error-utils'

const schema = z.object({
  user: z.object({
    name: z.string(),
    isAdministrator: z.boolean(),
  }),
})

const data = {
  user: {
    name: 'John Doe',
    isAdministrator: true,
  },
}

const result = schema.safeParse(data, {
  errorMap: zodErrorMap
})

// you can customize the zodErrorMap, by creating a new one using `buildZodErrorMap`.

const customErrorMap = buildZodErrorMap({
  prefixFn(path, message) {
    return `Custom prefix: ${path.join('.')}: ${message}`
  },
})
```

## 📄 License

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/zod-error-utils?style=flat&colorA=18181B&colorB=4169E1
[npm-version-href]: https://npmjs.com/package/zod-error-utils
[npm-downloads-src]: https://img.shields.io/npm/dm/zod-error-utils?style=flat&colorA=18181B&colorB=4169E1
[npm-downloads-href]: https://npmjs.com/package/zod-error-utils
