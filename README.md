# Jiamian 个人导航页

这是一个轻量级、响应式的个人导航门户网站，它能根据 JSON 配置文件动态渲染服务链接。项目界面简洁美观，拥有固定的背景图片，并能适应各种屏幕尺寸。

## 功能特点

-   **动态配置**：所有服务链接和域名逻辑都通过 `config.json` 进行控制，无需修改代码即可更新。
-   **响应式设计**：布局会自动适应宽屏、标准桌面和移动设备，确保在任何设备上都有良好的体验。
-   **智能域名处理**：自动检测当前访问的主机名，智能判断使用主域名、别名还是备份域名来生成服务链接。
-   **美观的 UI**：采用磨砂玻璃拟态风格（Glassmorphism），配合平滑的悬停动画和全屏背景图。

## 配置说明

核心逻辑由 `config.json` 驱动。你可以修改此文件来更新域名和服务，而无需触碰 HTML 代码。

### `config.json` 结构

```json
{
  "domains": {
    "primary": "jiamianai.com",
    "aliases": [
      "jiamian0128.pages.dev"
    ],
    "backups": [
      "jiamian.ip-ddns.com",
      "jiamian.ddns-ip.net"
    ]
  },
  "services": [
    "arm",
    "ora",
    "orb",
    "nas",
    "gb",
    "ol",
    "op",
    "libretv",
    "nano",
    "cep",
    "image"
  ]
}
```

-   **`domains` (域名配置)**:
    -   `primary`: 主域名，用于构建默认的服务链接 (例如: `service.primary.com`)。
    -   `aliases`: 别名列表，这些域名也会使用主域名的逻辑。
    -   `backups`: 备份域名列表。如果通过这些域名访问，生成的服务链接将使用当前的备份主机名，而不是主域名。
-   **`services` (服务列表)**: 子域名列表。每一项都会生成一个按钮，链接到 `https://<service>.<base_domain>`。

## 项目结构

-   `index.html`: 主要入口文件，包含 HTML 结构、CSS 样式和 JavaScript 逻辑。
-   `config.json`: 域名和服务的配置文件。

## 使用指南

1.  **克隆仓库**:
    ```bash
    git clone https://github.com/hechushitaoyuan/jiamian0128-webpage.git
    ```
2.  **本地开发**:
    你可以直接在浏览器中打开 `index.html`，但由于 `fetch` API 的跨域限制，建议使用本地服务器运行：
    ```bash
    # 使用 Python 3
    python -m http.server 8000
    ```
    然后访问 `http://localhost:8000`。

3.  **部署**:
    这是一个纯静态网站。你可以将其部署到任何静态托管服务，如 GitHub Pages, Cloudflare Pages, Vercel, 或 Netlify。

## 改进建议

如果你计划进一步开发此项目，可以考虑以下改进：

1.  **代码分离**: 将 CSS 移动到 `style.css`，JavaScript 移动到 `script.js`，以便于维护。
2.  **资源配置化**: 将背景图片 URL 和 Logo URL 也放入 `config.json` 中，使主题完全由数据驱动。
3.  **安全性**: 为生成的服务链接添加 `rel="noopener noreferrer"` 属性，提高安全性。
4.  **SEO**: 在 `index.html` 中添加 meta description 标签，优化搜索引擎收录。

## 许可证

[MIT](LICENSE)
