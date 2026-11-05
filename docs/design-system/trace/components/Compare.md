# Compare

对比表：拿 2–4 个方案按同一组维度并排比较，比如 B+Tree / LSM-Tree / Hash、Raft / Paxos、Docker / containerd。有两种版式，默认是笔记本版。

- 提供：
  - `options`：`{name, sub}`。name 写方案名，sub 写代表实现，如 `InnoDB`。
  - `rows`：`{k, note?, values}`。values 和 options 一一对应，每项可以是字符串，也可以是 `{v, verdict}`。
  - 可选：`title`、`kicker`、`focus`（重点列下标）、`focusLabel`、`corner`（左上角标签，默认「维度」）、`summary`（一句话结论，只在笔记本版显示）、`footer`（前提条件或数据来源）、`variant`。
- verdict 有三档：`good` 用 `+` 加绿，`bad` 用 `−` 加琥珀，`neutral` 用 `·`。总是字形配文字，不只靠颜色。
- 维度最多 8 行。单元格写短语（「O(log n)」「顺序追加」），不写整句；需要解释的放进 `note`。

**`variant="notebook"`（默认）**：用在文章页。整张表是一张卡片，表头放在凹面底上。每个方案前有一个小色块，依次是橙、蓝、黑、绿。判定写成浅色胶囊。焦点列整列铺浅荧光绿，表头右上角贴一个略微倾斜的橙色贴纸。`summary` 显示为底部的「→ 结论」条，像同事给出的一句判断。

**`variant="swiss"`**：用在系统剖析页。不画外框，表顶一条 3px 结构线，每个方案上面一个大号编号（01、02…）。焦点列顶部是一条信号橙粗条。这一版不显示 `summary`，取舍交给正文。
