// 用 Trace 原版组件绘制简历图示；图中只出现简历正文写到的事实。
export function mountFigures() {
  const w = window as any;
  const T = w.Trace, R = w.React, h = R.createElement;
  const cellStepper = (label: string, names: string[], steps: { title: string; desc: string; at: number; hit?: boolean }[]) =>
    h(T.Stepper, { steps, renderStage: (i: number) => {
      const s = steps[i];
      return h(T.Cells, { label, showIndex: false, cells: names.map((v, j) => ({
        v, state: j === s.at ? (s.hit ? 'hit' : 'active') : j < s.at ? 'ref' : 'default',
      })) });
    } });
  const order = {
    cols: 40, rows: 12, guides: false,
    nodes: [
      { id: 'u', x: 0, y: 1, w: 7, h: 3, label: '下单', kind: 'external' },
      { id: 'lim', x: 11, y: 1, w: 8, h: 3, label: '限流' },
      { id: 'lua', x: 23, y: 1, w: 8, h: 3, label: 'Redis Lua', kind: 'store' },
      { id: 'db', x: 23, y: 8, w: 8, h: 3, label: 'MySQL', sub: '订单+outbox', kind: 'store' },
      { id: 'mq', x: 11, y: 8, w: 8, h: 3, label: 'JetStream' },
      { id: 'pay', x: 0, y: 8, w: 7, h: 3, label: '关单/支付' },
    ],
    edges: [
      { from: 'u', to: 'lim' }, { from: 'lim', to: 'lua', label: '预占' },
      { from: 'lua', to: 'db', label: '写入' }, { from: 'db', to: 'mq', label: '补发' }, { from: 'mq', to: 'pay' },
    ],
  };
  const orderSteps = [
    { title: '令牌桶与用户级限流', desc: '阈值取自压测拐点；本地售罄标记拦截无效请求。', lit: { nodes: ['u', 'lim'], edges: [0] } },
    { title: 'Redis Lua 分段预占', desc: 'Redis Lua 分段预占配额和库存，失败回滚。', lit: { nodes: ['lim', 'lua'], edges: [1] } },
    { title: '订单、预占记录和 outbox 同事务写入', desc: 'ClientToken + 唯一索引保证幂等；数据库条件更新兜底防超卖。', lit: { nodes: ['lua', 'db'], edges: [2] } },
    { title: '补发任务保证消息投递', desc: 'outbox 中的消息由补发任务投递。', lit: { nodes: ['db', 'mq'], edges: [3] } },
    { title: '超时关单使用条件更新', desc: '避免与支付回调并发冲突。', lit: { nodes: ['mq', 'pay'], edges: [4] } },
  ];
  const figures: Record<string, () => unknown> = {
    metal: () => cellStepper('服务器全流程', ['硬件采集', 'PXE 引导', '系统安装'], [
      { at: 0, title: '硬件采集', desc: '通过 BMC 带外与 initramfs 双渠道采集 116 个硬件字段。' },
      { at: 1, title: 'PXE 引导', desc: '开发动态多子网和 iPXE 插件，识别 UEFI/BIOS 和 iPXE 环境。' },
      { at: 2, hit: true, title: '系统自动安装', desc: '基于 Asynq 支撑百台服务器并行初始化。' },
    ]),
    task: () => cellStepper('任务状态机', ['Pending', 'Retrying', 'Succeeded / Failed'], [
      { at: 0, title: 'Pending', desc: '通过 Ent 事务保证状态一致性。' },
      { at: 1, title: 'Retrying', desc: '支持重试、失败回滚和超时取消。' },
      { at: 2, hit: true, title: 'Succeeded / Failed', desc: '接入 Prometheus 记录时长和成功率。' },
    ]),
    dhcp: () => h(T.Diagram, {
        n: 1, caption: '编号对应下方做法。', cols: 38, rows: 12,
        nodes: [
          { id: 'c', x: 0, y: 4, w: 6, h: 3, label: '服务器', kind: 'external' },
          { id: 'p', x: 10, y: 4, w: 8, h: 3, label: 'CoreDHCP', sub: '插件', n: 1, kind: 'active' },
          { id: 'm', x: 22, y: 0, w: 7, h: 3, label: '活跃租约', sub: '内存', n: 2 },
          { id: 's', x: 22, y: 4, w: 7, h: 3, label: '历史租约', sub: 'SQLite', kind: 'store' },
          { id: 'a', x: 22, y: 9, w: 7, h: 3, label: 'Asynq', n: 3 },
          { id: 'o', x: 32, y: 9, w: 6, h: 3, label: '外部通知', kind: 'external' },
        ],
        edges: [
          { from: 'c', to: 'p', label: 'PXE', kind: 'active' },
          { from: 'p', to: 'm', mid: 20, fromAt: 0.25 },
          { from: 'p', to: 's' },
          { from: 'p', to: 'a', fromSide: 'bottom', toSide: 'left' },
          { from: 'a', to: 'o' },
        ],
      }),
    order: () => h(T.Stepper, { steps: orderSteps, renderStage: (i: number) => h(T.Diagram, { ...order, highlight: orderSteps[i].lit }) }),
    sync: () => h('div', { className: 'tr-stack' },
      h(T.Figure, { n: 2, caption: '按「表 + 主键」哈希分片：同一行进同一 worker，保持有序。' },
        h(T.Cells, { label: 'binlog', showIndex: false, cells: [{ v: 'a', state: 'active' }, { v: 'b', state: 'ref' }, { v: 'a', state: 'active' }, { v: 'c' }, { v: 'b', state: 'ref' }] }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontWeight: 700 } }, '→ hash →'),
        h('div', { className: 'tr-stack' },
          h(T.Cells, { label: 'worker A', showIndex: false, cells: [{ v: 'a', state: 'active' }, { v: 'a', state: 'active' }] }),
          h(T.Cells, { label: 'worker B', showIndex: false, cells: [{ v: 'b', state: 'ref' }, { v: 'b', state: 'ref' }] }),
          h(T.Cells, { label: 'worker C', showIndex: false, cells: [{ v: 'c' }] }))),
      h(T.Compare, {
        corner: '问题', focus: 1, focusLabel: '重构后',
        options: [{ name: '原服务' }, { name: '重新设计' }],
        rows: [
          { k: '回放', values: [{ v: '逐行串行回放', verdict: 'bad' }, { v: '分片并行', verdict: 'good' }] },
          { k: '写入', values: [{ v: '逐行', verdict: 'bad' }, { v: '批量 upsert', verdict: 'good' }] },
          { k: '失败消息', values: [{ v: '阻塞通道', verdict: 'bad' }, { v: '进入死信，不阻塞通道', verdict: 'good' }] },
        ],
      })),
  };
  document.querySelectorAll<HTMLElement>('[data-figure]').forEach(el => {
    const build = figures[el.dataset.figure!];
    if (build) w.ReactDOM.createRoot(el).render(build());
  });
}
