# 一篮 AI 升级验收（2026-09-26）

代码已在 feature/iphone17-v0 本地实现；真实 DeepSeek 与公网部署尚未验收。库存状态机保留，未重做产品设计。

## 1. 修改文件

本轮修改：`.env.example`、私密 `.env`、`server.mjs`、`server/ai-gateway.js`、`src/ai.js`、`src/data.js`、`src/domain.js`、`src/app.js`、`src/assets.js`、`src/library-pass.css`、`tests/ai-gateway.test.mjs`、`tests/domain.test.mjs`、`tests/local-calculation.test.mjs`、`README.md`、`AGENTS.md`。

新增：`src/ai-context.js`、`src/planning.js`、`src/recipe-knowledge.js`、`src/scheduler.js`、`tests/ai-upgrade.test.mjs`、`render.yaml`、`scripts/verify-demo.mjs`、本报告和响应样例。

仓库原先未提交的素材库、页面视觉和文档改动已保留。当前没有提交或推送本轮更新，也未重置浏览器数据。

## 2–3. 实际调用与模型

实际检查 GET /api/ai/status：configured=false。POST /api/ai 的三项任务均成功返回基础方案，meta.source=fallback、fallbackReason=AI_NOT_CONFIGURED。

配置的 model ID 为 deepseek-flash；没有有效密钥，因此没有真实调用，也没有模型实际返回的 model ID。测试中的 source=real 使用模拟网络响应，只能证明接口契约，不能证明真实模型联调成功。

