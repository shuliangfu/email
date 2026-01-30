/**
 * @module @dreamer/email
 *
 * 邮件发送库，提供 SMTP 客户端、HTML 邮件支持等功能。
 *
 * 功能特性：
 * - SMTP 客户端：支持连接、认证、发送邮件
 * - HTML 邮件支持：支持纯文本和 HTML 格式邮件
 * - 附件支持：支持添加文件附件
 * - 模板邮件：支持使用模板生成邮件内容
 * - 批量发送：支持批量发送邮件
 *
 * @example
 * ```typescript
 * import { SmtpClient, createMessage } from "jsr:@dreamer/email";
 *
 * // 创建 SMTP 客户端
 * const client = new SmtpClient({
 *   host: "smtp.example.com",
 *   port: 587,
 *   secure: false, // 使用 STARTTLS
 *   auth: {
 *     user: "user@example.com",
 *     password: "password"
 *   }
 * });
 *
 * // 创建邮件消息
 * const message = createMessage({
 *   from: "sender@example.com",
 *   to: "recipient@example.com",
 *   subject: "测试邮件",
 *   text: "这是一封测试邮件",
 *   html: "<h1>这是一封测试邮件</h1>"
 * });
 *
 * // 发送邮件
 * await client.send(message);
 * ```
 */

import type { ServiceContainer } from "@dreamer/service";

/**
 * SMTP 客户端配置选项
 */
export interface SmtpConfig {
  /** SMTP 服务器地址 */
  host: string;
  /** SMTP 服务器端口（默认：587） */
  port?: number;
  /** 是否使用 TLS/SSL（默认：false，使用 STARTTLS） */
  secure?: boolean;
  /** 认证信息 */
  auth?: {
    /** 用户名 */
    user: string;
    /** 密码 */
    password: string;
  };
  /** 连接超时时间（毫秒，默认：30000） */
  timeout?: number;
  /** 是否忽略 TLS 证书错误（默认：false，仅用于开发环境） */
  ignoreTLS?: boolean;
}

/**
 * 邮件地址
 */
export interface EmailAddress {
  /** 邮箱地址 */
  address: string;
  /** 显示名称（可选） */
  name?: string;
}

/**
 * 邮件附件
 */
export interface EmailAttachment {
  /** 文件名 */
  filename: string;
  /** 文件内容（Base64 编码或 Buffer） */
  content: string | Uint8Array;
  /** 内容类型（可选，默认根据文件扩展名推断） */
  contentType?: string;
  /** 内容 ID（用于内联附件，可选） */
  cid?: string;
}

/**
 * 邮件消息选项
 */
export interface MessageOptions {
  /** 发件人 */
  from: string | EmailAddress;
  /** 收件人（可以是字符串、EmailAddress 或数组） */
  to: string | EmailAddress | (string | EmailAddress)[];
  /** 抄送（可选） */
  cc?: string | EmailAddress | (string | EmailAddress)[];
  /** 密送（可选） */
  bcc?: string | EmailAddress | (string | EmailAddress)[];
  /** 回复地址（可选） */
  replyTo?: string | EmailAddress;
  /** 邮件主题 */
  subject: string;
  /** 纯文本内容（可选） */
  text?: string;
  /** HTML 内容（可选） */
  html?: string;
  /** 附件列表（可选） */
  attachments?: EmailAttachment[];
  /** 邮件优先级（可选：'high' | 'normal' | 'low'） */
  priority?: "high" | "normal" | "low";
  /** 自定义邮件头（可选） */
  headers?: Record<string, string>;
}

/**
 * 邮件消息类
 */
export class Message {
  public from: EmailAddress;
  public to: EmailAddress[];
  public cc?: EmailAddress[];
  public bcc?: EmailAddress[];
  public replyTo?: EmailAddress;
  public subject: string;
  public text?: string;
  public html?: string;
  public attachments?: EmailAttachment[];
  public priority?: "high" | "normal" | "low";
  public headers?: Record<string, string>;

