# Figure

图示容器：工程笔记本式的点阵底板 + 「图 n」编号图注。所有示意图（SVG、Cells 组合、架构图）都放进来。

- 提供：`children`（图本身）、`n`（图号，全文连续）、`caption`（一句话说图在表达什么，而不是「如图所示」）、`grid={false}` 关闭点阵。
- 图内配色只用 token：节点底 `surface`，描边 `line-strong`，焦点 `signal`，指针 / 引用 `cobalt`，命中 `mark`。
- 箭头 1.5px、实心三角头；连线用直角折线，不用曲线。
- 图中文字用等宽 12–13px，与 Marker 编号对应正文。
