# Stepper

单步讲解器：把一个过程拆成若干步，每一步配一张「世界此刻的样子」和一句话。算法、协议、源码执行路径都用它。

- 提供：`steps`（`{title, desc}`，title 写发生了什么，desc 写为什么）、`renderStage(i)`（返回该步的图：通常是 Cells、Figure 内的 SVG）、可选 `initial`、`onChange`。
- 键盘 ← → 可切换；顶部进度条每格可点。
- 一个 Stepper 3–9 步。超过 9 步就拆成两个阶段。
- 每一步只改变一处状态，并用 `active` / `hit` 标出那一处。