  constructor(options: MessageOptions) {
    // 解析发件人
    this.from = this.parseAddress(options.from);

    // 解析收件人
    if (Array.isArray(options.to)) {
      this.to = options.to.map((addr) => this.parseAddress(addr));
    } else {
      this.to = [this.parseAddress(options.to)];
    }

    // 解析抄送
    if (options.cc) {
      if (Array.isArray(options.cc)) {
        this.cc = options.cc.map((addr) => this.parseAddress(addr));
      } else {
        this.cc = [this.parseAddress(options.cc)];
      }
    }

    // 解析密送
    if (options.bcc) {
      if (Array.isArray(options.bcc)) {
        this.bcc = options.bcc.map((addr) => this.parseAddress(addr));
      } else {
        this.bcc = [this.parseAddress(options.bcc)];
      }
    }

    // 解析回复地址
    if (options.replyTo) {
      this.replyTo = this.parseAddress(options.replyTo);
    }

    this.subject = options.subject;
    this.text = options.text;
    this.html = options.html;
    this.attachments = options.attachments;
    this.priority = options.priority || "normal";
    this.headers = options.headers;
  }

  /**
   * 解析邮件地址
   * @param address 地址字符串或 EmailAddress 对象
   * @returns EmailAddress 对象
   */
  private parseAddress(address: string | EmailAddress): EmailAddress {
    if (typeof address === "string") {
      // 解析 "Name <email@example.com>" 格式
      const match = address.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        return {
          name: match[1].trim(),
          address: match[2].trim(),
        };
      }
      return { address: address.trim() };
    }
    return address;
  }

  /**
   * 格式化邮件地址为字符串
   * @param addr EmailAddress 对象
   * @returns 格式化后的字符串
   */
  private formatAddress(addr: EmailAddress): string {
    if (addr.name) {
      return `${this.encodeHeader(addr.name)} <${addr.address}>`;
    }
    return addr.address;
  }

  /**
   * 编码邮件头（处理中文等特殊字符）
   * @param text 要编码的文本
   * @returns 编码后的字符串
   */
  private encodeHeader(text: string): string {
    // 如果包含非 ASCII 字符，使用 Base64 编码
    // deno-lint-ignore no-control-regex
    if (/[^\x00-\x7F]/.test(text)) {
      const encoded = btoa(
        unescape(encodeURIComponent(text)),
      );
      return `=?UTF-8?B?${encoded}?=`;
    }
    return text;
  }

  /**
   * 将消息转换为 MIME 格式
   * @returns MIME 格式的邮件内容
   */
  toMIME(): string {
    const boundary = `----=_Part_${Date.now()}_${
      Math.random().toString(36).substring(2)
    }`;
    const lines: string[] = [];

    // 邮件头
    lines.push(`From: ${this.formatAddress(this.from)}`);
    lines.push(
      `To: ${this.to.map((addr) => this.formatAddress(addr)).join(", ")}`,
    );

    if (this.cc && this.cc.length > 0) {
      lines.push(
        `Cc: ${this.cc.map((addr) => this.formatAddress(addr)).join(", ")}`,
      );
    }

    if (this.bcc && this.bcc.length > 0) {
      lines.push(
        `Bcc: ${this.bcc.map((addr) => this.formatAddress(addr)).join(", ")}`,
      );
    }

    if (this.replyTo) {
      lines.push(`Reply-To: ${this.formatAddress(this.replyTo)}`);
    }

    lines.push(`Subject: ${this.encodeHeader(this.subject)}`);
    lines.push(`Date: ${new Date().toUTCString()}`);
    lines.push(
      `Message-ID: <${Date.now()}-${Math.random().toString(36)}@dreamer>`,
    );

    // 优先级
    if (this.priority && this.priority !== "normal") {
      const priorityMap: Record<"high" | "low", string> = {
        high: "1 (Highest)",
        low: "5 (Lowest)",
      };
      lines.push(`X-Priority: ${priorityMap[this.priority] || "3 (Normal)"}`);
    }

    // 自定义头
    if (this.headers) {
      for (const [key, value] of Object.entries(this.headers)) {
        lines.push(`${key}: ${value}`);
      }
    }

    // MIME 版本和内容类型
    const hasAttachments = this.attachments && this.attachments.length > 0;
    const hasBothTextAndHtml = this.text && this.html;

    if (hasAttachments || hasBothTextAndHtml) {
      lines.push("MIME-Version: 1.0");
      lines.push(
        `Content-Type: multipart/${
          hasAttachments ? "mixed" : "alternative"
        }; boundary="${boundary}"`,
      );
      lines.push("");
      lines.push(`This is a multi-part message in MIME format.`);
      lines.push("");

      // 文本和 HTML 部分
      if (hasBothTextAndHtml) {
        lines.push(`--${boundary}`);
        lines.push(
          "Content-Type: multipart/alternative; boundary=inner-boundary",
        );
        lines.push("");

        if (this.text) {
          lines.push("--inner-boundary");
          lines.push("Content-Type: text/plain; charset=UTF-8");
          lines.push("Content-Transfer-Encoding: base64");
          lines.push("");
          lines.push(this.encodeBase64(this.text));
          lines.push("");
        }

        if (this.html) {
          lines.push("--inner-boundary");
          lines.push("Content-Type: text/html; charset=UTF-8");
          lines.push("Content-Transfer-Encoding: base64");
          lines.push("");
          lines.push(this.encodeBase64(this.html));
          lines.push("");
        }

        lines.push("--inner-boundary--");
        lines.push("");
      } else if (this.text) {
        lines.push(`--${boundary}`);
        lines.push("Content-Type: text/plain; charset=UTF-8");
        lines.push("Content-Transfer-Encoding: base64");
        lines.push("");
        lines.push(this.encodeBase64(this.text));
        lines.push("");
      } else if (this.html) {
        lines.push(`--${boundary}`);
        lines.push("Content-Type: text/html; charset=UTF-8");
        lines.push("Content-Transfer-Encoding: base64");
        lines.push("");
        lines.push(this.encodeBase64(this.html));
        lines.push("");
      }

      // 附件部分
      if (hasAttachments) {
        for (const attachment of this.attachments!) {
          lines.push(`--${boundary}`);
          const contentType = attachment.contentType ||
            this.getContentType(attachment.filename);
          lines.push(
            `Content-Type: ${contentType}; name="${
              this.encodeHeader(attachment.filename)
            }"`,
          );
          lines.push("Content-Transfer-Encoding: base64");
          if (attachment.cid) {
            lines.push(`Content-ID: <${attachment.cid}>`);
            lines.push("Content-Disposition: inline");
          } else {
            lines.push(
              `Content-Disposition: attachment; filename="${
                this.encodeHeader(attachment.filename)
              }"`,
            );
          }
          lines.push("");

          const content = typeof attachment.content === "string"
            ? attachment.content
            : this.uint8ArrayToBase64(attachment.content);
          // Base64 编码，每 76 字符换行
          const encoded = content.match(/.{1,76}/g)?.join("\r\n") || content;
          lines.push(encoded);
          lines.push("");
        }
      }

      lines.push(`--${boundary}--`);
    } else {
      // 简单邮件（只有文本或 HTML）
      const contentType = this.html ? "text/html" : "text/plain";
      lines.push("MIME-Version: 1.0");
      lines.push(`Content-Type: ${contentType}; charset=UTF-8`);
      lines.push("Content-Transfer-Encoding: base64");
      lines.push("");
      const content = this.html || this.text || "";
      lines.push(this.encodeBase64(content));
    }

    return lines.join("\r\n");
  }

  /**
   * Base64 编码文本
   * @param text 要编码的文本
   * @returns Base64 编码的字符串
   */
  private encodeBase64(text: string): string {
    const encoded = btoa(
      unescape(encodeURIComponent(text)),
    );
    // 每 76 字符换行（MIME 标准）
    return encoded.match(/.{1,76}/g)?.join("\r\n") || encoded;
  }

  /**
   * 将 Uint8Array 转换为 Base64
   * @param data Uint8Array 数据
   * @returns Base64 编码的字符串
   */
  private uint8ArrayToBase64(data: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary);
  }

  /**
   * 根据文件名获取内容类型
   * @param filename 文件名
   * @returns MIME 类型
   */
  private getContentType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      txt: "text/plain",
      html: "text/html",
      css: "text/css",
      js: "application/javascript",
      json: "application/json",
      pdf: "application/pdf",
      zip: "application/zip",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      svg: "image/svg+xml",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }
}

