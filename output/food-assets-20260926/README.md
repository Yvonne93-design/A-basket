# 一篮 · 独立透明底食品素材

共 10 张 PNG，每张单独调用内置图片生成工具制作。保留生成的原始像素和 Alpha 通道；未从合集裁切，未进行抠图或缩放。

7 张食材 + 3 张菜品，暖色水彩插画风格。PNG 均为 1254 × 1254 RGBA，背景含真实透明像素。

## 文件对照

- 鸡腿肉：`ingredients/chicken.png`
- 牛奶：`ingredients/milk.png`
- 小葱：`ingredients/scallion.png`
- 面条：`ingredients/noodles.png`
- 食用油：`ingredients/cooking_oil.png`
- 酱油：`ingredients/soy.png`
- 盐：`ingredients/salt.png`
- 香菇豆腐汤：`food_cards/miso_tofu_soup.png`
- 奶香蘑菇面：`food_cards/creamy_mushroom_pasta.png`
- 土豆炒鸡蛋：`food_cards/potato_egg.png`

## 接入说明

文件名沿用当前 App 的食材/菜谱 ID。香菇豆腐汤对应现有 ID `miso_tofu_soup`，画面内容为香菇豆腐清汤。
使用 object-fit: contain 显示完整素材，不要用 cover 裁去碗盘或食材边缘。浅色食品推荐搭配现有米白底，深色预览中的黑色区域是透明区。
此次仅交付素材 ZIP，未修改 App 素材映射。prompts.json 保存逐张生成提示词，manifest.json 保存文件及透明通道检查结果。
