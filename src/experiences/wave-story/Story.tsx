import { useEffect, useRef, useState } from 'react';
import styles from './Story.module.css';

const chapters = [
  { title: '先看一个点', subtitle: '波形，是一个点留下的轨迹。', text: '想象一个点沿圆周匀速运动。只看它在竖直方向的位置，你就得到一次平滑的上下往复。把这段运动沿时间展开，就是正弦波。', formula: 'y = sin(θ)', hint: '左边的点沿圆周运动，右边记录它的高度。' },
  { title: '把高度交给振幅', subtitle: '振幅 A，决定起伏有多大。', text: '波峰离中线越远，振幅就越大。调整振幅时，曲线被竖直拉伸，完成一次起伏的时间保持不变。试着把振幅从 20 调到 90。', formula: 'y = A · sin(θ)', hint: '拖动振幅滑块，比较波峰与中线的距离。' },
  { title: '把疏密交给频率', subtitle: '频率 f，决定一段时间里有多少次起伏。', text: '保持同一条时间轴，频率越高，完整的波就越多。振幅与频率彼此独立：你可以让波又高又密，也可以让它低而舒缓。', formula: 'y = A · sin(2πft)', hint: '增加频率，观察相同宽度内的周期数量。' },
  { title: '让时间开始流动', subtitle: '相位 φ，把静止的公式变成运动。', text: '让相位随时间增长，每个位置的高度就会连续变化。整条曲线看起来向左移动，但你看到的每个点，只是在各自的位置上下往复。暂停后拖动相位，可以逐帧检查这个过程。', formula: 'y = A · sin(2πft + φ)', hint: '暂停后拖动相位，或打开采样点观察局部运动。' },
];

