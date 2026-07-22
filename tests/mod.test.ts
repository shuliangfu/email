/**
 * @fileoverview Email 测试
 */

import { ServiceContainer } from "@dreamer/service";
import { describe, expect, it } from "@dreamer/test";
import { setEmailLocale } from "../src/i18n.ts";
import {
  createEmailManager,
  createMessage,
  createTemplateMessage,
  EmailManager,
  renderTemplate,
  SmtpClient,
} from "../src/mod.ts";

describe("Email", () => {
  describe("SmtpClient", () => {
    it("应该创建 SMTP 客户端", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
        port: 587,
        secure: false,
      });

      expect(client).toBeTruthy();
    });

    it("应该支持认证配置", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
        port: 587,
        auth: {
          user: "test@example.com",
          password: "password",
        },
      });

      expect(client).toBeTruthy();
    });

    it("应该支持默认端口配置", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
      });

      expect(client).toBeTruthy();
    });

    it("应该支持安全连接配置", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
        port: 465,
        secure: true,
      });

      expect(client).toBeTruthy();
    });

    it("应该支持超时配置", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
        timeout: 60000,
      });

      expect(client).toBeTruthy();
    });

    it("应该支持忽略 TLS 证书错误配置", () => {
      const client = new SmtpClient({
        host: "smtp.example.com",
        ignoreTLS: true,
      });

      expect(client).toBeTruthy();
    });
  });

  describe("Message", () => {
    describe("创建消息", () => {
      it("应该创建基本邮件消息", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试邮件",
          text: "这是测试内容",
        });

        expect(message).toBeTruthy();
        expect(message.from.address).toBe("sender@example.com");
        expect(message.to.length).toBe(1);
        expect(message.to[0].address).toBe("recipient@example.com");
        expect(message.subject).toBe("测试邮件");
        expect(message.text).toBe("这是测试内容");
      });

      it("应该支持 EmailAddress 对象作为发件人", () => {
        const message = createMessage({
          from: { address: "sender@example.com", name: "发件人" },
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
        });

        expect(message.from.address).toBe("sender@example.com");
        expect(message.from.name).toBe("发件人");
      });

      it("应该解析带名称的邮件地址字符串", () => {
        const message = createMessage({
          from: "发件人 <sender@example.com>",
          to: "收件人 <recipient@example.com>",
          subject: "测试",
          text: "内容",
        });

        expect(message.from.address).toBe("sender@example.com");
        expect(message.from.name).toBe("发件人");
        expect(message.to[0].address).toBe("recipient@example.com");
        expect(message.to[0].name).toBe("收件人");
      });

      it("应该支持多个收件人（数组）", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: ["recipient1@example.com", "recipient2@example.com"],
          subject: "测试",
          text: "内容",
        });

        expect(message.to.length).toBe(2);
        expect(message.to[0].address).toBe("recipient1@example.com");
        expect(message.to[1].address).toBe("recipient2@example.com");
      });

      it("应该支持 EmailAddress 对象数组作为收件人", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: [
            { address: "recipient1@example.com", name: "收件人1" },
            { address: "recipient2@example.com" },
          ],
          subject: "测试",
          text: "内容",
        });

        expect(message.to.length).toBe(2);
        expect(message.to[0].address).toBe("recipient1@example.com");
        expect(message.to[0].name).toBe("收件人1");
        expect(message.to[1].address).toBe("recipient2@example.com");
      });
    });

    describe("抄送和密送", () => {
      it("应该支持抄送（cc）", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          cc: "cc@example.com",
          subject: "测试",
          text: "内容",
        });

        expect(message.cc).toBeTruthy();
        expect(message.cc!.length).toBe(1);
        expect(message.cc![0].address).toBe("cc@example.com");
      });

      it("应该支持多个抄送", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          cc: ["cc1@example.com", "cc2@example.com"],
          subject: "测试",
          text: "内容",
        });

        expect(message.cc!.length).toBe(2);
        expect(message.cc![0].address).toBe("cc1@example.com");
        expect(message.cc![1].address).toBe("cc2@example.com");
      });

      it("应该支持密送（bcc）", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          bcc: "bcc@example.com",
          subject: "测试",
          text: "内容",
        });

        expect(message.bcc).toBeTruthy();
        expect(message.bcc!.length).toBe(1);
        expect(message.bcc![0].address).toBe("bcc@example.com");
      });

      it("应该支持多个密送", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          bcc: ["bcc1@example.com", "bcc2@example.com"],
          subject: "测试",
          text: "内容",
        });

        expect(message.bcc!.length).toBe(2);
        expect(message.bcc![0].address).toBe("bcc1@example.com");
        expect(message.bcc![1].address).toBe("bcc2@example.com");
      });

      it("应该支持回复地址（replyTo）", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          replyTo: "reply@example.com",
          subject: "测试",
          text: "内容",
        });

        expect(message.replyTo).toBeTruthy();
        expect(message.replyTo!.address).toBe("reply@example.com");
      });
    });

    describe("邮件内容", () => {
      it("应该支持 HTML 邮件", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试邮件",
          html: "<h1>测试</h1>",
        });

        expect(message.html).toBe("<h1>测试</h1>");
      });

      it("应该同时支持文本和 HTML", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "纯文本内容",
          html: "<h1>HTML 内容</h1>",
        });

        expect(message.text).toBe("纯文本内容");
        expect(message.html).toBe("<h1>HTML 内容</h1>");
      });

      it("应该支持仅文本邮件", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "纯文本",
        });

        expect(message.text).toBe("纯文本");
        expect(message.html).toBeUndefined();
      });

      it("应该支持仅 HTML 邮件", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          html: "<p>HTML</p>",
        });

        expect(message.html).toBe("<p>HTML</p>");
        expect(message.text).toBeUndefined();
      });
    });

    describe("附件", () => {
      it("应该支持单个附件", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试邮件",
          text: "测试",
          attachments: [
            {
              filename: "test.txt",
              content: new TextEncoder().encode("test content"),
            },
          ],
        });

        expect(message.attachments).toBeTruthy();
        expect(message.attachments!.length).toBe(1);
        expect(message.attachments![0].filename).toBe("test.txt");
      });

      it("应该支持多个附件", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          attachments: [
            { filename: "file1.txt", content: new TextEncoder().encode("1") },
            { filename: "file2.txt", content: new TextEncoder().encode("2") },
          ],
        });

        expect(message.attachments!.length).toBe(2);
      });

      it("应该支持 Base64 编码的附件内容", () => {
        const base64Content = btoa("test content");
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          attachments: [
            {
              filename: "test.txt",
              content: base64Content,
            },
          ],
        });

        expect(message.attachments![0].content).toBe(base64Content);
      });

      it("应该支持附件内容类型", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          attachments: [
            {
              filename: "test.pdf",
              content: new TextEncoder().encode("pdf content"),
              contentType: "application/pdf",
            },
          ],
        });

        expect(message.attachments![0].contentType).toBe("application/pdf");
      });

      it("应该支持内联附件（CID）", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          html: '<img src="cid:image1">',
          attachments: [
            {
              filename: "image.png",
              content: new TextEncoder().encode("image data"),
              cid: "image1",
            },
          ],
        });

        expect(message.attachments![0].cid).toBe("image1");
      });
    });

    describe("优先级和自定义头", () => {
      it("应该支持高优先级", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          priority: "high",
        });

        expect(message.priority).toBe("high");
      });

      it("应该支持低优先级", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          priority: "low",
        });

        expect(message.priority).toBe("low");
      });

      it("应该默认使用普通优先级", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
        });

        expect(message.priority).toBe("normal");
      });

      it("应该支持自定义邮件头", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          headers: {
            "X-Custom-Header": "custom-value",
            "X-Another-Header": "another-value",
          },
        });

        expect(message.headers).toBeTruthy();
        expect(message.headers!["X-Custom-Header"]).toBe("custom-value");
        expect(message.headers!["X-Another-Header"]).toBe("another-value");
      });
    });

    describe("toMIME", () => {
      it("应该生成简单的文本邮件 MIME", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "Test Subject",
          text: "This is test content",
        });

        const mime = message.toMIME();
        expect(mime).toContain("From: sender@example.com");
        expect(mime).toContain("To: recipient@example.com");
        expect(mime).toContain("Subject: Test Subject");
        expect(mime).toContain("Content-Type: text/plain");
        expect(mime).toContain("MIME-Version: 1.0");
      });

      it("应该生成 HTML 邮件 MIME", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          html: "<h1>测试</h1>",
        });

        const mime = message.toMIME();
        expect(mime).toContain("Content-Type: text/html");
      });

      it("应该生成包含文本和 HTML 的 MIME", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "文本",
          html: "<h1>HTML</h1>",
        });

        const mime = message.toMIME();
        expect(mime).toContain("multipart/alternative");
        expect(mime).toContain("text/plain");
        expect(mime).toContain("text/html");
      });

      it("应该生成包含附件的 MIME", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "测试",
          text: "内容",
          attachments: [
            {
              filename: "test.txt",
              content: new TextEncoder().encode("附件内容"),
            },
          ],
        });

        const mime = message.toMIME();
        expect(mime).toContain("multipart/mixed");
        expect(mime).toContain("Content-Disposition: attachment");
        expect(mime).toContain('filename="test.txt"');
      });

      it("应该包含抄送和密送信息", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          cc: "cc@example.com",
          bcc: "bcc@example.com",
          subject: "测试",
          text: "内容",
        });

        const mime = message.toMIME();
        expect(mime).toContain("Cc: cc@example.com");
        expect(mime).toContain("Bcc: bcc@example.com");
      });

      it("应该包含回复地址", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          replyTo: "reply@example.com",
          subject: "测试",
          text: "内容",
        });

        const mime = message.toMIME();
        expect(mime).toContain("Reply-To: reply@example.com");
      });

      it("应该编码中文主题", () => {
        const message = createMessage({
          from: "sender@example.com",
          to: "recipient@example.com",
          subject: "中文主题测试",
          text: "内容",
        });

        const mime = message.toMIME();
        expect(mime).toContain("Subject:");
        // 中文应该被 Base64 编码
        expect(mime).toMatch(/Subject: =\?UTF-8\?B\?/);
      });

      it("应该格式化带名称的邮件地址", () => {
        const message = createMessage({
          from: { address: "sender@example.com", name: "发件人" },
          to: { address: "recipient@example.com", name: "收件人" },
          subject: "测试",
          text: "内容",
        });

        const mime = message.toMIME();
        expect(mime).toMatch(/From: .*sender@example\.com/);
        expect(mime).toMatch(/To: .*recipient@example\.com/);
      });
    });
  });

  describe("renderTemplate", () => {
    it("应该替换模板变量", () => {
      const template = "Hello, {{name}}! Your code is {{code}}.";
      const data = { name: "John", code: "1234" };
      const result = renderTemplate(template, data);

      expect(result).toBe("Hello, John! Your code is 1234.");
    });

    it("应该保留未定义的变量", () => {
      const template = "Hello, {{name}}! Code: {{code}}.";
      const data = { name: "John" };
      const result = renderTemplate(template, data);

      expect(result).toBe("Hello, John! Code: {{code}}.");
    });

    it("应该处理数字变量", () => {
      const template = "Count: {{count}}";
      const data = { count: 42 };
      const result = renderTemplate(template, data);

      expect(result).toBe("Count: 42");
    });

    it("应该处理多个相同变量", () => {
      const template = "{{name}} says hello to {{name}}";
      const data = { name: "Alice" };
      const result = renderTemplate(template, data);

      expect(result).toBe("Alice says hello to Alice");
    });
  });

  describe("createTemplateMessage", () => {
    it("应该创建模板邮件消息（文本）", () => {
      const template = {
        text: "Hello, {{name}}! Your code is {{code}}.",
      };
      const data = { name: "John", code: "1234" };
      const options = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "验证码",
      };

      const message = createTemplateMessage(template, data, options);

      expect(message.text).toBe("Hello, John! Your code is 1234.");
      expect(message.from.address).toBe("sender@example.com");
      expect(message.subject).toBe("验证码");
    });

    it("应该创建模板邮件消息（HTML）", () => {
      const template = {
        html: "<h1>Hello, {{name}}!</h1><p>Code: {{code}}</p>",
      };
      const data = { name: "John", code: "1234" };
      const options = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "验证码",
      };

      const message = createTemplateMessage(template, data, options);

      expect(message.html).toBe("<h1>Hello, John!</h1><p>Code: 1234</p>");
    });

    it("应该创建模板邮件消息（文本和 HTML）", () => {
      const template = {
        text: "Hello, {{name}}!",
        html: "<h1>Hello, {{name}}!</h1>",
      };
      const data = { name: "John" };
      const options = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "测试",
      };

      const message = createTemplateMessage(template, data, options);

      expect(message.text).toBe("Hello, John!");
      expect(message.html).toBe("<h1>Hello, John!</h1>");
    });

    it("应该支持其他消息选项", () => {
      const template = { text: "Hello, {{name}}!" };
      const data = { name: "John" };
      const options = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "测试",
        cc: "cc@example.com",
        priority: "high" as const,
      };

      const message = createTemplateMessage(template, data, options);

      expect(message.cc).toBeTruthy();
      expect(message.cc![0].address).toBe("cc@example.com");
      expect(message.priority).toBe("high");
    });
  });
});

