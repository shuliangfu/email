# @dreamer/email Test Report

[English](./TEST_REPORT.md) | [中文 (Chinese)](../zh-CN/TEST_REPORT.md)

## 📊 Test overview

| Item                | Value                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| **Package version** | `@dreamer/email@1.1.0`                                                |
| **Command**         | Deno: `deno test -A tests/` · Bun: `bun test tests/` · Node: `npm run test:node` |
| **Environment**     | Deno 2.9+ / Bun 1.3+ / Node.js 22+                                    |
| **Test framework**  | `@dreamer/test@^1.2.3`                                                |

---

## 🎯 Test results

### Overall statistics

| Metric          | Value                                |
| --------------- | ------------------------------------ |
| **Total tests** | 66 (Deno) / 65 (Bun) / 65 (Node)     |
| **Passed**      | 66 / 65 / 65                         |
| **Failed**      | 0 / 0 / 0                            |
| **Pass rate**   | 100%                                 |

> The Deno test runner counts 1 framework teardown step in the total, so Deno
> reports 66 while Bun/Node report 65; the business `it()` cases are identical
> across runtimes, all with 0 failures.

### Test file statistics

| Test file     | Tests | Passed | Failed | Status    |
| ------------- | ----- | ------ | ------ | --------- |
| `mod.test.ts` | 65    | 65     | 0      | ✅ Passed |

---

## 📋 Feature coverage

For full line-by-line test details, see
[docs/zh-CN/TEST_REPORT.md](../zh-CN/TEST_REPORT.md).

| Area                          | Tests | Status |
| ----------------------------- | ----- | ------ |
| SmtpClient (construction)     | 6     | ✅     |
| Message — creation            | 5     | ✅     |
| Message — cc/bcc              | 5     | ✅     |
| Message — content             | 4     | ✅     |
| Message — attachments         | 5     | ✅     |
| Message — priority/headers    | 4     | ✅     |
| Message — toMIME              | 8     | ✅     |
| renderTemplate                | 4     | ✅     |
| createTemplateMessage         | 4     | ✅     |
| EmailManager                  | 11    | ✅     |
| ServiceContainer integration  | 4     | ✅     |
| createEmailManager factory    | 5     | ✅     |

---

## 📝 Conclusion

All three runtimes (Deno/Bun/Node) pass for `@dreamer/email`: **66 / 65 / 65,
0 failures** (Deno reports 1 more than Bun/Node due to a framework teardown
step; the business `it()` cases are identical at 65). Coverage includes SMTP
client configuration, message creation/parsing, MIME generation, attachments,
template rendering, and `@dreamer/service` integration. The SMTP connection
paths now route through `@dreamer/runtime-adapter`, verified type-safe across
all three runtimes via `deno check`.

---

<div align="center">

**Pass rate: 100%** ✅

_66 / 65 / 65 tests (Deno/Bun/Node) | All passed_

</div>
