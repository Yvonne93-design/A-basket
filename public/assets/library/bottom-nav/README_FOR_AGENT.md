# 一篮 APP｜Bottom Navigation 手绘 Icon 素材包

这套素材用于正式版 Bottom Navigation，视觉方向为：
**温暖手绘水彩 / 轻微体积感 / 低饱和生活方式 / 非写实 3D / 非系统线性 icon。**

## 给 Agent 的直接使用规则

1. 不要重新生成、重画、矢量化或改变这 4 个 icon。
2. 默认渲染尺寸：`28 × 28` logical px/pt。
3. 点击区域不得小于 `44 × 44` pt。
4. 选中态直接使用 `*_active`；未选中态使用 `*_inactive`。
5. 选中态浅绿色圆角底是 UI 容器，不在图片素材里：
   - 44 × 44 pt
   - radius 14 pt
   - fill `#EEF2E2`
6. Label：
   - 12 pt
   - Medium / 500
   - selected `#64774A`
   - inactive `#8B867B`
7. 图片必须 `contain`，禁止裁切、拉伸、加阴影、CSS filter 或额外描边。
8. Bottom Nav 必须遵循 iOS Safe Area，不要写死 Home Indicator 的距离。

## 语义映射

- `nav_basket` → 菜篮 / Basket
- `nav_cooking` → 做饭 / Cooking
- `nav_journal` → 食记 / Food Journal
- `nav_profile` → 我的 / Profile

## 文件结构

- `master/active/`：512×512 真透明彩色母版
- `master/inactive/`：512×512 真透明未选中母版
- `ios_exports/`：28 / 56 / 84 px，分别对应 @1x / @2x / @3x
- `preview/`：实际 Bottom Nav 比例效果预览
- `manifest.json`：给 Agent 做语义识别
- `design_spec.json`：尺寸、状态、颜色与实现规则
## V2 间距修正

底栏选中态的浅绿色容器与文字不要贴近：

- Icon visual size：`26 × 26 pt`
- Selected container：`44 × 44 pt`
- Selected container → Label：`8–10 pt`
- Label：`12 pt / Medium 500`
- Icon 可在容器内做约 `1 pt` 的视觉上移修正
- 四个 Label 基线必须一致
- 不允许绿色选中背景与文字发生视觉接触或重叠

新的参考预览：`preview/bottom_nav_preview_v2_spacing.png`