describe("EmailManager", () => {
  it("应该创建 EmailManager 实例", () => {
    const manager = new EmailManager();
    expect(manager).toBeInstanceOf(EmailManager);
  });

  it("应该获取默认管理器名称", () => {
    const manager = new EmailManager();
    expect(manager.getName()).toBe("default");
  });

  it("应该获取自定义管理器名称", () => {
    const manager = new EmailManager({ name: "custom" });
    expect(manager.getName()).toBe("custom");
  });

  it("应该注册和获取 SMTP 客户端", () => {
    const manager = new EmailManager();
    manager.registerClient("main", {
      host: "smtp.example.com",
      port: 587,
    });

    const client = manager.getClient("main");
    expect(client).toBeInstanceOf(SmtpClient);
  });

  it("应该返回同一个客户端实例", () => {
    const manager = new EmailManager();
    manager.registerClient("main", {
      host: "smtp.example.com",
      port: 587,
    });

    const client1 = manager.getClient("main");
    const client2 = manager.getClient("main");
    expect(client1).toBe(client2);
  });

  it("应该在未注册配置时抛出错误", () => {
    // 【Why】CI runner 默认英文 locale，$tr("email.smtp.configNotFound") 返回英文；
    // 显式锁定 zh-CN 以匹配下方中文断言。
    setEmailLocale("zh-CN");
    const manager = new EmailManager();
    expect(() => manager.getClient("unknown")).toThrow(
      '未找到名为 "unknown" 的 SMTP 配置',
    );
  });

  it("应该使用默认配置创建客户端", () => {
    const manager = new EmailManager({
      defaultConfig: {
        host: "smtp.default.com",
        port: 465,
        secure: true,
      },
    });

    const client = manager.getClient("any");
    expect(client).toBeInstanceOf(SmtpClient);
  });

  it("应该检查客户端是否存在", () => {
    const manager = new EmailManager();

    expect(manager.hasClient("main")).toBe(false);

    manager.registerClient("main", {
      host: "smtp.example.com",
    });

    expect(manager.hasClient("main")).toBe(true);
  });

  it("应该移除客户端", async () => {
    const manager = new EmailManager();
    manager.registerClient("main", {
      host: "smtp.example.com",
    });

    manager.getClient("main"); // 创建实例
    expect(manager.hasClient("main")).toBe(true);

    await manager.removeClient("main");
    expect(manager.hasClient("main")).toBe(false);
  });

  it("应该获取所有客户端名称", () => {
    const manager = new EmailManager();
    manager.registerClient("smtp1", { host: "smtp1.example.com" });
    manager.registerClient("smtp2", { host: "smtp2.example.com" });

    const names = manager.getClientNames();
    expect(names).toContain("smtp1");
    expect(names).toContain("smtp2");
  });

  it("应该关闭所有客户端", async () => {
    const manager = new EmailManager();
    manager.registerClient("main", { host: "smtp.example.com" });
    manager.getClient("main");

    await manager.close();
    // 关闭后 clients map 应该被清空
    expect(manager.getClientNames()).toContain("main"); // 配置仍在
  });
});

