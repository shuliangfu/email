# @dreamer/email

> English | [中文 (Chinese)](./docs/zh-CN/README.md)

> An email library for Deno, Bun and Node.js: SMTP client, HTML mail, templates,
> batch send.

[![JSR](https://jsr.io/badges/@dreamer/email)](https://jsr.io/@dreamer/email)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-65%20passed%20(3%20runtimes)-brightgreen)](./docs/en-US/TEST_REPORT.md)

---

## Features

SMTP client, TLS/STARTTLS, batch send; plain/HTML, attachments, templates;
`@dreamer/service` integration (EmailManager).

---

## Installation

### Deno

```bash
deno add jsr:@dreamer/email
```

### Bun

```bash
bunx jsr add @dreamer/email
```

### Node.js

```bash
npx jsr add @dreamer/email
```

> Requires Node.js 22+. SMTP connections use `@dreamer/runtime-adapter`
> (`connect` / `startTls`), which selects the correct transport per runtime.

---

## Compatibility

| Runtime  | Version | Status      |
| -------- | ------- | ----------- |
| Deno     | 2.9+    | ✅ Supported |
| Bun      | 1.3+    | ✅ Supported |
| Node.js  | 22+     | ✅ Supported (since v1.1.0) |

---

## Documentation

- **Full (中文)**: [docs/zh-CN/README.md](./docs/zh-CN/README.md)
- **Test (EN)**: [docs/en-US/TEST_REPORT.md](./docs/en-US/TEST_REPORT.md) ·
  **Test (中文)**: [docs/zh-CN/TEST_REPORT.md](./docs/zh-CN/TEST_REPORT.md)

---

## Changelog

Full history: [English](./docs/en-US/CHANGELOG.md) |
[中文](./docs/zh-CN/CHANGELOG.md).

**Latest (v1.1.0 - 2026-07-23)**: **Added** – Node.js 22+ compatibility; SMTP
client migrated from `Deno.connect`/`startTls` to runtime-adapter for
cross-runtime support. See [CHANGELOG](./docs/en-US/CHANGELOG.md).

---

## License

Apache License 2.0 — see [LICENSE](./LICENSE)

---

<div align="center">**Made with ❤️ by Dreamer Team**</div>
