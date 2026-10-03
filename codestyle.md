# SPECTRA 代码规范

> 来源（顶部标注，作业要求）：
> - JavaScript / TypeScript：[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
> - Vue（阶段二若采用）：[Vue 官方风格指南](https://vuejs.org/style-guide/) Priority A / B
> - Python（阶段二若采用后端）：[PEP 8](https://peps.python.org/pep-0008/) + [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
> - 通用工程约定：命名清晰、提交原子化、不提交构建产物

本文件是对上述官方规范的**课程项目裁剪**，不是另起一套规则。冲突时以上游官方文档为准。

## 1. 文件与目录

- 源码使用 UTF-8，换行 LF。
- 目录按职责划分：`frontend/`、`backend/`、`deploy/`、`data/`、`prototype/`。博客文稿不进本仓。
- 不提交 `node_modules/`、`venv/`、`.class`、`.jar`、`.exe`、编译缓存，统一由 `.gitignore` 忽略。

## 2. 命名

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 文件（JS/Vue） | kebab-case | `paper-list.vue` |
| 组件 | PascalCase | `KeywordGraph` |
| 函数 / 变量 | camelCase | `fetchPaperByTitle` |
| 常量 | UPPER_SNAKE | `MAX_IMPORT_ROWS` |
| Python 模块 / 函数 | snake_case | `extract_keywords` |
| CSS 自定义属性 | kebab-case | `--accent-cvpr` |
| Git 分支 | 小写短横线 | `dev`、`feat/paper-crawl` |

禁止拼音与无意义缩写（`tmp1`、`data2`）。会议名保留官方缩写：`CVPR`、`ICCV`、`ECCV`。

## 3. 格式

- JS/TS：2 空格缩进；Python：4 空格；不使用 Tab。
- 语句尽量显式分号（JS，遵循 Google JS）。
- 单文件不宜超过 400 行；超出则拆分为模块。
- 导入分组：标准库 / 第三方 / 本地，组间空行。

## 4. 注释与可解释性

- 解释「为什么」，不要复述代码「做了什么」。
- AI 生成的关键算法（关键词抽取、热度公式、图谱布局）必须有注释写明口径。
- 公开函数写一行职责说明；复杂分支写前置条件。

## 5. 函数与错误处理

- 函数只做一件事，优先返回值而不是修改全局状态。
- 网络请求必须处理超时、空结果、非 200。
- 禁止吞掉异常：至少记录日志并给用户可读提示。
- 用户输入（论文标题、导入文件）必须校验后再请求外部站点。

## 6. 前端约定（阶段二）

- 组件名多个单词，避免与 HTML 冲突。
- 模板中不用 `v-if` 与 `v-for` 写在同一元素（Vue 风格指南）。
- 样式以设计令牌为准，禁止页面内随意硬编码颜色。
- 图表使用 ECharts 等库时，销毁实例避免内存泄漏。

## 7. Git 提交

- 在 `dev` 分支开发，功能完成后再合并 `master`。
- 一次提交只包含一个可运行的小功能。
- 提交说明使用中文或英文完整句子，说明动机，例如：
  - `feat: 支持按标题模糊查询论文`
  - `fix: 查询未命中时触发联网补全`
- 禁止虚构提交；commit 需能对应真实改动。
- 人机协作可在说明中标注：`ai-draft`（AI 初稿）/ `human-review`（人工修正）。

## 8. 安全与学术规范

- 不把 API Key、云服务器密码写入仓库。
- 爬取仅用于课程教学，遵守目标站点 robots 与访问频率限制。
- 不提交未经理解的 AI 代码；无法解释的代码不得合入 `main`。
