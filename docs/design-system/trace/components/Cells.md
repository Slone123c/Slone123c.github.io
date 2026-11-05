# Cells

把「一排格子」画出来：数组、哈希桶、Raft 日志、环形缓冲区、内存页、栈帧……几乎所有数据结构的第一张图。

- 提供：`cells`（值，或 `{v, state, tag, idx}`）、可选 `label`（如 `bucket[3]`）、`caption`、`showIndex`、`indexBase`、`cellWidth`。
- state 语义固定：`active` 正在被操作（信号橙、上浮）；`hit` 查找命中（荧光绿）；`ref` 被指针指向（钴蓝浅底）；`empty` 空槽（显示 ∅）；`dead` 已删除 / 已迁移（删除线）。
- `tag` 放在格子上方的小字，用来标指针或角色（`i`、`top`、`commit`、`head`）。
- 同一时刻最多一个 `active`；需要表达过程时放进 Stepper。
