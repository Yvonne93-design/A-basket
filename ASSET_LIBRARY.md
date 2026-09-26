# 正式 Asset Library

使用已有解压目录；Supplement 对应 ZIP 的 CRC 检查通过。来源均为用户提供的独立素材，不使用 Screen、PDF、预览拼图或素材目录总览图作为 UI。

- v5_CURATED：81 个 PNG，排除完全透明的 ingredients/chili.png，入库 80 个。
- Supplement_CLEAN_v1：32 个 PNG，入库 32 个。
- 正式原文件：public/assets/library/{v5,supplement}/。全部 512×512 RGBA，原图字节保持不变。
- 单一映射：src/assets.js；路径与透明边距的显示比例：src/asset-library.js。相同对象跨页面复用相同文件，未生成新图。没有新增食材、菜谱或厨房类型。

## 已映射到现有组件

食材：番茄、鸡蛋、菠菜、胡萝卜、洋葱、土豆、黄瓜、香菇、豆腐、猪肉、西兰花、玉米、蒜、大米。生菜仍复用原 P0 包的正确图，未用白菜冒充。

菜卡、圆桌、想吃缩略图、教程/食记：番茄炒蛋、蒜蓉生菜、照烧鸡肉（作为照烧鸡肉饭的主菜图）。三者均为透明主体，不再使用旧矩形 JPG。

菜系：中式、日式、韩式、西式、东南亚，替换原锅碗图标。

厨具：炒锅、汤锅、平底锅、蒸锅、料理机。用于厨房列表/详情与教程用到厨具；未在厨房配置中加入新工具。

教程：清洗、切配、炒菜、焖煮，使用统一动作图。原有两菜排程与文案不变。

装饰：菜篮；Supplement 的花盆、椅子、嫩芽、菜谱便签，用于圆桌/教程对应装饰位置。原图较大透明留白通过 CSS 显示比例适配，无裁 Screen 或重绘。

## 有意保留的缺口

- 当前菜谱为香菇豆腐汤、奶香蘑菇面、土豆炒鸡蛋；包内味噌汤、肉酱意面等不是对应菜品，不强行映射。
- 鸡腿肉不使用鸡胸肉图；小葱不使用韭葱图。油、盐、酱油、牛奶、面条等仍使用统一图标。
- 新甜品/海鲜等已入库但现有页面没有语义匹配项，未为了展示素材新增功能。
- 部分 Supplement 图仍有细小背景残留，未破坏原图进行自动清理。
- 本轮保留仓库已有本地计算默认、库存和教程状态；没有改动 AI、domain 或 data。

## 2026-09-26 食品补包

来源：`/Users/wangyiwen/Downloads/food-assets-20260926/`。10 张原始透明 PNG 已复制至 `public/assets/library/food-20260926/`，不裁切、不放大，统一使用 contain。

- 食材：chicken、milk、scallion、noodles、cooking_oil、soy、salt。
- 菜品：miso_tofu_soup、creamy_mushroom_pasta、potato_egg。
- 通过统一 ingredientArt / foodArt 跨菜篮、采购建议、圆桌、教程与食记复用，替换原占位。

## Food combinations supplement

Imported 20 original transparent 512×512 PNGs from `yilan_food_assets` into `public/assets/library/food-combinations/`, preserving the manifest and filenames. Registered all 20 in the shared asset library.

Active recipe mappings:
- `tomato_scrambled_egg` → `tomato_scrambled_eggs.png`
- `miso_tofu_soup` (香菇豆腐汤) → `mushroom_tofu_soup.png`
- `tomato_pasta` → `tomato_pasta.png`

The remaining 17 files have no matching current recipe and are retained as library assets, without inventing new dishes or assigning misleading images (e.g. shrimp fried rice to egg fried rice, beef to pork, bok choy to lettuce). Shared Food Card rendering propagates the active mappings to the carousel, table, tutorial dish overview and journal. Step visuals retain actual ingredients/cookware. Images were not edited; display scale is 1.12 to account for transparent margins.

## Expansion 24 supplement

Imported all 24 original 512×512 RGBA PNGs plus manifest to `public/assets/library/food-expansion-24/`, registered in shared library. Display scale 1 preserves original margins.

Activated mappings after viewing the images:
- `miso_tofu_soup` (香菇豆腐汤) → `shiitake_tofu_soup.png` (newest replacement)
- `tomato_egg_soup` → `tomato_egg_soup.png`
- `butter_mushroom` → `stir_fried_mushrooms.png`

21 other files are retained without automatic recipe assignment. Filename alone is insufficient: `egg_fried_rice.png` visibly contains shrimp, `garlic_lettuce.png` resembles bok choy rather than lettuce, `mushroom_pasta.png` resembles mushroom rice rather than noodles, and `stir_fried_broccoli.png` includes substantial carrot absent from the current garlic broccoli recipe. Potato strips also show peppers absent from the current recipe. Do not replace current dish images with these without a corresponding verified recipe/variant. Several plates show a flat lower edge in supplied artwork; PNG originals are preserved, no claimed visual QA pass.

Food cards, table, tutorial dish overview and journal share the same rendering map; step illustrations and all cooking/inventory logic remain unchanged.

## Onboarding illustration supplement

Imported 10 original transparent PNGs from `yilan_ui_illustration_assets_transparent`, preserving README and manifest. The text-free vegetable basket is shared by welcome and completion; all nine supplied cookware/appliance assets are registered in the shared cookware renderer (including previously missing rice cooker, oven, air fryer and microwave). Labels and controls remain real HTML. No UI screenshot crops were made.

This package does not contain the kitchen room scene, botanical edge decorations, calligraphy or provider logos. Existing botanical artwork and kitchen fallback remain; the welcome motto and completion letter remain editable text. Images have soft raster edges in the originals; keep appliance icons small rather than stretching them.
