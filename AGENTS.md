# Substance 项目协作指南（AGENTS）

本文件面向在本仓库内工作的开发者/Agent，目标是帮助你快速理解项目、正确运行环境、定位核心代码并进行扩展。

## 1. 项目简介

Substance 是一个“可定制的 HTML -> Markdown 抽取框架”，当前以 Wikipedia 作为主要 PoC 场景。  
项目采用 monorepo（`pnpm workspace`）组织，核心能力在 `pkgs/common`，并由 Web 页面与 Chrome 扩展复用。

当前包含 4 个主要包：

- `@substance/common`：抽取核心（`ExtractManager`）+ Wikipedia 规则 + 通用 Markdown 编辑/预览组件
- `@substance/web`：网页端 UI（输入 URL -> 调 Worker 拉原始 HTML -> 本地抽取为 Markdown）
- `@substance/webext`：浏览器扩展（对当前标签页选区/整页抽取）
- `@substance/worker`：Cloudflare Worker，提供 `/api/wikipedia` 代理接口

## 2. 技术栈与依赖

- 包管理：`pnpm workspace`
- 语言：TypeScript
- 打包：Webpack 5
- UI：React + Mantine
- 状态：zustand
- 抽取/转换：cheerio + turndown + markdown-it
- 扩展：Chrome Extension Manifest V3
- 服务端：Cloudflare Workers

## 3. 环境准备与安装

## 3.1 推荐环境

- Node.js: 18+（建议 LTS）
- pnpm: 10.x

## 3.2 安装依赖

```bash
pnpm install --link-workspace-packages=true
```

如果遇到历史 `node_modules`/链接异常（monorepo 常见）：

```bash
pnpm clean-node-modules
pnpm install --link-workspace-packages=true
```

## 4. 常用命令

## 4.1 全仓验证

```bash
pnpm -r build
pnpm --filter @substance/common test
```

## 4.2 分包开发/构建

```bash
# common
pnpm --filter @substance/common build
pnpm --filter @substance/common test
pnpm --filter @substance/common cli -- https://en.wikipedia.org/wiki/Feudalism

# web
pnpm --filter @substance/web start
pnpm --filter @substance/web build

# webext
pnpm --filter @substance/webext start
pnpm --filter @substance/webext build

# worker（本包未内置 script，直接用 wrangler）
cd pkgs/worker
wrangler dev src/index.ts
```

## 5. 目录结构

```text
.
├─ pkgs/
│  ├─ common/
│  │  ├─ src/
│  │  │  ├─ extract.ts                  # ExtractManager 与抽取流程
│  │  │  ├─ extractors/wikipedia.ts     # Wikipedia 规则
│  │  │  ├─ metadata.ts                 # 页面 metadata 抽取
│  │  │  ├─ markdown.ts                 # Markdown 渲染
│  │  │  ├─ components/                 # MarkdownEditor / MarkdownViewer / store
│  │  │  └─ utils/                      # dom / hooks / string
│  │  └─ src/__tests__/                 # 抽取回归测试
│  ├─ web/
│  │  └─ src/pages/Extractor/           # URL 抽取页面
│  ├─ webext/
│  │  ├─ src/background.ts              # 扩展主流程入口
│  │  ├─ src/content_script.ts          # 读取当前页面 HTML/选区
│  │  ├─ src/extractor.tsx              # 扩展内编辑/预览页
│  │  └─ public/manifest.json
│  └─ worker/
│     └─ src/index.ts                   # /api/wikipedia
├─ devnotes/
└─ AGENTS.md
```

## 6. 主要接口说明

## 6.1 `@substance/common` 抽取核心

文件：`pkgs/common/src/extract.ts`

关键导出：

- `class ExtractManager`
- `matchExtractor(extractor, html, url)`
- 默认导出 `ExtractManager`

`ExtractManager` 关键方法：

- `getDefaultOptions()`：从 extractor 定义返回默认选项
- `getOptions(inputOptions)`：校验 + 合并输入选项
- `extract(html, url, inputOptions?)`：执行抽取，返回：
  - `title`
  - `content`
  - `contentMarkdown`
  - `excerpt`
  - `author`
  - `publishedDate`
  - `extraData`

### Extractor 规则结构（简化）

```ts
interface Extractor {
  match: { domain?: string|RegExp; url?: RegExp; selectors?: string[] }
  options: Record<string, { help: string; default: any }>
  content: {
    selectors: string[]
    clean: string[]
    transforms: Record<string, (el, state) => void>
    preprocess?: (...)
    process?: (...)
    processElement?: (...)
    turndown?: {
      options: TurndownService.Options
      customize?: (...)
    }
    markdown?: (...)
  }
  title: { selectors: string[] }
  extraData: ($, state) => any
}
```

