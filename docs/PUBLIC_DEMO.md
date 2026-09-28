# 一篮 · 可运行作品提交说明

## 入口

源码分支：`feature/iphone17-v0`，仓库 `https://github.com/Yvonne93-design/A-basket`。不要只下载目前仍为初始内容的 main 分支。

公网地址以本次成功发布返回的地址为准。进入 `/preview.html` 使用 iPhone 外框，进入 `/` 使用页面原始自适应入口。新访客从欢迎与初始设置开始；可点“先看看”。

## 本地运行

需要 Node.js 22.9 或以上。运行程序没有第三方 npm 依赖。

```sh
git clone --branch feature/iphone17-v0 --single-branch https://github.com/Yvonne93-design/A-basket.git
cd A-basket
npm start
```

打开 `http://localhost:4173/preview.html`。执行 `npm test` 验证业务测试。

## 体验路径

先设置厨房与用餐习惯 → 再搭一篮 → 生成建议 → 核对采购并入库 → 做饭页选择菜品 → 开始教程 → 确认实际用量并完成 → 查看库存与食记。

库存、选择、教程进度与食记保存在访问者当前浏览器，访客之间不共享。当前没有真实账号登录、跨设备云同步或公开社区数据库；社区展示和照片识别等原型能力不代表生产服务。

## AI 与部署边界

- 保留原有 planBasket、recommendRecipes、proposeCookingStrategy 服务端网关与输出校验。
- 公网未配置模型密钥时，自动使用已有确定性规则回退；不应将其描述为真实模型生成。
- 如需真实模型，平台服务端安全配置 OPENAI_API_KEY、OPENAI_BASE_URL、OPENAI_MODEL，不能放进前端或仓库。
- 当前上线对象是 4173 正式工程，不含 4178 独立试验版的小票核对改动。
- 摄影、厨房识别等仍按原项目实现与模拟边界提供，不能宣称已能准确识别真实小票。

## 固定地址更新

云端托管不依赖本地电脑开机。保持同一 Site 身份，发布新版本后沿用原 URL。浏览器刷新获取新代码，原 localStorage 数据保留（除非用户清理或后续版本显式迁移）。

当前为手动发布：修改、测试、`npm run build`、保存并部署同一 Site 新版本。仅修改本地文件或仅推送 GitHub 不会自动触发 Sites 更新。不要重新创建 Site，否则地址会改变。

`.openai/hosting.json` 保存 Site 身份，不含密钥。`scripts/build-site.mjs` 仅打包 public/src 与云端适配层，不上传 .env、测试截图和个人浏览器数据。server/site-worker.js 将标准 Request 转交共用网关，前端视觉和业务源码保持不变。
