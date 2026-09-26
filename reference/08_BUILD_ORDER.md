# 一篮 — 2–3 天 Build Order

## 今晚 / V0：先让核心链路真实跑通
优先实现：
1. App shell + 4 Tab + Router + Design Tokens
2. 再搭一篮：周期、预计餐次、上一篮剩余、本轮风格、从“想吃的”选择锚点菜
3. 食材方案：先用 Mock AI Adapter，也要走统一 AI Contract
4. 采购清单：勾选、修改实际量、顺手买了、完成采购后才写库存
5. 菜篮真实库存
6. 做饭：Food Card 左右浏览、❤️上圆桌、×删除、整餐食材汇总、换个方向/人数
7. 多菜长滚动教程：至少 1 套完整 Demo
8. 完成这餐：确认实际用量 → 扣库存 → 写食记
9. 食记：吃过的 / 想吃的；想吃的可供下一轮选择
10. 我的 / 我的厨房：先完成核心长期上下文与基础 CRUD

**不允许因图片生成、外围设置或 Pixel Perfect 阻塞核心 Flow。**

## 明天 / V1：把 AI 真正接上
优先级：
1. Basket planning
2. Recipe ranking
3. Multi-dish cooking plan
4. Receipt parsing（若只能做一个真实视觉 AI Case，优先小票）

AI 输出必须：schema validation → deterministic validation → 用户确认 → 写真实状态。

## 最后一天：Visual QA + Bug + 交付
- 对照 22 Screen 精修核心页面
- 跑 `07_ACCEPTANCE.md`
- 修库存、重复扣减、临时人数、跳过/删除等状态 Bug
- 录 3 分钟核心 Demo
- 整理提交说明

## 外围功能
22 Screen 中非核心页可以先用真实组件 + Mock Data 保持可打开；不要牺牲主链路完成度。
