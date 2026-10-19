# MacBook Ruler

我手里的 14 英寸 MacBook Pro，默认显示设置下的 500 CSS px 恰好约为 10.00 cm，这个巧合成了项目的起点。

MacBook Ruler 根据屏幕的物理分辨率、逻辑分辨率和对角线尺寸，计算 CSS px 与实际长度的对应关系，让 MacBook 和其他显示器（需Calibrate）都能成为一把相对准确的尺子。

使用 React、Vite 和 Tailwind CSS 构建。

## 本地运行

```bash
npm install
npm run dev
```

## 使用说明

选择与当前屏幕和显示设置匹配的预设，或手动输入参数。浏览器缩放请保持 100%，测量结果建议用实体尺核对。

## Future Feature

- 拖拽原点，在屏幕四个角之间切换
