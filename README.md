# @dreamer/email

> 一个兼容 Deno 和 Bun 的邮件发送库，提供 SMTP 客户端、HTML 邮件支持等功能

[![JSR](https://jsr.io/badges/@dreamer/email)](https://jsr.io/@dreamer/email)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 功能

邮件发送库，用于邮件通知、邮件营销等场景。

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 📧 **SMTP 客户端** | 支持连接、认证、发送邮件 |
| 🎨 **HTML 邮件支持** | 支持纯文本和 HTML 格式邮件 |
| 📎 **附件支持** | 支持添加文件附件 |
| 📝 **模板邮件** | 支持使用模板生成邮件内容 |
| 📦 **批量发送** | 支持批量发送邮件 |

---

## 🎯 使用场景

- 邮件通知
- 邮件营销
- 系统通知邮件

---

## 📦 安装

### Deno

```bash
deno add jsr:@dreamer/email
```

### Bun

```bash
bunx jsr add @dreamer/email
```

---

## 🌍 环境兼容性

| 环境 | 版本要求 | 状态 |
|------|---------|------|
| **Deno** | 2.5+ | ✅ 完全支持 |
| **Bun** | 1.0+ | ✅ 完全支持 |
| **服务端** | - | ✅ 支持（兼容 Deno 和 Bun 运行时，SMTP 客户端功能） |
| **客户端** | - | ❌ 不支持（浏览器环境无法直接发送 SMTP 邮件） |
| **依赖** | - | 📦 无外部依赖（纯 TypeScript 实现） |

---

## 🚀 快速开始

### 基本使用

```typescript
import { SmtpClient, createMessage } from "jsr:@dreamer/email";

// 创建 SMTP 客户端
const client = new SmtpClient({
  host: "smtp.example.com",
  port: 587,
  secure: false, // 使用 STARTTLS
  auth: {
    user: "user@example.com",
    password: "password",
  },
});

// 创建邮件消息
const message = createMessage({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "测试邮件",
  text: "这是一封测试邮件",
  html: "<h1>这是一封测试邮件</h1>",
});

// 发送邮件
await client.send(message);

// 关闭连接
await client.close();
```

### 使用显示名称

```typescript
const message = createMessage({
  from: {
    name: "发送者",
    address: "sender@example.com",
  },
  to: {
    name: "接收者",
    address: "recipient@example.com",
  },
  subject: "测试邮件",
  text: "这是一封测试邮件",
});
```

### 发送附件

```typescript
import { readFile } from "jsr:@std/fs";

// 读取文件
const fileContent = await readFile("path/to/file.pdf");

const message = createMessage({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "带附件的邮件",
  text: "请查看附件",
  attachments: [
    {
      filename: "document.pdf",
      content: fileContent,
      contentType: "application/pdf",
    },
  ],
});
await client.send(message);

```

### 使用模板

```typescript
import { createTemplateMessage, renderTemplate } from "jsr:@dreamer/email";

// 定义模板
const template = {
  text: "你好 {{name}}，欢迎使用 {{product}}！",
  html: "<h1>你好 {{name}}</h1><p>欢迎使用 {{product}}！</p>",
};

// 创建模板邮件
const message = createTemplateMessage(
  template,
  {
    name: "张三",
    product: "Dreamer 邮件库",
  },
  {
    from: "sender@example.com",
    to: "recipient@example.com",
    subject: "欢迎邮件",
  },
);

await client.send(message);
```

### 批量发送

```typescript
const messages = [
  createMessage({
    from: "sender@example.com",
    to: "user1@example.com",
    subject: "批量邮件 1",
    text: "这是第一封邮件",
  }),
  createMessage({
    from: "sender@example.com",
    to: "user2@example.com",
    subject: "批量邮件 2",
    text: "这是第二封邮件",
  }),
];

// 批量发送（每批 10 封，批次之间延迟 1 秒）
const results = await client.sendBatch(messages, {
  batchSize: 10,
  delay: 1000,
  continueOnError: true, // 失败时继续发送
});

// 检查结果
for (const [index, result] of results.entries()) {
  if (result.success) {
    console.log(`邮件 ${index + 1} 发送成功`);
  } else {
    console.error(`邮件 ${index + 1} 发送失败: ${result.error}`);
  }
}
```

### 使用 Gmail SMTP

```typescript
const client = new SmtpClient({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com",
    password: "your-app-password", // 使用应用专用密码
  },
});
```

### 使用自定义邮件头

```typescript
const message = createMessage({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "自定义邮件头",
  text: "这是一封测试邮件",
  headers: {
    "X-Custom-Header": "custom-value",
    "X-Priority": "1",
  },
});
```

## API 文档

### SmtpClient

SMTP 客户端类，用于连接和发送邮件。

#### 构造函数

```typescript
new SmtpClient(config: SmtpConfig)
```

**参数**：
- `config.host` (string): SMTP 服务器地址
- `config.port` (number, 可选): SMTP 服务器端口（默认：587）
- `config.secure` (boolean, 可选): 是否使用 TLS/SSL（默认：false，使用 STARTTLS）
- `config.auth` (object, 可选): 认证信息
  - `auth.user` (string): 用户名
  - `auth.password` (string): 密码
- `config.timeout` (number, 可选): 连接超时时间（毫秒，默认：30000）
- `config.ignoreTLS` (boolean, 可选): 是否忽略 TLS 证书错误（默认：false）

#### 方法

##### `connect()`

连接到 SMTP 服务器。

```typescript
await client.connect();
```

##### `send(message)`

发送邮件。

```typescript
await client.send(message: Message | MessageOptions);
```

##### `sendBatch(messages, options?)`

批量发送邮件。

```typescript
const results = await client.sendBatch(
  messages: (Message | MessageOptions)[],
  options?: {
    batchSize?: number; // 每批发送的数量（默认：10）
    delay?: number; // 批次之间的延迟（毫秒，默认：1000）
    continueOnError?: boolean; // 是否在失败时继续发送（默认：true）
  }
);
```

##### `close()`

关闭 SMTP 连接。

```typescript
await client.close();
```

### createMessage

创建邮件消息。

```typescript
const message = createMessage(options: MessageOptions);
```

**参数**：
- `options.from` (string | EmailAddress): 发件人
- `options.to` (string | EmailAddress | array): 收件人
- `options.cc` (string | EmailAddress | array, 可选): 抄送
- `options.bcc` (string | EmailAddress | array, 可选): 密送
- `options.replyTo` (string | EmailAddress, 可选): 回复地址
- `options.subject` (string): 邮件主题
- `options.text` (string, 可选): 纯文本内容
- `options.html` (string, 可选): HTML 内容
- `options.attachments` (EmailAttachment[], 可选): 附件列表
- `options.priority` ("high" | "normal" | "low", 可选): 邮件优先级
- `options.headers` (Record<string, string>, 可选): 自定义邮件头

### createTemplateMessage

创建模板邮件消息。

```typescript
const message = createTemplateMessage(
  template: { text?: string; html?: string },
  data: Record<string, any>,
  options: Omit<MessageOptions, "text" | "html">
);
```

### renderTemplate

渲染模板字符串。

```typescript
const result = renderTemplate(
  template: string,
  data: Record<string, any>
);
```

支持 `{{variable}}` 格式的变量替换。

---

## 📝 备注

- **应用专用密码**：使用 Gmail 等邮件服务时，需要使用应用专用密码，而不是普通密码。
- **TLS 证书**：在生产环境中，建议不要使用 `ignoreTLS: true`。
- **批量发送**：批量发送时建议设置适当的延迟，避免被邮件服务器限制。
- **连接管理**：发送完成后记得调用 `close()` 关闭连接。
- **无外部依赖**：纯 TypeScript 实现，不依赖任何外部库。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License - 详见 [LICENSE.md](./LICENSE.md)

---

<div align="center">

**Made with ❤️ by Dreamer Team**

</div>
