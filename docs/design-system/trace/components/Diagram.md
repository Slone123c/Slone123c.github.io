# Diagram

架构图 / 流程图：节点放在网格上，用直角折线箭头连接。一套画法可以复用到 Kubernetes 控制面、MySQL 主从、Redis 集群、Raft 消息流和请求链路。有两种版式，默认是笔记本版。

- 提供：`cols`、`rows`（网格尺寸，单位是格）、`nodes`、`edges`，可选 `groups`、`highlight`、`unit`、`n`（图号）、`caption`、`guides`（网格点，默认开）、`variant`。
- `nodes`：`{id, x, y, w, h, label, sub?, n?, kind?}`，坐标和尺寸都以格为单位。kind 的含义：
  - `default`：普通组件
  - `active`：本文焦点
  - `hit`：结果或命中
  - `ref`：被引用的对象
  - `store`：存储（顶部多一条线）
  - `external`：系统外的调用方（虚线框）
  - `muted`：次要组件
- `edges`：`{from, to, label?, kind?, axis?, mid?, fromSide?, toSide?, fromAt?, toAt?, both?}`。kind 取 `default`、`ref`（读 / watch）、`active`（关注的路径）或 `dashed`（异步 / 可选）。默认会自动选出入边：
  - `mid` 指定折点所在的格线
  - `axis` 强制先横（`h`）或先竖（`v`）
  - `fromAt` / `toAt`（0–1）指定在边上的位置，用来错开同一条边上的多根线
  - `both` 画双向箭头
- `groups`：`{x, y, w, h, label}`，表示边界（Control Plane、Worker Node、AZ-1）。
- `highlight`：`{nodes: [id], edges: [下标]}`。列出的节点和连线点亮为 active，其余退成灰色，`external` 节点保持原样。和 `Stepper` 组合，在 `renderStage(i)` 里每一步传不同的 highlight，就能把一次请求一步步走一遍。
- 规则：节点标签 ≤ 14 个字符；一张图最多 6 个编号；箭头标签用等宽小写动词或协议名（`watch`、`gRPC`、`AppendEntries`）。节点编号 `n` 要和正文里的 Marker 对应。

**`variant="notebook"`（默认）**：用在文章页和单步演示。每格 16px，和 Figure 的点阵一致。节点是 8px 圆角的小卡片，焦点节点落 4px 硬边影子。编号是贴在节点左上角的 Marker 圆点。连线拐角是 8px 圆弧，标签放在胶囊里。分组是虚线圆角框，标签胶囊骑在边框上。放进 `Stepper` 时外框自动去掉，建议同时传 `guides={false}`，用演示器舞台自带的点阵。

**`variant="swiss"`**：用在系统剖析页。每格 24px，方角节点，等宽两位编号。分组顶部是 3px 结构线，整张图顶部也是一条结构线。
