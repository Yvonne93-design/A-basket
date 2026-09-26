# 一篮 - AI / Data Spec

## 1. AI 角色
**一篮食材统筹助手**：任务型 AI，不是聊天人格。它负责理解阶段性意愿、组合与排序、图像解析候选、变化协调、整餐教程编排。

语言：短、直接、先结论后依据。只说可验证内容。

## 2. AI vs 程序 vs 用户
### AI
- 采购方案候选与 trade-off；
- 菜品检索后的排序/解释；
- 小票/食材/菜品/厨房照片解析候选；
- 多菜整餐步骤重排。

### 确定性程序
- 数量/单位换算、库存差额、实际库存写入；
- 资源冲突（灶位/锅具/总食材需求）；
- 幂等、防重复扣减、Schema 校验；
- 状态机。

### 用户确认
- 实际买到什么/多少；
- 实际用了多少；
- 图片识别结果；
- 厨房/长期限制；
- 最终选菜。

## 3. 数据库最低模型
- `UserProfile { id, nickname, defaultDiners }`
- `DietConstraint { allergies[], absoluteAvoids[], optionalSoftGoals[] }`
- `KitchenProfile { stoveSlots, tools[] }`
- `Cookware { id, type, quantity, available }`
- `Ingredient { id, name, defaultUnit, tags[] }`
- `StockLot { id, ingredientId, qty, unit, acquiredAt, storage, status }`
- `Recipe { id, name, cuisine, subtype, flavorTags[], methodTags[], totalTime, cookwareReq[], ingredients[], steps[], servingBase }`
- `WantedDish { id, title, linkedRecipeId?, imageRef?, nextBasketCandidate }`
- `BasketCycle { id, plannedDays, expectedMeals, styles[], substyles[], anchorWantedDishIds[], habits[], carryOverEnabled }`
- `PurchaseSuggestion { ingredientId, requiredQty, existingQty, purchaseQty, unit, reasonCodes[] }`
- `PurchaseItem { ingredientId, suggestedQty, actualQty?, state }`
- `MealSession { diners, constraints, selectedRecipeIds[], reservedIngredients[] }`
- `MealRecord { recipeIds[], actualUsage[], photoRef?, eatenAt }`

## 4. 状态机（不可省略）
### 采购
`suggested → shopping → bought → stock`
- AI 只产生 `suggested`。
- 勾选购买不等于库存。
- 只有“完成采购 + 确认实际量”才生成 `StockLot`。

### 做饭
`browsing → selected(on table) → cooking → completed`
- browsing / selected / cooking 都不扣真实库存。
- selected 可用 `reservedQty` 做冲突校验。
- completed + 用户确认实际用量后一次性扣减；重复提交必须幂等。

### 图片识别
`uploaded → parsed_candidate → user_confirmed → committed`
不得跳过 `user_confirmed`。

## 5. 食材规划机制
输入：cycle + confirmed stock + long-term constraints + kitchen + anchor dishes。

流程：
1. Recipe Library 检索满足硬约束的真实菜谱。
2. Anchor dishes 优先进入内部参考组合。
3. AI 用软目标组织参考组合：共享食材、承接剩余、少一次性食材、风格匹配、做饭习惯、多样性、近期去重。
4. 程序汇总配方需求并计算：`purchaseQty = max(0, requiredQty - confirmedStockQty)`。
5. 输出可编辑 `PurchaseSuggestion[]`。

硬约束优先级：过敏/绝对忌口 > 厨房可执行 > 数量不为负。
用户明确锚点菜优先于自动多样性。

## 6. 菜品推荐机制
候选必须对应结构化 `Recipe` / validated variant，V1 不展示模型凭空起名的菜。

排序可参考：
`cookability + cycleMatch + anchorAffinity + stockUse + instantConstraintMatch + diversity - missingPenalty - recentRepeatPenalty`

卡片 shortReason 只能引用真实数据，如“现有食材可做”“符合20分钟内”；禁止泛化氛围词。

## 7. 图像解析边界
- **小票**：候选商品名/数量/单位/Ingredient映射；用户确认。
- **食材照片**：候选名称 + 可见的粗粒度数量；不得凭一张图声称精确克重。
- **菜品照片**：菜名/分类/相似 recipe 候选；不得断言完整原配方、热量。
- **厨房照片**：厨具/数量/灶位候选；用户确认后写 KitchenProfile。
- 不通过图片判断食物“安全可吃”或真实新鲜度。

## 8. 多菜教程机制
输入：圆桌 recipeIds + diners + stock + KitchenProfile + 当顿时间/少洗锅等即时要求。

AI 先把每道菜结构化为任务 DAG：准备、加热、等待、出锅，带 duration/resource/dependency；程序校验锅具/灶位冲突；AI 再重排：
- 合并洗切；
- 长耗时/等待步骤提前；
- 等待时间穿插其他任务；
- 少洗锅时尽量复用锅具且不违反食品安全；
- 易凉/易塌菜靠后；
- 输出纵向整餐 stages，不要求频繁点击。

## 9. Recipe / Ingredient Library
### Recipe 必须至少有
`id,name,cuisine,subtype,flavorTags,methodTags,totalTime,cookwareReq,ingredients(servingBase),steps,difficulty`

### Ingredient 至少有
`id,name,aliases,defaultUnit,category,storageReference?,nutritionRef?`

首版可以是小型 Seed Library，但推荐与数量计算必须基于它，而不是 LLM 自由文本。

## 10. AI 边界
不得：
- 直接写库存；
- 自动删除用户已选锚点菜；
- 把一次当顿偏好写成长期偏好；
- 把一次滑走写成永久 dislike；
- 凭图片判断食品安全/精确剩余量；
- 输出医疗营养处方；
- 在没有 recipe/library 依据时生成“可执行”菜谱；
- 用语言掩盖数据冲突。