export default function Story() {
  const [chapter, setChapter] = useState(0);
  const [amplitude, setAmplitude] = useState(55);
  const [frequency, setFrequency] = useState(1);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(false);
  const [samples, setSamples] = useState(false);
  const [progress, setProgress] = useState(0);
  const phaseRef = useRef(0);
  const elapsedRef = useRef(0);
  const current = chapters[chapter]!;

  const selectChapter = (next: number) => {
    setChapter(next);
    setProgress(0);
    elapsedRef.current = 0;
    setAmplitude(55);
    setFrequency(next >= 2 ? 2 : 1);
    setSamples(false);
  };

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      const delta = previous === undefined ? 0 : Math.min(now - previous, 80);
      previous = now;
      phaseRef.current = (phaseRef.current + delta * 0.0012) % (2 * Math.PI);
      setPhase(phaseRef.current);
      if (auto) {
        elapsedRef.current += delta;
        setProgress(Math.min(elapsedRef.current / 12000, 1));
        if (elapsedRef.current >= 12000) {
          elapsedRef.current = 0;
          if (chapter < chapters.length - 1) selectChapter(chapter + 1);
          else { setAuto(false); setPlaying(false); setProgress(1); }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, auto, chapter]);

  useEffect(() => {
    const pause = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);

  const waveY = (x: number) => 140 - amplitude * Math.sin((x / 580) * Math.PI * 2 * frequency + phase);
  const points = Array.from({ length: 291 }, (_, i) => `${i * 2},${waveY(i * 2)}`).join(' ');
  const pointX = 90 + amplitude * Math.cos(phase);
  const pointY = 140 - amplitude * Math.sin(phase);
  const changePhase = (value: number) => { setPlaying(false); phaseRef.current = value; setPhase(value); };

  return <div className={styles.story}>
    <nav className={styles.chapters} aria-label="讲解章节">
      {chapters.map((item, index) => <button key={item.title} type="button" aria-current={chapter === index ? 'step' : undefined} onClick={() => { setAuto(false); selectChapter(index); }}><span>0{index + 1}</span>{item.title}</button>)}
    </nav>

    <section className={styles.stage} aria-label="波形动画">
      <div className={styles.stageHeader}><span>WAVE LAB / 0{chapter + 1}</span><span role="status">{playing ? (auto ? '自动讲解中' : '动画播放中') : '已暂停'}</span></div>
      <div className={styles.formula}>{current.formula}</div>
      <svg viewBox="0 0 800 280" role="img" aria-label={`第 ${chapter + 1} 步，振幅 ${amplitude}，频率 ${frequency.toFixed(1)}，相位 ${phase.toFixed(2)}`}>
        <defs><pattern id="wave-story-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#293847" strokeWidth="1" /></pattern></defs>
        <rect width="800" height="280" fill="url(#wave-story-grid)" />
        <path d="M0 140H800" stroke="#64788b" strokeDasharray="4 6" />
        <circle cx="90" cy="140" r={amplitude} fill="none" stroke="#6b8193" />
        <path d={`M90 140L${pointX} ${pointY}`} stroke="#f4d374" strokeWidth="2" />
        <path d={`M${pointX} ${pointY}H220`} stroke="#f4d374" strokeDasharray="4 4" opacity=".6" />
        <circle cx={pointX} cy={pointY} r="6" fill="#f4d374" />
        <g transform="translate(220 0)">
          <polyline data-story-wave points={points} fill="none" stroke="#f4d374" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <circle cx="0" cy={waveY(0)} r="6" fill="#f4d374" />
          {chapter === 1 && <g stroke="#8fe0c0" fill="#8fe0c0"><path d={`M145 140V${140 - amplitude}`} strokeWidth="2" /><text x="157" y={140 - amplitude / 2} stroke="none" fontSize="15">A = {amplitude}</text></g>}
          {chapter >= 2 && <g fill="#9eb1c1" fontSize="12"><text x="0" y="258">0</text><text x="540" y="258">时间 t →</text></g>}
          {samples && Array.from({ length: 13 }, (_, i) => <g key={i}><path d={`M${i * 44} 140V${waveY(i * 44)}`} stroke="#8fe0c0" opacity=".4" /><circle cx={i * 44} cy={waveY(i * 44)} r="4" fill="#8fe0c0" /></g>)}
        </g>
      </svg>
      <p className={styles.caption}>{current.hint}</p>
      <div className={styles.transport}>
        <button type="button" className={styles.play} aria-pressed={playing} onClick={() => setPlaying(p => !p)}>{playing ? '暂停动画' : '播放动画'}</button>
        <button type="button" aria-pressed={auto} onClick={() => { if (auto) { setAuto(false); setPlaying(false); } else { selectChapter(0); phaseRef.current = 0; setPhase(0); setAuto(true); setPlaying(true); } }}>{auto ? '停止自动讲解' : '自动讲解'}</button>
        <label className={styles.sample}><input type="checkbox" checked={samples} onChange={e => setSamples(e.target.checked)} />显示采样点</label>
      </div>
      <div className={styles.progress} role="progressbar" aria-label="当前章节自动讲解进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}><span style={{ width: `${progress * 100}%` }} /></div>
    </section>

    <div className={styles.reading}>
      <section className={styles.copy} aria-label="当前讲解">
        <p className={styles.kicker}>第 {chapter + 1} / 4 步 · {current.title}</p>
        <h2>{current.subtitle}</h2><p>{current.text}</p>
        <div className={styles.paging}><button type="button" disabled={chapter === 0} onClick={() => { setAuto(false); selectChapter(chapter - 1); }}>← 上一步</button><button type="button" disabled={chapter === chapters.length - 1} onClick={() => { setAuto(false); selectChapter(chapter + 1); }}>下一步 →</button></div>
        <p className={styles.note}>自动讲解每步 12 秒。随时暂停，按自己的节奏阅读。</p>
      </section>
      <section className={styles.parameters} aria-label="实验参数">
        <label>振幅 A <output>{amplitude}</output><input aria-label="故事振幅" type="range" min="20" max="90" step="1" disabled={chapter === 0} value={amplitude} onChange={e => setAmplitude(Number(e.target.value))} /></label>
        <label>频率 f <output>{frequency.toFixed(1)}</output><input aria-label="故事频率" type="range" min="0.5" max="4" step="0.1" disabled={chapter < 2} value={frequency} onChange={e => setFrequency(Number(e.target.value))} /></label>
        <label>相位 φ <output>{(phase / Math.PI).toFixed(2)}π</output><input aria-label="故事相位" type="range" min="0" max={2 * Math.PI} step="0.01" value={phase} onChange={e => changePhase(Number(e.target.value))} /></label>
        <p>随讲解解锁参数。拖动相位会暂停动画，方便逐帧观察。</p>
      </section>
    </div>
  </div>;
}
