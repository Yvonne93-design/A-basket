> **统一主版本**：所有聊天都在当前 `A-basket/` 仓库继续修改。兄弟目录 `yilan/` 和旧压缩包仅作历史参考。统一预览为 http://localhost:4173/preview.html#/basket，修改后刷新整个预览。当前默认请求服务端 DeepSeek；未配置或请求失败时自动使用基础规划。详见 `AGENTS.md`。

# A-basket · 一篮 iPhone 17 V0

依据 `一篮_CodingAgent_Lean_V0_Final` 的规格与 22 页 `all.pdf` 实现。无框架依赖，真实 HTML 组件、CSS 和浏览器状态；没有使用设计截图作为 UI。

## 启动

需要 Node.js 20 或以上；无需安装依赖。

```sh
git clone https://github.com/Yvonne93-design/A-basket.git
cd A-basket
git switch feature/iphone17-v0
npm start
```

打开 http://localhost:4173/preview.html ：iPhone 17 机身预览，真实页面可点击、滚动、输入。

直接应用入口：http://localhost:4173 。当前实现是移动 Web V0，并非已打包的原生 iOS App。

预览逻辑屏幕 402 × 874（@3x 对应 1206 × 2622 像素），参考 [Apple 技术规格](https://www.apple.com/iphone-17/specs/)。状态栏、灵动岛和 Home Indicator 为 CSS 预览装饰；模拟顶部 62、底部 34 安全区，真实设备读取 env(safe-area-inset-*)，不声称等同 iOS Simulator。本地服务仅监听本机回环地址。固定公网访问与部署方式见 `docs/PUBLIC_DEMO.md`。

```sh
npm run check
npm test
```

## 3 分钟核心演示

1. 菜篮 → 再搭一篮 → 从想吃的挑，选择番茄炒蛋、蒜蓉生菜 → 生成建议。
2. 建议可改数量、锁定、删除 → 确认采购清单。
3. 勾选实际买到的食材，修改数量 → 完成采购 → 再确认实际量。未勾选的不会入库。
4. 做饭 → 点两张菜卡的心。检查圆桌和整餐需求；缺食材时禁止开始，可通过采购或顺手买了补充。
5. 开始做饭 → 合并洗切、按锅具/灶位排序、蔬菜最后出锅。
6. 完成 → 确认实际用量（可以是小数）→ 扣库存并保存食记。刷新或重复完成不会再次扣库存。

初始包含包内示例库存：番茄 3 个、鸡蛋 6 个；其余包括油盐要确认实际购买。验收浏览器可能保留测试产生的食记和库存，不代表你的真实采购。

## 页面覆盖

全部 22 个 Screen 对应入口均可到达。四个 L1 固定为菜篮 / 做饭 / 食记 / 我的，无返回箭头。

- P01–06：设置、厨房、添加厨具、编辑厨具、个人资料、饮食限制。
- P07–12：欢迎、菜篮、再搭一篮、食材建议、采购、顺手买了。
- P13–15：做饭圆桌、整餐教程、换个方向 Sheet。
- P16–19：食记、拍照入口、记录确认、我的。
- P20–22：基础资料、厨房确认、设置完成。

外围页是精简 V0，不表示 22 页的所有字段或视觉细节已经完成。

## 代码

- `src/data.js`：30 道结构化家常菜、食材与厨具目录、初始化数据。
- `src/domain.js`：数量、硬限制、库存批次、采购事务、FIFO 扣减、幂等和资源排程校验。
- `src/ai.js`：AIService + MockAdapter + RealAIAdapter。
- `src/app.js`：路由、组件和交互；`src/style.css`：视觉 tokens 和移动布局。
- `tests/domain.test.mjs`：业务与库存测试；另有 AI 网关、排程和升级场景测试（当前数量以 `npm test` 输出为准）。
- `qa/`：浏览器路由检查及视觉截图，仅用于验收，不由应用引用。

## DeepSeek 接入

`planBasket()`、`recommendRecipes()` 和 `proposeCookingStrategy()` 使用现有 RealAIAdapter，通过同源 `/api/ai` 请求 DeepSeek。模型配置 `deepseek-flash`，API 地址 `https://api.deepseek.com`。本机 `.env` 已备好：只填写 `OPENAI_API_KEY=` 后面的值，保存后重新生成即可，不需要改源码或重启服务。新克隆仓库需先复制 `.env.example` 为 `.env`。

使用 [DeepSeek JSON 模式](https://api-docs.deepseek.com/guides/json_mode/)，服务端严格校验候选与原因；数量、饮食硬限制、依赖、锅具/灶位和库存事务仍由程序负责。长时偏好、本轮偏好、当顿约束和历史分别组织，图片/昵称/备注不发给文本模型。

未配置、超时、限流或输出无效时，返回 `meta.source: fallback`，继续体验流程。图片识别仍为 Mock。真实模型返回才标注 `real`，测试中的模拟网络响应不等于真实联调。

核验：`node scripts/verify-demo.mjs`。结果保存到 `reports/ai-response-examples.json`，仅含示例状态及公开响应；不包含密钥。本轮实际 HTTP 结果为 `configured: false`，三项能力均 fallback，真实 DeepSeek 联调待填写密钥。

公开服务保护：每客户端每分钟 15 次、实例每分钟 60 次、4 个模型并发、256 KiB 请求上限、12 秒模型超时、5 分钟缓存、相同请求合并。限流/缓存为单实例内存，反向代理下客户端可能共用额度；不是用户配额/计费系统。

## 生产部署

提供 `render.yaml`，采用支持 Node 的 Web Service；保留 `/api/ai`，不需要重写服务。静态托管不支持 server-side AI，不能作为真实 AI 验收版本。

在 Render 连接这个仓库的 `feature/iphone17-v0` 分支创建 Blueprint，并在私密环境变量 `OPENAI_API_KEY` 填写密钥。其他配置由文件提供，平台分配 `onrender.com` URL。参考 [Render 官方部署说明](https://render.com/docs/deploy-node-express-app) 和 [Blueprint 配置](https://render.com/docs/blueprint-spec)。此 Render 配置为备选方案，并不代表已创建 Render 服务；当前公网发布采用 Sites，见 `docs/PUBLIC_DEMO.md`。免费实例可能休眠，正式评审前需要验证冷启动和实际调用。

部署后运行 `node scripts/verify-demo.mjs https://实际域名`，确认 status 已配置、两项主能力返回 `meta.source: real`，再将地址交给评委。评委无需登录模型平台或填写密钥。

## 当前边界

- 单浏览器 localStorage，未接账户、数据库、云同步、多设备或多标签并发事务。
- Recipe Library 为 30 道常见菜；未知照片菜名可存食记，未关联菜谱的意愿暂不能用于食材规划。
- 图片识别明确标为 Mock；相机使用浏览器文件/拍照入口，没有自定义取景器。
- 登录、会员、通知发送、清缓存为未开放说明；资料页仅实现核心昵称、人数，其他设计字段待补。
- 教程基于人工整理的 atomicSteps；时间是预计值，不能保证不同火力、份量和熟练度下完全一致。普通刀、砧板视为基础操作台用具；稀缺锅具按厨房数量排程。
- 五个核心页面使用提供的 P0 独立素材；未覆盖的食材和菜品使用统一占位，见 MISSING_ASSETS.md。
- 视觉已逐页检查布局；尚非 22 页 Pixel Perfect。

## 下一步

1. 填写 DeepSeek 密钥，验收两项主能力真实调用。
2. 同步分支并连接部署平台，验收公网 `/api/ai`。
3. 浏览器策略恢复后，复核原子步骤教程的移动端视觉。详见 `reports/AI_UPGRADE_REPORT.md`。

## 产品逻辑优化（2026-09-26）

逐项带入库存、周期整体吃法、当顿菜系/口味筛选、经校验的缺料适配、牛奶包装单位、常备调料状态已接入现有流程。用户页面不显示文本 AI fallback 技术状态，诊断保留在接口 meta。51 项测试通过，浏览器截图检查因策略验证不可用而未完成。细节和限制见 [产品逻辑验收报告](reports/PRODUCT_LOGIC_PASS.md)。

### 厨房先适配（补充）

采购主清单只保留已填好数量的正数项目；现有食材优先只推荐直接能做或适配后能做的菜。明确选择「可以补买 1–2 样」才显示小额缺料候选，并自动生成整餐补买清单。菠菜/生菜替换会同步菜名、素材、步骤和实际扣减，等价菜卡去重。AI 可选择适合的已验证适配候选，程序校验 adaptationCodes、库存与硬限制；不放宽库存政策来假装命中口味。64 项自动测试通过，并实测本机 HTTP 的库存筛选、补买数量和正数采购清单。