## 6.2 Wikipedia 规则

文件：`pkgs/common/src/extractors/wikipedia.ts`

当前支持（通过 options 控制）：

- `removeLinks`
- `removeImages`
- `removeTables`
- `keepFigureImage`
- `getTagsFromCategories`

## 6.3 共享 Markdown 组件与状态

文件：

- `pkgs/common/src/components/MarkdownEditor/index.tsx`
- `pkgs/common/src/components/MarkdownViewer/index.tsx`
- `pkgs/common/src/components/stores.ts`

共享 store：

```ts
interface MarkdownState {
  url: string
  title: string
  contentMarkdown: string
  extraData: any
}
```

## 6.4 Worker 接口

文件：`pkgs/worker/src/index.ts`

### `GET /api/wikipedia?url=<wikipedia-page-url>`

- 入参：`url`（必须匹配 `https://*.wikipedia.org/*`）
- 行为：Worker 拉取目标页面 HTML 并返回文本（CORS 允许 `*`）
- 成功：`text/html`
- 失败：`application/json`，例如：

```json
{"error":"url is required"}
```

## 6.5 扩展消息链路（webext）

文件：

- `pkgs/webext/src/consts.ts`
- `pkgs/webext/src/background.ts`
- `pkgs/webext/src/content_script.ts`
- `pkgs/webext/src/extractor.tsx`

流程：

1. `background`（点击图标/快捷键/右键）发送 `ExtractCurrentPage0` 到当前 tab
2. `content_script` 取选区 HTML；无选区时取整页 HTML，并采集 metadata
3. `content_script` 请求后台确保 `extractor.html` 页面已打开（`EnsurePageReady`）
4. `content_script` 发送 `ExtractCurrentPage1` 给扩展页
5. `extractor.tsx` 用 `ExtractManager(WikipediaExtractor)` 抽取并写入 `useMarkdownStore`

## 7. 使用示例

## 7.1 在 Node/TS 中直接抽取

```ts
import axios from 'axios'
import ExtractManager from '@substance/common/extract'
import { WikipediaExtractor } from '@substance/common/extractors/wikipedia'

const em = new ExtractManager(WikipediaExtractor)
const url = 'https://en.wikipedia.org/wiki/Feudalism'
const html = (await axios.get(url)).data

const result = em.extract(html, url, {
  removeLinks: false,
  removeImages: true,
})

console.log(result.title)
console.log(result.contentMarkdown.slice(0, 300))
```

## 7.2 Web 端流程

1. 访问首页输入 Wikipedia URL
2. 前端调用 Worker 拉取 HTML（`/api/wikipedia`）
3. 前端本地执行 `extractManager.extract(...)`
4. 在左右分栏中编辑/预览 Markdown，并可下载 `.md`

## 7.3 扩展端流程

1. 在 Chrome `加载已解压的扩展程序`，选择 `pkgs/webext/dist`
2. 打开目标网页（Wikipedia 最稳定）
3. 点击扩展图标或使用快捷键 `Alt+E`
4. 扩展页显示可编辑 Markdown 与目录预览

## 8. 开发约定与注意事项

- 优先修改 `pkgs/common` 共享能力，再让 `web`/`webext` 接入，避免重复逻辑。
- 对抽取逻辑变更后，请务必运行：
  - `pnpm --filter @substance/common test`
- 对打包链路或依赖变更后，请务必运行：
  - `pnpm -r build`
- 当前构建可能出现非阻断 warning（Sass deprecation、bundle size），不影响主流程。
- 若要新增站点抽取器，建议：
  - 在 `pkgs/common/src/extractors/` 新建规则
  - 增加对应测试数据与回归用例（`src/__tests__/data`）
  - 在 web/webext 入口中按需接入

## 9. 快速排查清单

- 页面抽不出内容：
  - 检查 URL 是否匹配 extractor 的 `match` 规则
  - 检查 `content.selectors[0]` 是否在目标 HTML 中存在
- Web 请求失败：
  - 检查 `pkgs/web/src/config/*.ts` 的 `api.baseUrl`
  - 本地联调时确保 worker 在运行
- 扩展无响应：
  - 确认 `dist` 已重新 build
  - 打开扩展页/Service Worker 控制台查看 `MsgType` 链路日志

