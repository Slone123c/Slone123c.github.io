# Button

一个视图里最多一个 **primary**（信号橙），留给「这一页存在的理由」：开始演示、订阅、阅读全文。其余用 secondary；工具栏与步进控制用 ghost。

- 提供：`children`（动词开头的短语，如「下一步 →」「运行示例」）、`variant`、`size`、原生 button 属性。
- 方向箭头用 `→ ←` 字符写在文字里，不另配图标。
- primary 上的文字是深色 `on-signal`，不要改成白色。
- Hover：primary 上移 2px 并落下 ink 硬影；不做渐变、不做发光。
