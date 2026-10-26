import { useEffect, useRef, useState } from 'react';
import styles from './App.module.css';
export default function App(){
  const [amplitude,setAmplitude]=useState(60);
  const [frequency,setFrequency]=useState(2);
  const [playing,setPlaying]=useState(false);
  const [phase,setPhase]=useState(0);
  const phaseRef=useRef(0);
  useEffect(()=>{if(!playing)return;let frame=0;let previous:number|undefined;
    const tick=(now:number)=>{if(previous!==undefined){phaseRef.current+=(now-previous)*.0015;setPhase(phaseRef.current);}previous=now;frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[playing]);
  useEffect(()=>{const pause=()=>{if(document.hidden)setPlaying(false);};document.addEventListener('visibilitychange',pause);return()=>document.removeEventListener('visibilitychange',pause);},[]);
  const points=Array.from({length:321},(_,i)=>{const x=i*2;return `${x},${120-amplitude*Math.sin(x/640*Math.PI*2*frequency+phase)}`;}).join(' ');
  return <section className={styles.app} aria-label="正弦波交互实验">
    <div className={styles.top}><span>y = A · sin(2πfx + φ)</span><span role="status">{playing?'播放中':'已暂停'}</span></div>
    <svg viewBox="0 0 640 240" role="img" aria-label={`正弦波：振幅 ${amplitude}，频率 ${frequency}`}><path d="M0 120H640M320 0V240" stroke="#c2d1c6" strokeDasharray="4 6"/><polyline data-wave="true" points={points} fill="none" stroke="#176744" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg>
    <div className={styles.controls}><label>振幅 <output>{amplitude}</output><input aria-label="振幅" type="range" min="10" max="100" step="1" value={amplitude} onChange={e=>setAmplitude(Number(e.target.value))}/></label><label>频率 <output>{frequency.toFixed(1)}</output><input aria-label="频率" type="range" min="0.5" max="5" step="0.1" value={frequency} onChange={e=>setFrequency(Number(e.target.value))}/></label></div>
    <div className={styles.actions}><button type="button" aria-pressed={playing} onClick={()=>setPlaying(p=>!p)}>{playing?'暂停':'播放'}</button><button type="button" onClick={()=>{setPlaying(false);setAmplitude(60);setFrequency(2);setPhase(0);phaseRef.current=0;}}>重置</button><span>拖动滑块，观察波形变化</span></div>
  </section>;
}
