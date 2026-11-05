# CodeBlock

带文件名、行号、高亮行与编号标注的代码块。讲源码时最常用的组件。

- 提供：`code`（字符串）、`lang`、`filename`（写真实路径，如 `runtime/map.go`）、`highlight`（要强调的行号）、`notes`（行号 → Marker 编号）、`start`（起始行号，对齐源码真实行号）。
- 高亮行用 `mark-soft` 底 + 左侧荧光绿 3px 线；一段代码最多高亮 3 处。
- 内置轻量着色：关键字 cobalt、字符串 green、数字 signal-text、注释 ink-subtle 斜体。需要完整语法高亮时可换 Shiki，但保持这四个颜色映射。
- 摘录源码时删去无关分支，用 `// ...` 标出省略，并保留真实起始行号。