使用官方 JSON 模式，响应经程序校验：[DeepSeek 文档](https://api-docs.deepseek.com/guides/json_mode/)。

## 4–5. 本机 HTTP 返回示例

以下来自实际本机 HTTP 响应，已截短列表。它们是 fallback，不能充当真实 DeepSeek 样例。完整响应见 ai-response-examples.json。

```json
{
  "planBasket": {
    "referenceRecipeIds": [
      "tomato_egg_soup",
      "tomato_scrambled_egg",
      "tomato_tofu",
      "cucumber_egg"
    ],
    "planningStrategy": [
      "preserve_anchor",
      "reuse_stock",
      "reuse_ingredients",
      "reduce_one_off_purchase"
    ],
    "planningInsights": [
      {
        "type": "reuse_existing",
        "ingredientId": "tomato",
        "recipeIds": [
          "tomato_scrambled_egg",
          "tomato_tofu",
          "tomato_egg_soup"
        ],
        "messageCode": "reuse_existing"
      },
      {
        "type": "shared_ingredient",
        "ingredientId": "tomato",
        "recipeIds": [
          "tomato_scrambled_egg",
          "tomato_tofu",
          "tomato_egg_soup"
        ],
        "messageCode": "shared_ingredient"
      }
    ],
    "meta": {
      "source": "fallback",
      "model": "deepseek-flash",
      "fallbackReason": "AI_NOT_CONFIGURED",
      "message": "AI 服务暂时繁忙，已使用基础规划。"
    }
  },
  "recommendRecipes": {
    "recipeCards": [
      {
        "recipeId": "tomato_egg_soup",
        "reasonCodes": [
          "stock_ready",
          "uses_existing_stock",
          "fits_time",
          "matches_cycle_style",
          "low_prep",
          "low_cleanup",
          "complements_table",
          "avoids_recent_repeat"
        ],
        "score": 94,
        "canCookNow": true,
        "missingIngredients": [],
        "shortReason": "现有食材可做 · 用得上现有食材"
      }
    ],
    "meta": {
      "source": "fallback",
      "model": "deepseek-flash",
      "fallbackReason": "AI_NOT_CONFIGURED",
      "message": "AI 服务暂时繁忙，已使用基础规划。"
    }
  }
}
```

## 6. 确定性校验

- server/ai-gateway.js：输入白名单、菜谱/硬限制、完整排序、锚点、餐次数量、输出字段和原因事实。
- src/ai-context.js：长期 / 周期 / 当顿 / 历史分层。
- src/planning.js：结构化 insight 和 reason 的事实验证、基础方案排序。
- src/ai.js：AIService 二次校验，用 requirements/totalStock 重算采购数量与缺口。
- src/scheduler.js：策略 ID、依赖、单人操作、锅具数量、灶位、连续烹饪块、原始步骤内容、并行窗口和节省时间。
- src/domain.js：原 commitPurchase/completeMeal/eligible/shortages/requirements 和幂等语义继续保留。

## 7. Mock / fallback

缺密钥、模型 timeout、鉴权/限流、无效输出、前端网络异常均可使用基础规划。UI 标明回退。测试走通超时 → 基础采购方案 → 确认入库 → 推荐 → 教程 → 完成 → 食记，重复完成不重复扣库存。照片识别仍为 Mock，并需用户确认。

## 8. 菜谱库

30 道常见菜，包含中式家常、日式、韩式、简单西式与面饭汤。均有 metadata 和带依赖的 atomicSteps。菜谱是人工整理的演示知识库，不由实时模型自由生成。未覆盖的菜品图仍用统一占位，不套用不对应的菜图。

## 9. 排程与省时

支持 sequentialMinutes / optimizedMinutes / savedMinutes / parallelWindows。番茄炒蛋 + 味噌豆腐汤，默认两灶：逐道约 33 分钟，协同约 29 分钟，少约 4 分钟，2 个并行窗口。数字来自程序，不来自模型。

只合并相同食材的清洗；切配保留各菜指令，生肉处理包含清洁步骤。少洗锅优先复用可用锅具；少切配影响选菜；无法满足 20 分钟或一锅出时给出取舍。时间按模板和人数估计，不代表真实厨房测量。普通刀/砧板视为基础操作台用具；锅具与灶位按实际配置限制。

## 10. 验证

36 项自动测试全部通过，含用户 CASE 1–10；额外覆盖 30 道单菜、435 种双菜组合、策略候选校验、伪造并行窗口拒绝，以及厨房变化后旧圆桌不使推荐报错。

npm run check、git diff --check 通过。实际 HTTP 验证 /api/ai/status、三项 POST、healthz、预览入口和前端模块；.env/服务端源码不能从 HTTP 读取。.env 被 Git 忽略。

浏览器控制因 admin-enforced policy check unavailable 拒绝访问，本轮未完成视觉验收、截图和浏览器端完整交互回归。未绕过该限制。生产网络、TLS、真实 provider latency、冷启动仍需部署后验收。

## 11. 本地 Demo

http://localhost:4173/preview.html#/basket

当前服务已更新，刷新整个预览以载入新 JS。重新启动：在 A-basket 目录运行 npm start。

## 12. 你本人必须做的最少操作

本机：打开 A-basket/.env → 在第一行 OPENAI_API_KEY= 后粘贴 DeepSeek Key → 保存。不要发到聊天。服务会重新读取配置，不需要改源码。

公网：尚未连接托管账户。已准备 Render Blueprint（render.yaml），保留原 Node 服务和 /api/ai。代码同步到 GitHub 后，在 Render 连接此仓库/分支并在私密环境变量中填写 OPENAI_API_KEY；其他参数已配置。平台生成 URL 后需复跑 scripts/verify-demo.mjs，确认真实响应再交给评委。评委不需要账号或密钥。

静态托管不支持 server-side AI，不能用静态发布代替验收。当前不提供未经部署的虚构公网地址。[Render 部署说明](https://render.com/docs/deploy-node-express-app)、[Blueprint 配置](https://render.com/docs/blueprint-spec)。

## 阶段状态

Phase 1–2：代码/契约和 fallback 已验证；真实模型联调等待密钥。
Phase 3–8：上下文、知识库、规划、推荐和策略排程通过自动测试。
Phase 9：教程组件已接入独立素材；浏览器视觉验收受阻。
Phase 10：Node 部署配置与本机 HTTP 已验证；公网部署待账户连接。