/**
 * SMTP 客户端类
 */
export class SmtpClient {
  private config: Required<Omit<SmtpConfig, "auth">> & {
    auth?: SmtpConfig["auth"];
  };
  private conn: Deno.TcpConn | Deno.TlsConn | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;

  constructor(config: SmtpConfig) {
    this.config = {
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      timeout: config.timeout || 30000,
      ignoreTLS: config.ignoreTLS || false,
      auth: config.auth,
    };
  }

  /**
   * 连接到 SMTP 服务器
   * @throws {Error} 连接失败时抛出错误
   */
  async connect(): Promise<void> {
    try {
      // 建立 TCP 连接
      const conn = await Deno.connect({
        hostname: this.config.host,
        port: this.config.port,
      });

      // 如果使用安全连接，立即升级为 TLS
      if (this.config.secure) {
        const tlsOptions: Deno.StartTlsOptions = {
          hostname: this.config.host,
        };
        if (this.config.ignoreTLS) {
          (tlsOptions as any).caCerts = [];
        }
        this.conn = await Deno.startTls(conn, tlsOptions);
      } else {
        this.conn = conn;
      }

      this.reader = this.conn.readable.getReader();
      this.writer = this.conn.writable.getWriter();

      // 读取服务器欢迎消息
      const response = await this.readResponse();
      if (!response.startsWith("220")) {
        throw new Error(`SMTP 连接失败: ${response}`);
      }

      // 发送 EHLO
      await this.sendCommand(`EHLO ${this.config.host}`);
      const ehloResponse = await this.readResponse();
      if (!ehloResponse.startsWith("250")) {
        throw new Error(`EHLO 失败: ${ehloResponse}`);
      }

      // 如果不使用安全连接，尝试 STARTTLS
      if (!this.config.secure) {
        // 检查服务器是否支持 STARTTLS
        const lines = ehloResponse.split("\r\n");
        const supportsStartTLS = lines.some((line) =>
          line.toUpperCase().includes("STARTTLS")
        );

        if (supportsStartTLS) {
          await this.sendCommand("STARTTLS");
          const startTlsResponse = await this.readResponse();
          if (!startTlsResponse.startsWith("220")) {
            throw new Error(`STARTTLS 失败: ${startTlsResponse}`);
          }

          // 升级连接为 TLS
          const tlsOptions: Deno.StartTlsOptions = {
            hostname: this.config.host,
          };
          if (this.config.ignoreTLS) {
            (tlsOptions as any).caCerts = [];
          }
          this.conn = await Deno.startTls(conn, tlsOptions);
          this.reader = this.conn.readable.getReader();
          this.writer = this.conn.writable.getWriter();

          // 重新发送 EHLO
          await this.sendCommand(`EHLO ${this.config.host}`);
          await this.readResponse();
        }
      }

      // 如果提供了认证信息，进行认证
      if (this.config.auth) {
        await this.authenticate();
      }
    } catch (error) {
      await this.close();
      throw new Error(
        `SMTP 连接失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * SMTP 认证（使用 PLAIN 或 LOGIN 方法）
   */
  private async authenticate(): Promise<void> {
    // 尝试 AUTH PLAIN
    try {
      const authString = `\u0000${this.config.auth!.user}\u0000${
        this.config.auth!.password
      }`;
      const encoded = btoa(authString);
      await this.sendCommand(`AUTH PLAIN ${encoded}`);
      const response = await this.readResponse();
      if (response.startsWith("235")) {
        return; // 认证成功
      }
    } catch {
      // PLAIN 失败，尝试 LOGIN
    }

    // 尝试 AUTH LOGIN
    await this.sendCommand("AUTH LOGIN");
    await this.readResponse(); // 应该返回 334 VXNlcm5hbWU6 (Username:)

    await this.sendCommand(btoa(this.config.auth!.user));
    await this.readResponse(); // 应该返回 334 UGFzc3dvcmQ6 (Password:)

    await this.sendCommand(btoa(this.config.auth!.password));
    const response = await this.readResponse();
    if (!response.startsWith("235")) {
      throw new Error(`SMTP 认证失败: ${response}`);
    }
  }

  /**
   * 发送命令到 SMTP 服务器
   * @param command 命令字符串
   */
  private async sendCommand(command: string): Promise<void> {
    if (!this.writer) {
      throw new Error("SMTP 连接未建立");
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(command + "\r\n");
    await this.writer.write(data);
  }

  /**
   * 读取 SMTP 服务器响应
   * @returns 响应字符串
   */
  private async readResponse(): Promise<string> {
    if (!this.reader) {
      throw new Error("SMTP 连接未建立");
    }

    const decoder = new TextDecoder();
    let response = "";

    while (true) {
      const { done, value } = await this.reader.read();
      if (done) {
        break;
      }

      response += decoder.decode(value, { stream: true });

      // SMTP 响应以 \r\n 结尾
      if (response.includes("\r\n")) {
        break;
      }
    }

    return response.trim();
  }

  /**
   * 发送邮件
   * @param message 邮件消息对象
   * @throws {Error} 发送失败时抛出错误
   */
  async send(message: Message | MessageOptions): Promise<void> {
    // 如果传入的是选项对象，创建 Message 实例
    const msg = message instanceof Message ? message : new Message(message);

    // 确保已连接
    if (!this.conn) {
      await this.connect();
    }

    try {
      // MAIL FROM
      await this.sendCommand(`MAIL FROM:<${msg.from.address}>`);
      let response = await this.readResponse();
      if (!response.startsWith("250")) {
        throw new Error(`MAIL FROM 失败: ${response}`);
      }

      // RCPT TO
      const recipients = [
        ...msg.to,
        ...(msg.cc || []),
        ...(msg.bcc || []),
      ];
      for (const recipient of recipients) {
        await this.sendCommand(`RCPT TO:<${recipient.address}>`);
        response = await this.readResponse();
        if (!response.startsWith("250")) {
          throw new Error(`RCPT TO 失败: ${response}`);
        }
      }

      // DATA
      await this.sendCommand("DATA");
      response = await this.readResponse();
      if (!response.startsWith("354")) {
        throw new Error(`DATA 失败: ${response}`);
      }

      // 发送邮件内容
      const mimeContent = msg.toMIME();
      await this.sendCommand(mimeContent);
      await this.sendCommand("."); // 结束 DATA 命令
      response = await this.readResponse();
      if (!response.startsWith("250")) {
        throw new Error(`发送邮件失败: ${response}`);
      }
    } catch (error) {
      throw new Error(
        `发送邮件失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /**
   * 批量发送邮件
   * @param messages 邮件消息数组
   * @param options 批量发送选项
   * @returns 发送结果数组
   */
  async sendBatch(
    messages: (Message | MessageOptions)[],
    options?: {
      /** 每批发送的数量（默认：10） */
      batchSize?: number;
      /** 批次之间的延迟（毫秒，默认：1000） */
      delay?: number;
      /** 是否在失败时继续发送（默认：true） */
      continueOnError?: boolean;
    },
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const batchSize = options?.batchSize || 10;
    const delay = options?.delay || 1000;
    const continueOnError = options?.continueOnError !== false;

    const results: Array<{ success: boolean; error?: string }> = [];

    // 确保已连接
    if (!this.conn) {
      await this.connect();
    }

    for (let i = 0; i < messages.length; i++) {
      try {
        await this.send(messages[i]);
        results.push({ success: true });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        results.push({ success: false, error: errorMsg });

        if (!continueOnError) {
          throw new Error(`批量发送失败: ${errorMsg}`);
        }
      }

      // 批次延迟
      if ((i + 1) % batchSize === 0 && i < messages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  /**
   * 关闭 SMTP 连接
   */
  async close(): Promise<void> {
    try {
      if (this.writer) {
        await this.sendCommand("QUIT");
        await this.readResponse();
        await this.writer.close();
        this.writer = null;
      }
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.conn) {
        this.conn.close();
        this.conn = null;
      }
    } catch {
      // 忽略关闭时的错误
    }
  }
}

/**
 * 创建邮件消息
 * @param options 消息选项
 * @returns Message 实例
 */
export function createMessage(options: MessageOptions): Message {
  return new Message(options);
}

/**
 * 邮件模板函数类型
 */
export type TemplateFunction = (data: Record<string, any>) => string;

/**
 * 简单的模板引擎
 * 支持 {{variable}} 格式的变量替换
 * @param template 模板字符串
 * @param data 数据对象
 * @returns 渲染后的字符串
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * 创建模板邮件消息
 * @param template 模板对象（包含 text 和/或 html 模板）
 * @param data 模板数据
 * @param options 其他消息选项
 * @returns Message 实例
 */
export function createTemplateMessage(
  template: { text?: string; html?: string },
  data: Record<string, any>,
  options: Omit<MessageOptions, "text" | "html">,
): Message {
  return new Message({
    ...options,
    text: template.text ? renderTemplate(template.text, data) : undefined,
    html: template.html ? renderTemplate(template.html, data) : undefined,
  });
}

/**
 * 邮件管理器配置选项
 */
export interface EmailManagerOptions {
  /** 管理器名称（用于服务容器识别） */
  name?: string;
  /** 默认 SMTP 配置（可选） */
  defaultConfig?: SmtpConfig;
}

/**
 * 邮件管理器
 *
 * 管理多个 SMTP 客户端实例，支持不同的邮件服务器配置
 */
export class EmailManager {
  /** SMTP 客户端实例映射表 */
  private clients: Map<string, SmtpClient> = new Map();
  /** 客户端配置映射表 */
  private configs: Map<string, SmtpConfig> = new Map();
  /** 默认 SMTP 配置 */
  private defaultConfig?: SmtpConfig;
  /** 服务容器实例 */
  private container?: ServiceContainer;
  /** 管理器名称 */
  private readonly managerName: string;

  /**
   * 创建邮件管理器实例
   * @param options 管理器配置选项
   */
  constructor(options: EmailManagerOptions = {}) {
    this.managerName = options.name || "default";
    this.defaultConfig = options.defaultConfig;
  }

  /**
   * 获取管理器名称
   * @returns 管理器名称
   */
  getName(): string {
    return this.managerName;
  }

  /**
   * 设置服务容器
   * @param container 服务容器实例
   */
  setContainer(container: ServiceContainer): void {
    this.container = container;
  }

  /**
   * 获取服务容器
   * @returns 服务容器实例，如果未设置则返回 undefined
   */
  getContainer(): ServiceContainer | undefined {
    return this.container;
  }

  /**
   * 从服务容器创建 EmailManager 实例
   * @param container 服务容器实例
   * @param name 管理器名称（默认 "default"）
   * @returns 关联了服务容器的 EmailManager 实例
   */
  static fromContainer(
    container: ServiceContainer,
    name = "default",
  ): EmailManager | undefined {
    const serviceName = `email:${name}`;
    return container.tryGet<EmailManager>(serviceName);
  }

  /**
   * 注册 SMTP 客户端配置
   * @param name 客户端名称
   * @param config SMTP 配置
   */
  registerClient(name: string, config: SmtpConfig): void {
    this.configs.set(name, config);
  }

  /**
   * 获取或创建 SMTP 客户端
   * @param name 客户端名称
   * @returns SmtpClient 实例
   * @throws {Error} 如果未注册配置且没有默认配置
   */
  getClient(name: string): SmtpClient {
    let client = this.clients.get(name);
    if (!client) {
      const config = this.configs.get(name) || this.defaultConfig;
      if (!config) {
        throw new Error(`未找到名为 "${name}" 的 SMTP 配置`);
      }
      client = new SmtpClient(config);
      this.clients.set(name, client);
    }
    return client;
  }

  /**
   * 检查是否存在指定名称的客户端
   * @param name 客户端名称
   * @returns 是否存在
   */
  hasClient(name: string): boolean {
    return this.clients.has(name) || this.configs.has(name);
  }

  /**
   * 移除客户端
   * @param name 客户端名称
   */
  async removeClient(name: string): Promise<void> {
    const client = this.clients.get(name);
    if (client) {
      await client.close();
      this.clients.delete(name);
    }
    this.configs.delete(name);
  }

  /**
   * 获取所有客户端名称
   * @returns 客户端名称数组
   */
  getClientNames(): string[] {
    const names = new Set([
      ...this.clients.keys(),
      ...this.configs.keys(),
    ]);
    return Array.from(names);
  }

  /**
   * 使用指定客户端发送邮件
   * @param clientName 客户端名称
   * @param message 邮件消息
   */
  async send(
    clientName: string,
    message: Message | MessageOptions,
  ): Promise<void> {
    const client = this.getClient(clientName);
    await client.send(message);
  }

  /**
   * 关闭所有客户端连接
   */
  async close(): Promise<void> {
    for (const client of this.clients.values()) {
      await client.close();
    }
    this.clients.clear();
  }
}

/**
 * 创建 EmailManager 的工厂函数
 * 用于服务容器注册
 * @param options 邮件管理器配置选项
 * @returns EmailManager 实例
 */
export function createEmailManager(
  options?: EmailManagerOptions,
): EmailManager {
  return new EmailManager(options);
}
