import type { ReactNode } from 'react';

function Box({ x, y, w = 130, h = 64, label, active = false, small = false }: { x: number; y: number; w?: number; h?: number; label: string; active?: boolean; small?: boolean }) {
  return <g className={active ? 'map-box is-active' : 'map-box'}><rect x={x} y={y} width={w} height={h} rx="8" /><text x={x + w / 2} y={y + h / 2 + 7} textAnchor="middle" fontSize={small ? 20 : 24}>{label}</text></g>;
}
function Label({ x = 44, y, children, accent = false, size = 24 }: { x?: number; y: number; children: ReactNode; accent?: boolean; size?: number }) {
  return <text x={x} y={y} className={accent ? 'map-accent' : 'map-label'} fontSize={size}>{children}</text>;
}

function Structure({ focused = false }: { focused?: boolean }) {
  return <g data-camera>
    <Label y={70} size={20}>DIRECTORY</Label>
    {['00', '01', '10', '11'].map((label, i) => <Box key={label} x={44 + i * 161} y={98} w={145} h={58} label={label} active={focused && i === 2} />)}
    <path className="map-wire" d="M116 156V205H196V230M277 156V205H196M438 156V230M599 156V230" />
    <Box x={108} y={230} w={180} label="table A" />
    <Box x={348} y={230} w={180} label="table B" active={focused} />
    <Box x={568} y={230} w={125} label="table C" />
    <path className="map-wire" d="M438 294V330" />
    <Label x={44} y={327} size={20}>GROUPS IN TABLE B</Label>
    {Array.from({ length: 8 }, (_, i) => <Box key={i} x={44 + i * 82} y={352} w={70} h={56} label={String(i)} active={focused && i === 5} />)}
    <path className="map-wire" d="M489 408V423H700V465" />
    <Label x={44} y={450} size={20}>GROUP 5 → 8 SLOTS + CONTROL WORD</Label>
    {Array.from({ length: 8 }, (_, i) => <g key={i} data-slot><rect className="map-slot" x={44 + i * 82} y={472} width={70} height={64} rx="5" /><text className="map-label" x={79 + i * 82} y={513} textAnchor="middle" fontSize="21">k · v</text></g>)}
  </g>;
}

const ctrls = ['13', '42', '07', '61', '42', 'DEL', '25', '09'];
function Controls({ compare = false, next = false, found = true }: { compare?: boolean; next?: boolean; found?: boolean }) {
  const values = next ? ['09', '15', '42', '80', 'EMPTY', 'EMPTY', '11', '06'] : ctrls;
  return <g data-control-panel>
    <Label y={78} size={22}>{next ? 'GROUP 6' : 'GROUP 5'} / H2 = 42</Label>
    {values.map((value, i) => <g key={i} data-control-cell>
      <text className="map-muted" x={80 + i * 81} y={132} textAnchor="middle" fontSize="20">{i}</text>
      <Box x={44 + i * 81} y={151} w={70} h={70} label={value} active={value === '42'} small />
      <text className="map-muted" x={80 + i * 81} y={258} textAnchor="middle" fontSize="19">{value === '42' ? '候选' : value === 'DEL' ? '墓碑' : value === 'EMPTY' ? '空' : '跳过'}</text>
    </g>)}
    {!next && !compare && <g data-candidates><path className="map-wire" d="M160 275V316H410V275" /><Label x={180} y={374} accent size={36}>8 个槽位 → 2 个候选</Label><Label x={148} y={435}>先筛指纹，暂不读取其余 key。</Label></g>}
    {compare && <g data-candidates><Box x={70} y={317} w={270} h={76} label={'slot 1: "bob"'} /><Box x={370} y={317} w={270} h={76} label={'slot 4: "carol"'} /><Label x={90} y={445} accent size={29}>≠ "alice"</Label><Label x={394} y={445} accent size={29}>≠ "alice"</Label><Label x={110} y={518} size={23}>没有 empty → 继续探测，不停在 deleted。</Label></g>}
    {next && <g data-result><Label x={70} y={320} size={24}>5 → 6 → 0 → 3 → 7 → 4 → 2 → 1</Label><Box x={114} y={355} w={490} h={76} label={found ? 'slot 2: "alice" → 100' : 'slot 2: "alice" ≠ "nobody"'} active={found} /><Label x={160} y={500} size={48} accent>{found ? '100, true' : '0, false'}</Label></g>}
  </g>;
}

