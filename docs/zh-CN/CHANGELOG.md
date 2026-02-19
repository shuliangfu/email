# 变更日志

@dreamer/email 的所有重要变更均记录于此。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.0] - 2026-02-19

### 新增

- **正式版发布**：@dreamer/email 首个稳定版本，API 稳定，可用于生产环境。

#### SMTP 客户端

- **SmtpClient** 类：连接 SMTP 服务器、认证、发送单封/多封邮件、关闭连接。
- **SmtpConfig** 配置：`host`、`port`（默认
  587）、`secure`（TLS/SSL）、`auth`（用户名/密码）、`timeout`（默认 30000
  毫秒）、`ignoreTLS`（仅开发环境）。
- **TLS/STARTTLS**：支持直接 TLS（`secure: true`）或在明文连接上升级 STARTTLS。
- **批量发送**：`sendMany(messages)` 在同一连接上发送多封邮件。
- **错误处理**：连接失败、认证失败、发送失败等 SMTP 错误均抛出明确信息，并通过
  i18n 本地化。

#### 邮件与内容

- **Message** 类：表示一封邮件，包含
  from、to、cc、bcc、replyTo、subject、text、html、attachments、priority、自定义头。
- **MessageOptions** 与
  **createMessage(options)**：从选项构建邮件；from/to/cc/bcc
  支持字符串、`EmailAddress` 或数组。
- **EmailAddress**：`{ address, name? }` 支持显示名称。
- **EmailAttachment**：`filename`、`content`（Base64 字符串或 Uint8Array），可选
  `contentType`、可选 `cid`（内联图片）。
- **优先级**：通过选项或头设置 `high` | `normal` | `low`。

#### 模板

- **renderTemplate(template, data)**：用 `data` 渲染带占位符的模板字符串。
- **createTemplateMessage(options, template, data)**：根据选项和模板（文本和/或
  HTML）构建邮件。
- **TemplateFunction**
  类型：`(data: Record<string, unknown>) => string`，用于自定义模板引擎。

#### 服务集成

- **EmailManager** 类：与 `@dreamer/service` 集成，可注册为服务并从容器解析。
- **EmailManagerOptions**：`smtp`（SmtpConfig）、可选 `defaultFrom`、可选服务
  `key`。
- **createEmailManager(options)**：创建 EmailManager 实例的工厂函数。

#### 国际化（i18n）

- **语言包**：en-US、zh-CN，位于 `src/locales/`。
- **setEmailLocale(locale)**：设置当前语言，用于错误与日志文案。
- **detectLocale()**：从环境变量 `LANGUAGE` / `LC_ALL` / `LANG`
  检测语言；已导出供自定义逻辑使用。
- **$tr(key, params?, lang?)**：按 key 翻译文案；可选参数与可选语言覆盖。
- **Locale** 类型与 **DEFAULT_LOCALE**（`en-US`）从 `./i18n.ts` 导出。
- **本地化文案**：SMTP 连接失败、认证失败、发送失败、未找到配置等服务端字符串。

#### 类型与导出

- 所有公开类型均已导出：`SmtpConfig`、`EmailAddress`、`EmailAttachment`、`MessageOptions`、`TemplateFunction`、`EmailManagerOptions`。

### 兼容性

- **Deno** 2.6+
- **Bun** 1.3.5+
- 依赖：`@dreamer/i18n`、`@dreamer/runtime-adapter`、`@dreamer/service`，开发依赖
  `@dreamer/test`。
