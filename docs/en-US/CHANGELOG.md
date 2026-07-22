# Changelog

All notable changes to @dreamer/email are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.1.0] - 2026-07-23

### Added

- **Node.js compatibility**: The SMTP client now runs on Node 22+ — native
  `Deno.connect`/`Deno.startTls`/`Deno.TcpConn`/`Deno.TlsConn` in `src/mod.ts`
  are replaced with `@dreamer/runtime-adapter` v1.2.2's
  `connect`/`startTls`/`TcpConn`/`StartTlsOptions`; all three runtimes
  (Deno/Bun/Node) share the same connection logic.
- **Node.js test infra**: Added `tsconfig.json`, `ci.yml` (9-job: 3 Deno v2.9 +
  3 Bun + 3 Node 22); `test:node` driven by `tsx --test --test-force-exit`;
  Deno/Bun/Node share the same `tests/*.test.ts` suite.

### Changed

- **src/mod.ts**: Refactored `SmtpClient.connect()` — introduced a local
  `established: TcpConn` variable to hold the established connection so
  TypeScript can correctly narrow at the if/else merge point, avoiding non-null
  assertions on the mutable class property `this.conn` (root-cause fix, not a
  `!` patch).
- **tests/mod.test.ts**: Added `setEmailLocale("zh-CN")` to the config-not-found
  test — CI runners default to English locale, so
  `$tr("email.smtp.configNotFound")` returns English and the Chinese assertion
  would fail.
- **Dependencies**: `@dreamer/i18n` ^1.1.2, `@dreamer/runtime-adapter` ^1.2.2,
  `@dreamer/service` ^1.1.0, `@dreamer/test` ^1.2.3.
- **deno.json**: Added `minimumDependencyAge: 0`.
- **.gitignore**: Added `package-lock.json`.

### Compatibility

- Deno 2.9+ / Bun 1.3+ / Node.js 22+

---

## [1.0.0] - 2026-02-19

### Added

- **Official release**: First stable release of @dreamer/email. API is stable
  and suitable for production.

#### SMTP client

- **SmtpClient** class: Connect to SMTP server, authenticate, send single or
  multiple messages, close connection.
- **SmtpConfig** options: `host`, `port` (default 587), `secure` (TLS/SSL),
  `auth` (user/password), `timeout` (default 30000 ms), `ignoreTLS` (dev only).
- **TLS/STARTTLS**: Use direct TLS (`secure: true`) or STARTTLS upgrade on plain
  connection.
- **Batch send**: `sendMany(messages)` for sending multiple messages in one
  connection.
- **Error handling**: All SMTP errors (connection failed, auth failed, send
  failed) throw with clear messages; messages are localized via i18n.

#### Message and content

- **Message** class: Represents an email with from, to, cc, bcc, replyTo,
  subject, text, html, attachments, priority, custom headers.
- **MessageOptions** and **createMessage(options)**: Build a message from
  options; from/to/cc/bcc support string, `EmailAddress`, or array.
- **EmailAddress**: `{ address, name? }` for display names.
- **EmailAttachment**: `filename`, `content` (string base64 or Uint8Array),
  optional `contentType`, optional `cid` for inline images.
- **Priority**: `high` | `normal` | `low` via options or headers.

#### Templates

- **renderTemplate(template, data)**: Render a template string with placeholders
  using `data`.
- **createTemplateMessage(options, template, data)**: Build a message from
  options and a template (text and/or HTML).
- **TemplateFunction** type: `(data: Record<string, unknown>) => string` for
  custom template engines.

#### Service integration

- **EmailManager** class: Email sending integrated with `@dreamer/service`;
  register as a service and resolve from container.
- **EmailManagerOptions**: `smtp` (SmtpConfig), optional `defaultFrom`, optional
  service `key`.
- **createEmailManager(options)**: Factory to create EmailManager instance.

#### Internationalization (i18n)

- **Locales**: en-US and zh-CN under `src/locales/`.
- **setEmailLocale(locale)**: Set current locale for error and log messages.
- **detectLocale()**: Detect locale from env `LANGUAGE` / `LC_ALL` / `LANG`;
  exported for custom detection.
- **$tr(key, params?, lang?)**: Translate message by key; optional params and
  optional lang override.
- **Locale** type and **DEFAULT_LOCALE** (`en-US`) exported from `./i18n.ts`.
- **Localized messages**: SMTP connection failure, auth failure, send failure,
  config not found, and other server-side strings.

#### Types and exports

- All public types exported: `SmtpConfig`, `EmailAddress`, `EmailAttachment`,
  `MessageOptions`, `TemplateFunction`, `EmailManagerOptions`.

### Compatibility

- **Deno** 2.6+
- **Bun** 1.3.5+
- Depends on `@dreamer/i18n`, `@dreamer/runtime-adapter`, `@dreamer/service`,
  `@dreamer/test` (dev).
