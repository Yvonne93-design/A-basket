# 一篮 - Visual / Asset Implementation

## 1. 视觉基线
唯一视觉参考：`design/source/all.pdf`（22页，每页一个完整 Screen）。
目标：**学习并重建**，不是截图拼接。

风格：奶油白、低饱和橄榄绿、少量暖橙；简约高级；轻手绘温度；UI骨架规整；不要“AI科技感”、不要儿童化、不要满屏氛围小字。

## 2. 禁止截图式实现
禁止：整屏背景图、裁 Button/Card/Tab/圆桌/文字/插画拼页面、透明热点覆盖截图。
必须：真实组件 + CSS/Layout + 可编辑文字 + 数据驱动状态。

## 3. 视觉角色
- 食材 / 厨具 / 菜系小图：统一手绘插画，透明底。
- 菜品卡：真实/半写实居家食物摄影感。
- 教程：具象手绘 instructional illustration，必须看懂食材状态、动作、锅具。
- 食记：用户真实照片优先。
- 装饰人物/猫/植物：只做少量品牌温度，不承担业务信息。

## 4. 资产生成
如果 Agent 有图像生成能力：按 Screen 学习风格，预生成独立 assets，存入 `assets/`，跨页面按 ID 复用；不要 runtime 每次重新生成。
如果没有：统一 placeholder + 输出 `MISSING_ASSETS.md`；仍禁止裁 Screen。

### P0 asset set
**Ingredient icons**：tomato, egg, lettuce, spinach, carrot, onion, potato, cucumber, mushroom, tofu, chicken, pork, broccoli, corn, milk, garlic, scallion, noodles, rice, cooking_oil。

**Cookware**：wok, stockpot, frying_pan, steamer, rice_cooker, air_fryer, microwave, oven, blender, pressure_cooker。

**Cuisine/meal type**：chinese, japanese, korean, western, southeast_asian, no_preference, rice_with_dishes, rice_bowl, noodles, soup_congee, salad_bowl。

**Food cards Demo**：tomato_scrambled_egg, teriyaki_chicken_rice, miso_tofu_soup, tonkotsu_ramen, curry_chicken_rice, creamy_mushroom_pasta, garlic_lettuce, salmon_plate, mapo_tofu。

**Tutorial Demo**：hero, wash, cut, prep, cook_1, cook_2, parallel, finish。

## 5. 资产 Prompt 核心
### 手绘食材/厨具
`isolated hand-drawn editorial cookbook illustration, soft pencil + watercolor, muted sage green/warm cream/restrained orange, adult lifestyle, recognizable, transparent background, no text, no UI`

### Food card
`natural home-cooked food photography, warm daylight, realistic 1-2 person portion, simple ceramic tableware, cozy minimal home setting, no text/watermark, 4:3`

### Tutorial
`instructional hand-drawn cooking step illustration, concrete action + ingredient state + cookware position, soft pencil/watercolor, minimal, no text, no face`

## 6. Design tokens（起点，不替代视觉 QA）
- Background `#F7F3EA`
- Surface `#FFFDF8`
- Primary `#55764A`
- PrimaryDark `#345833`
- PrimarySoft `#E9F0E0`
- AccentOrange `#D96F38`
- TextPrimary `#22231F`
- TextSecondary `#79786F`
- Border `#E8E1D6`
- Card radius ~22px; small card 16px; Sheet ~28px; touch target >=44px。

每完成一页都要对照对应 Screen 做 Visual QA；不像时改真实组件/独立 asset，不用截图补丁。