export function Scene({ index, found, count }: { index: number; found: boolean; count: number }) {
  if (index === 0) return <g><text className="map-hero-code" x="360" y="187" textAnchor="middle">map[string]struct{'{}'}</text><g data-token><Box x={183} y={240} w={355} h={100} label={'key: "alice"'} active /><Label x={230} y={396} size={30}>value: struct{'{}'}</Label></g><Label x={195} y={488} size={23}>SET / 元素存在，即属于集合。</Label></g>;
  if (index === 1 || index === 4) return <Structure focused={index === 4} />;
  if (index === 2) return <g><Label y={82} size={22}>SWISS TABLE / ONE SLOT / 64-BIT</Label><g data-memory><Box x={44} y={130} w={408} h={116} label="string header · 16B" active /><Box x={452} y={130} w={204} h={116} label="padding · 8B" /><Label x={468} y={278} size={20}>含末尾空字段的填充</Label><Label x={44} y={340} size={22}>VALUE = BOOL</Label><Box x={44} y={368} w={408} h={82} label="string header · 16B" /><Box x={452} y={368} w={204} h={82} label="bool + pad" active /></g><Label x={162} y={528} size={42} accent>24B = 24B</Label></g>;
  if (index === 3) return <g><Label y={80} size={22}>hash("alice", seed) / 64 BITS</Label><g data-hash><rect className="map-band" x="44" y="140" width="532" height="114" rx="8" /><rect className="map-filled" x="576" y="140" width="105" height="114" rx="8" /><text className="map-label" x="310" y="207" textAnchor="middle" fontSize="32">H1 · 高 57 位</text><text className="map-on-accent" x="629" y="207" textAnchor="middle" fontSize="26">H2</text><rect className="map-outline" x="44" y="119" width="100" height="157" rx="8" /><Label x={54} y={176} size={22}>10</Label><Label x={55} y={330} size={23}>最高 2 位 → directory[2]</Label><Label x={55} y={387} size={23}>H1 最低 3 位 101 → group 5</Label><Label x={55} y={444} size={23}>H2 = 0101010 → 指纹 42</Label></g><Label y={521} size={21} accent>目录前缀包含在 H1 中，并非独立的第三段。</Label></g>;
  if (index === 5 || index === 6 || index === 7) return <Controls compare={index === 6} next={index === 7} found={found} />;
  if (index === 8) return <g><Label y={60} size={22}>ByIndex("namespace", "default")</Label><Box x={74} y={100} w={570} label={'indexers["namespace"] · 注册检查'} /><path className="map-wire" d="M360 164V197" /><Box x={74} y={197} w={570} label={'indices["namespace"]["default"]'} active /><path className="map-wire" d="M360 261V294" /><Label x={94} y={324} size={23}>对象 key 集合 · {count} 个结果</Label><g data-index-items>{Array.from({ length: count }, (_, i) => <Box key={i} x={74 + (i % 3) * 195} y={352 + Math.floor(i / 3) * 80} w={180} h={61} label={`items[pod-${i + 1}]`} small active />)}</g><Label x={102} y={540} size={28} accent>2 + {count} 次数据查找 + 1 次注册检查</Label></g>;
  return <g><Label x={100} y={112} size={24}>查找的本质，是逐步排除。</Label>{['directory → table', 'table → group', 'control word → slots', 'key == key → value'].map((text, i) => <g key={text} data-summary><Box x={100 + i * 12} y={155 + i * 91} w={510} h={68} label={text} active={i === 3} /></g>)}</g>;
}