describe("EmailManager ServiceContainer 集成", () => {
  it("应该设置和获取服务容器", () => {
    const manager = new EmailManager();
    const container = new ServiceContainer();

    expect(manager.getContainer()).toBeUndefined();

    manager.setContainer(container);
    expect(manager.getContainer()).toBe(container);
  });

  it("应该从服务容器获取 EmailManager", () => {
    const container = new ServiceContainer();
    const manager = new EmailManager({ name: "test" });
    manager.setContainer(container);

    container.registerSingleton("email:test", () => manager);

    const retrieved = EmailManager.fromContainer(container, "test");
    expect(retrieved).toBe(manager);
  });

  it("应该在服务不存在时返回 undefined", () => {
    const container = new ServiceContainer();
    const retrieved = EmailManager.fromContainer(container, "non-existent");
    expect(retrieved).toBeUndefined();
  });

  it("应该支持多个 EmailManager 实例", () => {
    const container = new ServiceContainer();

    const internalManager = new EmailManager({ name: "internal" });
    internalManager.setContainer(container);
    internalManager.registerClient("main", { host: "internal.smtp.com" });

    const externalManager = new EmailManager({ name: "external" });
    externalManager.setContainer(container);
    externalManager.registerClient("main", { host: "external.smtp.com" });

    container.registerSingleton("email:internal", () => internalManager);
    container.registerSingleton("email:external", () => externalManager);

    expect(EmailManager.fromContainer(container, "internal")).toBe(
      internalManager,
    );
    expect(EmailManager.fromContainer(container, "external")).toBe(
      externalManager,
    );
  });
});

describe("createEmailManager 工厂函数", () => {
  it("应该创建 EmailManager 实例", () => {
    const manager = createEmailManager();
    expect(manager).toBeInstanceOf(EmailManager);
  });

  it("应该使用默认名称", () => {
    const manager = createEmailManager();
    expect(manager.getName()).toBe("default");
  });

  it("应该使用自定义名称", () => {
    const manager = createEmailManager({ name: "custom" });
    expect(manager.getName()).toBe("custom");
  });

  it("应该能够在服务容器中注册", () => {
    const container = new ServiceContainer();

    container.registerSingleton(
      "email:main",
      () => createEmailManager({ name: "main" }),
    );

    const manager = container.get<EmailManager>("email:main");
    expect(manager).toBeInstanceOf(EmailManager);
    expect(manager.getName()).toBe("main");
  });

  it("应该支持默认配置", () => {
    const manager = createEmailManager({
      defaultConfig: {
        host: "smtp.example.com",
        port: 587,
      },
    });

    const client = manager.getClient("any-name");
    expect(client).toBeInstanceOf(SmtpClient);
  });
});
