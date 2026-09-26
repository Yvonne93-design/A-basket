# 一篮 Coding Agent — READ FIRST

## Source of Truth
- **视觉 / 排版 / 页面组件关系**：`design/source/all.pdf`（22页，**每页就是一个完整 Screen**）。
- **业务 / 交互 / AI / 数据**：本包其余规格文件。
- `design/screens/` 只是 22 页的完整渲染，方便逐页查看。

## 必须读取
1. `01_PRODUCT_SPEC.md`
2. `02_SCREEN_MAP.csv`
3. `03_AI_DATA_SPEC.md`
4. `04_VISUAL_IMPLEMENTATION.md`
5. `05_AI_CONTRACTS.json`
6. `06_STATE_MODEL.json`
7. `07_ACCEPTANCE.md`
8. `08_BUILD_ORDER.md`
9. `design/source/all.pdf`

## 绝对实现规则
1. L1 固定：**菜篮 / 做饭 / 食记 / 我的**；L1 无返回箭头。
2. **不要重新设计**：学习设计稿并用真实前端组件重建。
3. 禁止整屏背景图、截图切片拼 UI、截图 + 透明 Hotspot。
4. 所有 Button/Card/Tab/List/Sheet/圆桌/文字/数字必须是真实组件与数据。
5. 可自行生成独立的食材、厨具、菜品、装饰和教程插图 Asset；**不得从 Screen 裁取**。无图像生成能力时使用统一 Placeholder，并输出 `MISSING_ASSETS.md`。
6. 不新增泛化 AI Chat。
7. AI 建议量 ≠ 已购买 ≠ 真实库存；只有用户确认实际购买才写库存。
8. 浏览菜卡 / 点心上桌都不扣库存；只有完成做饭并确认实际用量后扣减。
9. 多菜教程是**整餐协同流程**，不是多份菜谱首尾拼接。
10. 图片识别只产出候选，用户确认后才写真实数据。

## 当前时间约束
项目只剩 **2–3 天**。不要等待用户逐项确认。先快速理解资料，然后直接开发可运行 V0。

**第一优先级核心链路：**
`再搭一篮 → AI食材方案 → 采购确认 → 真实库存 → Food Card → 点心上圆桌 → 多菜协同教程 → 完成扣库存 → 食记`

非阻塞的不确定项采用最保守方案继续，并记录到 `ASSUMPTIONS.md`；只有真正阻塞核心链路时才停下询问。
