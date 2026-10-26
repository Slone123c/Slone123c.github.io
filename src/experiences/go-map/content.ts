export const chapters = [
  { nav: '一个问题', eyebrow: 'KUBERNETES / SET', title: '空的 value，\n真的不占空间吗？', body: 'Kubernetes 用 map[T]struct{} 表示集合。只要 key 存在，就代表元素属于集合。但要知道它省不省内存，得先走进 map 的存储结构。', code: 'type Set[T comparable] map[T]struct{}', note: '向下滚动进入内部。向上滚动，镜头会沿原路返回。' },
  { nav: '四层结构', eyebrow: '01 / STORAGE', title: '真正存数据的，\n只有最里面一层。', body: 'directory 保存 table 的引用；table 管理若干 group；每个 group 有控制字和 8 个 slot。最后，key 和 value 才存放在 slot 里。', code: 'directory → table → group → slot', note: '单张 table 最多 1024 个槽位，扩容时只需处理局部。小 map 可以直接使用一个 group，省去前两层。' },
  { nav: '空值的代价', eyebrow: '02 / MEMORY LAYOUT', title: '空字段后面，\n仍可能留下填充。', body: 'Swiss Table 把 key 和 value 交错放在同一个槽位里。64 位平台上，string 头部占 16B；末尾的空字段需要尾部填充，再按 8B 对齐，所以这个槽位仍是 24B。bool 版本也是 24B。', code: 'struct { key string; value struct{} }', note: '原文实验：Go 1.25.5 / macOS arm64 / 100 万 string key。struct{} 与 bool 的 map 堆增长约 53MiB；这是原文测量，不是本页实时跑分。旧实现采用 key/value 分区布局，结论不同。' },
  { nav: '一次哈希', eyebrow: '03 / HASH', title: '只算一次哈希，\n后面反复取不同的位。', body: 'key 与 map 自己的 seed 一起产生哈希。H1 是高 57 位，用于 group 探测；H2 是低 7 位，作为槽位指纹。directory 使用的最高若干位，原本就在 H1 里面。', code: 'H1 = hash >> 7   H2 = hash & 0x7f', note: '以下数字沿用原文的同一组示意数据：目录前缀 10，起点 group 5，H2 = 42。不是 alice 的固定真实哈希。' },
  { nav: '缩小范围', eyebrow: '04 / DIRECTORY + TABLE', title: '从整个 map，\n缩小到 group 5。', body: '目录深度为 2 时，哈希最高两位 10 选中 directory[2]，拿到 table B。再用 H1 & 7，选中这张 table 的 group 5。接下来，我们只看这一组的 8 个槽位。', code: 'directory[2] → table B → group 5', note: '目录项不等于 table 编号：两个目录项可以指向同一张 table。目录读的是哈希最高位，group 起点读的是 H1 最低位。' },
  { nav: '筛候选', eyebrow: '05 / CONTROL WORD', title: '先看 8 个指纹，\n再碰真正的 key。', body: '一个 group 的 8 个控制字节紧挨着。批量匹配 H2 = 42 后，候选缩小到槽位 1 和 4。其余槽位中的字符串，暂时都不需要读取。', code: 'matchH2(42) → { 1, 4 }', note: '每个控制字节的高位区分状态，低 7 位存 H2。通用 SWAR 匹配可能多报候选，但完整 key 比较会排除它们。' },
  { nav: '比较 key', eyebrow: '06 / EQUALITY', title: '指纹相同，\n不代表是同一个人。', body: '槽位 1 和 4 的 H2 都是 42，但它们的 key 分别是 bob 和 carol，都不是 alice。哈希能缩小范围，最后仍必须用完整 key 做相等判断。这也是 map key 必须可比较的原因。', code: 'slot[1].key != "alice"\nslot[4].key != "alice"', note: '候选用完以后，还不能立刻说“找不到”。group 5 没有 empty；其中的 deleted 是墓碑，不能作为查询终点。' },
  { nav: '继续探测', eyebrow: '07 / PROBE + RETURN', title: '没有 empty，\n就去下一组看看。', body: 'table 按步长 +1、+2、+3… 生成探测序列。group 5 后面是 group 6。在那里，槽位 2 的指纹匹配，而且完整 key 等于 alice，于是返回 100, true。', code: '5 → 6 → 0 → 3 → 7 → 4 → 2 → 1', note: '也可以切换到同路径的未命中示意：先比较当前组全部候选，再根据 empty 返回 0, false。deleted 不能替代 empty。' },
  { nav: '回到索引', eyebrow: '08 / CLIENT-GO INDEXER', title: '索引没有魔法，\n只是把几张 map 组织起来。', body: 'ByIndex("namespace", "default") 先确认索引已注册，再取命名空间索引与对象 key 集合。遍历集合后，用每个 key 回查 items，拿到完整对象。', code: 'indices["namespace"]["default"]', note: '集合此时被遍历，不是对每个元素再做集合查询。索引能减少全量扫描，但也占内存，更新对象时还要维护它。' },
  { nav: '带走什么', eyebrow: 'LOOKUP / COMPLETE', title: '每一层，\n只负责缩小一点范围。', body: 'directory 找 table，table 按序找 group，控制字筛 slot，完整 key 确认身份。理解这条路径，就能把集合的内存问题和索引的查找成本连起来。', code: 'key → hash → table → group → slot → value', note: '技术基线：Go 1.24.0 Swiss Table、64 位平台；Kubernetes apimachinery / client-go v0.31.0。保留这些版本边界，再把结论带回真实工程。' },
];

export const palettes = [
  ['#101e2c', '#f0eee7', '#a6b7c4', '#efce7c'],
  ['#edf1e9', '#152d29', '#526d61', '#176a50'],
  ['#f2eadc', '#382f24', '#746451', '#a14922'],
  ['#142c40', '#ecf2f1', '#a2b7c5', '#efce7c'],
  ['#102c38', '#ecf2f1', '#a5bcc5', '#8de2c0'],
  ['#123a37', '#eff2e9', '#adc5b9', '#edcf79'],
  ['#312d3c', '#f1eced', '#bfb4c6', '#f1bb88'],
  ['#102e38', '#edf3ef', '#a7c1c8', '#8de2c0'],
  ['#e9eee6', '#18372e', '#567064', '#176a50'],
  ['#101e2c', '#f0eee7', '#a6b7c4', '#efce7c'],
];
