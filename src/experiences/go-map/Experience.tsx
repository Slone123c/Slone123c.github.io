import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { chapters, palettes } from './content';
import { Scene } from './Scenes';
import { sitePath } from '../../lib/path';
import './experience.css';

export default function Experience() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [found, setFound] = useState(true);
  const [count, setCount] = useState(2);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [rate, setRate] = useState(1);
  const [remaining, setRemaining] = useState<number | null>(null);
  const playback = useRef<gsap.core.Timeline | null>(null);
  const rateRef = useRef(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRate = Number(params.get('speed') || 1);
    if ([0.5, 1, 2].includes(requestedRate)) setRate(requestedRate);
    if (params.get('autoplay') === '1' && matchMedia('(prefers-reduced-motion: no-preference)').matches) setPlaying(true);

    const interrupt = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('.map-player') && !['wheel', 'touchmove'].includes(event.type)) return;
      if (event instanceof KeyboardEvent && !['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
      playback.current?.kill();
      playback.current = null;
      setPlaying(false);
      setFinished(false);
    };
    const pauseWhenHidden = () => { if (document.hidden) setPlaying(false); };
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    const pauseForMotion = () => { if (!motion.matches) { playback.current?.kill(); playback.current = null; setPlaying(false); } };
    for (const name of ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown']) window.addEventListener(name, interrupt, { passive: true });
    document.addEventListener('visibilitychange', pauseWhenHidden);
    motion.addEventListener('change', pauseForMotion);
    return () => {
      playback.current?.kill();
      for (const name of ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown']) window.removeEventListener(name, interrupt);
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      motion.removeEventListener('change', pauseForMotion);
    };
  }, []);

  useEffect(() => {
    rateRef.current = rate;
    playback.current?.timeScale(rate);
  }, [rate]);

  useEffect(() => {
    if (!playing) { playback.current?.pause(); return; }
    gsap.registerPlugin(ScrollToPlugin);
    if (!playback.current || playback.current.progress() === 1) {
      const sections = Array.from(root.current!.querySelectorAll<HTMLElement>('.map-chapter'));
      const last = sections[sections.length - 1]!;
      if (window.scrollY >= last.offsetTop - 2) window.scrollTo({ top: 0, behavior: 'instant' });
      const next = sections.findIndex(section => section.offsetTop > window.scrollY + 2);
      let previousSecond = -1;
      const timeline = gsap.timeline({ paused: true,
        onUpdate: () => {
          const seconds = Math.ceil((timeline.duration() - timeline.time()) / rateRef.current);
          if (seconds !== previousSecond) { previousSecond = seconds; setRemaining(seconds); }
        },
        onComplete: () => { setPlaying(false); setFinished(true); setRemaining(0); },
      });
      timeline.to({}, { duration: 6 });
      for (let i = Math.max(next, 1); i < sections.length; i++) {
        timeline.to(window, { scrollTo: { y: sections[i], autoKill: false }, duration: 2, ease: 'power2.inOut' })
          .to({}, { duration: 6 });
      }
      playback.current = timeline;
      setFinished(false);
    }
    playback.current.timeScale(rateRef.current).play();
  }, [playing]);

  const replay = () => {
    playback.current?.kill();
    playback.current = null;
    window.scrollTo({ top: 0, behavior: 'instant' });
    setFinished(false);
    if (playing) setPlaying(false);
    requestAnimationFrame(() => setPlaying(true));
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = root.current!;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      element.dataset.enhanced = 'true';
      const scenes = gsap.utils.toArray<SVGGElement>('.map-scene', element);
      gsap.set(scenes, { svgOrigin: '360 300', smoothOrigin: false, x: 0, y: 0, scale: 1 });
      const sections = gsap.utils.toArray<HTMLElement>('.map-chapter', element);
      const progress = element.querySelector('.map-progress-fill');
      ScrollTrigger.create({
        trigger: element.querySelector('.map-chapters'), start: 'top top',
        end: () => `+=${sections[sections.length - 1]!.offsetTop - sections[0]!.offsetTop}`,
        scrub: true, invalidateOnRefresh: true,
        onUpdate: self => {
          const index = sections.reduce((current, section, i) => self.scroll() >= section.offsetTop - window.innerHeight * 0.215 ? i : current, 0);
          if (activeRef.current !== index) { activeRef.current = index; setActive(index); }
          gsap.set(progress, { scaleX: self.progress });
        },
      });
      scenes.forEach((scene, index) => {
        if (index === 0) return;
        const at = 0;
        const palette = palettes[index]!;
        const previous = palettes[index - 1]!;
        const timeline = gsap.timeline({ scrollTrigger: {
          trigger: sections[index], start: 'top 43%', end: 'top top', scrub: true, invalidateOnRefresh: true,
        } });
        timeline.to(scenes[index - 1]!, { opacity: 0, scale: 1.16, y: -44, duration: 0.34, ease: 'none' }, at)
          .fromTo(scene, { opacity: 0, scale: index === 4 ? 0.65 : 0.84, x: 0, y: 60 }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.43, ease: 'none' }, at)
          .fromTo(element, { backgroundColor: previous[0], '--canvas': previous[0], '--ink': previous[1], '--muted': previous[2], '--accent': previous[3], '--map-on-accent': [1, 2, 8].includes(index - 1) ? '#f7f4ec' : '#102c30' }, { backgroundColor: palette[0], '--canvas': palette[0], '--ink': palette[1], '--muted': palette[2], '--accent': palette[3], '--map-on-accent': [1, 2, 8].includes(index) ? '#f7f4ec' : '#102c30', duration: 0.43, ease: 'none', immediateRender: false }, at);
        if (index === 1 || index === 4) timeline.fromTo(scene.querySelectorAll('[data-slot]'), { y: 80, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.018, duration: 0.2, ease: 'none' }, at + 0.12);
        if (index === 5) timeline.fromTo(scene.querySelectorAll('[data-control-cell]'), { y: -50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.018, duration: 0.2, ease: 'none' }, at + 0.1);
        if (index === 7) timeline.fromTo(scene.querySelector('[data-result]'), { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: 'none' }, at + 0.18);
      });
      ScrollTrigger.refresh();
      const onLoad = () => ScrollTrigger.refresh();
      window.addEventListener('load', onLoad);
      return () => { window.removeEventListener('load', onLoad); delete element.dataset.enhanced; };
    });
    return () => media.revert();
  }, []);

  return <div className="map-experience" ref={root}>
    <a className="map-skip" href="#map-step-9">跳过动画，阅读总结</a>
    <header className="map-header"><a href={sitePath()}>Slone <span>/ CODE UNDER THE SURFACE</span></a><div><span className="map-counter" aria-label="当前章节">{String(active + 1).padStart(2, '0')} / 10</span><a href={sitePath('blog/go-map-storage/')}>完整文字版 ↗</a></div></header>
    <div className="map-world" aria-hidden="true"><div className="map-grain" /><div className="map-diagram"><svg viewBox="0 0 720 600" role="img"><title>Go map 从存储到查找的逐层示意</title>{chapters.map((_, index) => <g className="map-scene" key={index} style={{ opacity: index === 0 ? 1 : 0 }}><Scene index={index} found={found} count={count} /></g>)}</svg><p className="map-diagram-note">GO 1.24 / 64-BIT · 示意布局与哈希</p></div></div>
    <nav className="map-rail" aria-label="文章章节">{chapters.map((chapter, index) => <a key={chapter.nav} href={`#map-step-${index}`} aria-current={active === index ? 'step' : undefined} aria-label={`${index + 1}. ${chapter.nav}`}><span>{chapter.nav}</span><i /></a>)}</nav>
    <main className="map-chapters" id="map-main">
      {chapters.map((chapter, index) => <section className={`map-chapter map-chapter-${index}`} id={`map-step-${index}`} key={chapter.nav} aria-labelledby={`map-title-${index}`}>
        <div className="map-copy"><p className="map-eyebrow">{chapter.eyebrow}</p>{index === 0 ? <h1 id={`map-title-${index}`}>{chapter.title}</h1> : <h2 id={`map-title-${index}`}>{chapter.title}</h2>}<p className="map-body">{chapter.body}</p><pre className="map-code"><code>{chapter.code}</code></pre>
          {index === 7 && <div className="map-query-controls" role="group" aria-label="查找结果示意"><button type="button" aria-pressed={found} onClick={() => setFound(true)}>查找 alice</button><button type="button" aria-pressed={!found} onClick={() => setFound(false)}>查找 nobody</button><p role="status">{found ? 'alice：group 6 / slot 2 命中，返回 100, true。' : 'nobody：同路径、同 H2 的假设示例；排除 alice 后遇到 empty，返回 0, false。'}</p></div>}
          {index === 8 && <div className="map-index-control"><label htmlFor="map-result-count">索引返回对象数 N <output>{count}</output></label><input id="map-result-count" type="range" min="1" max="6" value={count} onChange={e => setCount(Number(e.target.value))} /><p role="status">{2 + count} 次数据查找 + 1 次注册检查 = {3 + count} 次 map 查找</p></div>}
          <p className="map-note">{chapter.note}</p>
          {index === 0 && <a className="map-next" href="#map-step-1">滚动，拆开这个黑盒 ↓</a>}
          {index === 9 && <div className="map-end-links"><a href={sitePath('blog/go-map-storage/')}>阅读完整原文 ↗</a><a href="https://go.dev/blog/swisstable">Go 官方：Swiss Tables ↗</a><a href="#map-step-0">回到起点 ↑</a></div>}
        </div>
        <div className="map-still"><svg viewBox="0 0 720 600" role="img" aria-label={`${chapter.nav}示意`}><Scene index={index} found={found} count={count} /></svg></div>
      </section>)}
    </main>
    <footer className="map-footer"><span>从 K8s 集合与索引看 Go map · Slone</span><a href={sitePath('blog/')}>更多文章 ↗</a></footer>
    <section className="map-player" aria-label="整页自动播放控制">
      <button className="map-player-primary" type="button" aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? '暂停播放' : finished ? '再次播放' : '自动播放'}</button>
      <button type="button" onClick={replay}>从头播放</button>
      <label>速度<select aria-label="播放速度" value={rate} onChange={event => setRate(Number(event.target.value))}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label>
      <div className="map-player-info"><span role="status">{playing ? '正在自动推进整页' : finished ? '已播放完毕' : '手动滚动可随时接管'}</span><span>{remaining === null ? '十幕 · 约 78 秒' : `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} 剩余`}</span></div>
    </section>
    <div className="map-progress" aria-hidden="true"><div className="map-progress-fill" /></div>
  </div>;
}
