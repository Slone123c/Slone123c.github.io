// 公开版简历：句子尽量保留原文，只去掉真名、联系方式、公司、学校、内部项目名和公司规模数字。
type Point = [label: string, text: string, marker?: number];
export const intro = '负责裸金属 IaaS 平台后端开发，覆盖服务器自动发现、全生命周期管理、异步任务调度和多租户容器网络。';
export const strengths: [string, string][] = [
  ['高并发设计与验证', '掌握限流隔离、Redis 原子扣减、TCC/本地消息表、并发扣款与多级缓存方案，习惯先测基线、再用压测和 pprof 定位瓶颈。'],
  ['数据链路高吞吐', '熟悉 binlog 增量同步，掌握主键分片并行回放、批量写入、背压、幂等和位点管理。'],
  ['Go 与异步任务', 'Go 开发经验，独立开发通用异步任务组件，已集成到多个内部项目，新功能代码量从 800 行降至 320 行。'],
  ['数据库与缓存', '熟悉 MySQL 索引、事务和锁，结合 Redis 将百台服务器参数查询从 800ms 优化至 150ms。'],
  ['云原生与裸金属', '熟悉 Docker、Kubernetes，基于 Multus CNI 实现多租户网络隔离；熟悉 DHCP、PXE、IPMI、Redfish 等基础设施协议。'],
  ['可观测性', '通过 Prometheus、Grafana 和日志体系，将异步任务问题平均定位时间从 52 分钟缩短至 18 分钟。'],
];
// before / after 用于按比例画条，单位各行独立，不跨行比较。
export const deltas = [
  { k: '上架流程', from: '4 小时', to: '15 分钟', before: 240, after: 15 },
  { k: '镜像制作', from: '4 小时', to: '20 分钟', before: 240, after: 20 },
  { k: '百台服务器查询', from: '5 秒', to: '150ms', before: 5000, after: 150 },
  { k: '新机型适配', from: '2 周', to: '2 天', before: 14, after: 2 },
  { k: '新功能开发', from: '4 天', to: '1.5 天', before: 4, after: 1.5 },
  { k: '问题平均定位', from: '52 分钟', to: '18 分钟', before: 52, after: 18 },
  { k: '消息处理延迟', from: '500ms', to: '150ms', before: 500, after: 150 },
  { k: '服务器纳管效率', from: '30%', to: '95%', before: 30, after: 95 },
];
export const jobs: { org: string; role: string; points: string[] }[] = [
  { org: '某云算力公司', role: 'Golang 后端开发工程师', points: [
    intro,
    '服务器纳管效率从 30% 提升至 95%，上架流程从 4 小时缩短至 15 分钟。',
    '异步任务组件集成到多个内部项目，新功能开发时间从 4 天缩短至 1.5 天。',
  ] },
  { org: '某网络设备公司', role: '后端开发实习生', points: [
    '参与超融合云场景的 PostgreSQL 备份/还原链路开发，实现超时控制、退避重试与幂等校验；配合 fio/iostat 定位并优化容器 IO 性能。',
    '参与 CI/CD 流程配置，包括 Docker 分层构建、多架构镜像和基础安全扫描。',
    '使用 Chaosblade 进行故障注入，验证回滚与容错机制。',
  ] },
];
export const projects: { id: string; kicker: string; title: string; role: string; stack: string; summary: string; figure: string; points: Point[]; spec?: { k: string; v: string; note: string; tone?: string }[]; invariant?: [string, string] }[] = [
  { id: 'metal', kicker: 'Bare Metal', title: '裸金属服务器全生命周期管理平台', role: 'Golang 核心开发', figure: 'metal',
    stack: 'Go · Kratos · Asynq · Ent · gRPC · MySQL · Redis · MinIO · ETCD · IPMI · Redfish · iPXE · Clonezilla',
    summary: '基于 Go 微服务的裸金属管理平台，实现硬件采集、PXE 引导到系统自动安装的全流程。',
    spec: [
      { k: '硬件字段', v: '116', note: 'BMC 带外 + initramfs' },
      { k: '服务器状态', v: '8', note: '纳管、巡检到可用' },
      { k: '机型适配', v: '2 天', tone: 'green', note: '原 2 周' },
      { k: '状态更新延迟', v: '50ms', tone: 'green', note: 'gRPC Stream 替代轮询' },
    ],
    points: [
      ['硬件抽象', '通过 Dell、浪潮和通用 GoFish 三层适配统一管理 10+ 机型，新机型适配周期从 2 周缩短至 2 天；通过 BMC 带外与 initramfs 双渠道采集 116 个硬件字段。'],
      ['状态机', '设计 8 种服务器状态，覆盖纳管、巡检到可用的完整流转。'],
      ['查询优化', 'WHERE IN 批量查询 + Redis Pipeline，百台服务器查询从 5 秒降至 150ms；lastId 游标分页避免深分页；按机房、状态、型号建立联合索引。'],
      ['并发一致性', 'IP 分配使用悲观锁，任务状态更新使用乐观锁减少竞争。'],
      ['批量任务', '基于 Asynq 支撑百台服务器并行初始化；脚本模块支持主机组下发、并发上限、超时、重试和可控中止，通过 gRPC Stream/WebSocket 实时回传日志。'],
      ['实时推送', 'gRPC Stream 替代轮询，状态更新延迟降至 50ms。'],
      ['镜像管理', '基于 MinIO 与 Clonezilla 实现镜像制作和分发，单次制作从 4 小时缩短至 20 分钟。'],
    ] },
  { id: 'task', kicker: 'Async', title: '异步任务编排组件', role: 'Go 后端开发', figure: 'task',
    stack: 'Go · Kratos · Asynq · Ent · MySQL · Redis · Docker · Kubernetes',
    summary: '基于 Asynq 开发的异步任务组件，支持工作流定义与执行监控，可嵌入 Kratos 项目，驱动 8 类工作流（镜像制作、系统安装、脚本执行、自动巡检等）。',
    spec: [
      { k: '僵尸任务扫描', v: '10-50ms', tone: 'green', note: '原 2-5s' },
      { k: '自愈周期', v: '2 min', note: 'DB 与 Redis 双向校验' },
      { k: '168 小时内存增长', v: '≤ 8%', tone: 'green', note: '连续运行' },
    ],
    points: [
      ['状态与一致性', '设计任务状态机（Pending → Retrying → Succeeded / Failed），通过 Ent 事务保证状态一致性，支持重试、失败回滚和超时取消。'],
      ['自愈', '每 2 分钟通过 DB 与 Redis 双向校验清理僵尸任务；优化 status 索引后，扫描耗时从 2-5s 降至 10-50ms。'],
      ['并发控制', 'Worker 并发度可动态配置，Context 取消机制主动释放超时任务资源，防止协程泄漏。'],
      ['协作与可观测性', '通过 Redis Pub/Sub 同步多节点任务结果；接入 Prometheus 记录时长和成功率，识别并优化 7 个平均耗时超过 25 秒的长任务。'],
    ] },
  { id: 'dhcp', kicker: 'Network', title: '插件化 DHCP 服务', role: '后端开发', figure: 'dhcp',
    stack: 'Go · CoreDHCP · Asynq · Redis · SQLite · Docker · Kubernetes · Multus CNI',
    summary: '基于 CoreDHCP 开发的插件化 DHCP 服务，是平台服务器自动发现的入口，支持多子网、PXE 启动和多租户隔离。',
    spec: [
      { k: 'perfdhcp 单节点', v: '300+', tone: 'green', note: 'QPS，丢包率 <0.1%' },
      { k: '200 并发平均延迟', v: '20ms', note: '峰值约 660ms' },
      { k: '长稳测试', v: '60 min', note: '@100 QPS 无性能衰减' },
    ],
    points: [
      ['协议与插件', '开发动态多子网和 iPXE 插件，通过 Option 93 与 Option 77 双层判断识别 UEFI/BIOS 和 iPXE 环境。', 1],
      ['租约并发', '活跃租约放内存，历史租约写 SQLite（WAL 模式）；子网级互斥保护 IP 分配，10 秒 Ticker 清理过期记录。', 2],
      ['事件分发', '基于 Asynq 解耦租约变更与外部通知，消息处理延迟从 500ms 降至 150ms。', 3],
      ['容器网络', '结合 Multus CNI 开发动态 VLAN/macvlan 管理，实现单 Pod 多 VLAN 接口。'],
    ] },
  { id: 'order', kicker: 'Transaction', title: '云服务器交易系统', role: '后端设计与开发', figure: 'order',
    stack: 'Go · Kratos · Redis Cluster · MySQL · NATS JetStream · Prometheus · k6',
    summary: '实现云服务器从下单、预占到支付的交易链路，按大促峰值 1 万 QPS 设计，在压测环境验证。',
    points: [
      ['资源一致性', 'ClientToken + 唯一索引保证幂等；Redis Lua 分段预占配额和库存，失败回滚；数据库条件更新兜底防超卖。'],
      ['最终一致', '订单、预占记录和 outbox 同事务写入，补发任务保证消息投递；超时关单使用条件更新，避免与支付回调并发冲突。'],
      ['流量治理', '令牌桶与用户级限流，阈值取自压测拐点；本地售罄标记拦截无效请求；大促通道独立部署，隔离日常下单。'],
      ['读热点', '本地缓存 + Redis 两级缓存，singleflight 防击穿；Redis 故障时降级本地缓存并对数据库限流。'],
      ['并发扣款', '对比悲观锁、乐观锁和单账户串行队列，热点账户按 account_id 哈希串行处理。'],
    ] },
  { id: 'sync', kicker: 'Data Sync', title: 'MySQL 多级同步服务重构', role: '后端设计与开发', figure: 'sync',
    stack: 'Go · go-mysql · NATS JetStream · MySQL · Prometheus',
    summary: '针对原服务逐行串行回放、队列出队非原子、失败消息阻塞通道等问题重新设计，实现中心、大区、城市多级 MySQL 增量同步。',
    invariant: ['同一行有序、不同行并行', '按「表 + 主键」哈希分片到多个 worker；DDL 作为屏障，二级唯一索引冲突时排空后重试。'],
    points: [
      ['批量写入', '按条数和时间双阈值攒批，批内同主键合并后批量 upsert。'],
      ['可靠性', '位点与数据同事务提交，配合幂等写入；发布端有界在途窗口实现背压；重试超限的消息进入死信，不阻塞通道。'],
    ] },
];
export const courses = '算法分析与设计、数据结构、数据库系统、计算机网络、操作系统、离散数学、统计学';
