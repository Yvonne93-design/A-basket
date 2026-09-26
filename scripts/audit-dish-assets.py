"""Read-only image audit. Never crop, mask, rescale, or rewrite supplied assets."""
from pathlib import Path
from PIL import Image
import hashlib,json,csv,subprocess
root=Path(__file__).resolve().parents[1]
metadata=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {dishAssetIndex} from './src/dish-asset-index.js'; import {assetLibrary} from './src/asset-library.js'; import {recipeImageMap} from './src/recipe-image-map.js'; console.log(JSON.stringify({index:dishAssetIndex.map(a=>({...a,src:assetLibrary[a.assetKey]?.src})),mapping:recipeImageMap}));"],cwd=root,text=True))
known={r['src']:r['name'] for r in metadata['index']}
mapping=metadata['mapping'];selected={r['src']:r['name'] for r in mapping.values() if r['src']}
known.update(selected)
aliases={'tomato_egg':'番茄炒蛋','tomato_egg_stir_fry':'番茄炒蛋','tomato_egg_boil':'番茄蛋花汤','tomato_scrambled_egg':'番茄炒蛋','mushroom_stir_fry':'炒蘑菇','mushroom_cream_pasta':'奶香蘑菇面','creamy_mushroom_pasta':'奶香蘑菇面','mushroom_noodles_boil':'奶香蘑菇面','miso_tofu_soup':'香菇豆腐汤','mushroom_tofu_boil':'香菇豆腐汤','garlic_lettuce':'蒜蓉生菜','lettuce_stir_fry':'蒜蓉生菜','potato_stir_fry':'炒土豆丝','rice_egg_carrot_stir_fry':'蛋炒饭','tomato_tofu_braise':'番茄烧豆腐','egg_cheese_pan_fry':'芝士蛋饼','beef_green_pepper_stir_fry':'青椒牛肉','bell_pepper_beef_stir_fry':'青椒牛肉','bok_choy_garlic_stir_fry':'蒜蓉青菜','bokchoy_stir_fry':'蒜蓉青菜','eggplant_garlic_stir_fry':'蒜香茄子','eggplant_stir_fry':'蒜香茄子','winter_melon_pork_meatball_soup':'冬瓜丸子汤','winter_melon_meatball_boil':'冬瓜丸子汤','shrimp_rice_egg_vegetable_stir_fry':'虾仁炒饭','shrimp_rice_egg_stir_fry':'虾仁炒饭','rice_steam':'米饭','baozi_steam':'包子','wonton_boil':'馄饨汤','beef_noodles_boil':'牛肉汤面','beef_potato_braise':'土豆炖牛肉','dumpling_pan_fry':'煎饺','gyoza':'煎饺','seaweed_egg_boil':'紫菜蛋花汤','pork_belly_braise':'红烧肉','shrimp_avocado_mix':'牛油果虾仁沙拉','corn_shrimp_stir_fry':'玉米虾仁','broccoli_stir_fry':'清炒西兰花','broccoli_shrimp_stir_fry':'西兰花炒虾仁','fish_steam':'清蒸鱼','fish_pickled_cabbage_boil':'酸菜鱼','bell_pepper_egg_stir_fry':'青椒炒蛋','pork_carrot_wood_ear_stir_fry':'鱼香肉丝','pork_deep_fry':'糖醋里脊','chicken_wings_braise':'红烧鸡翅','chicken_peanuts_chili_stir_fry':'宫保鸡丁','chicken_lettuce_mix':'鸡肉沙拉','pumpkin_boil':'南瓜浓汤','egg_pan_fry':'煎蛋','tofu_pork_chili_braise':'麻婆豆腐','udon_shrimp_boil':'天妇罗乌冬','noodles_pork_egg_boil':'拉面','salmon_asparagus_pan_fry':'香煎三文鱼配芦笋'}
paths=sorted(p for p in (root/'public/assets').rglob('*') if p.suffix.lower() in ('.png','.jpg') and (any(x in p.parts for x in ['food_cards','food-combinations','food-expansion-24','food-clean-v3','food-complete']) or p.name=='tomato_scrambled_egg.png'))
rows=[];groups={};pixels={}
for p in paths:
 url='/'+str(p.relative_to(root/'public'));im=Image.open(p).convert('RGBA');alpha=im.getchannel('A');bbox=alpha.getbbox();sha=hashlib.sha256(p.read_bytes()).hexdigest();pixel=hashlib.sha256(str(im.size).encode()+im.tobytes()).hexdigest()
 name=known.get(url,aliases.get(p.stem,p.stem));name=aliases.get(p.stem,name)
 row=dict(asset=url,dish=name,width=im.width,height=im.height,transparent=alpha.getextrema()[0]==0,edge_contact=bool(bbox and (bbox[0]==0 or bbox[1]==0 or bbox[2]==im.width or bbox[3]==im.height)),sha256=sha,pixel_hash=pixel,selected_for=selected.get(url,''),duplicate_of=pixels.get(pixel,''))
 pixels.setdefault(pixel,url);rows.append(row);groups.setdefault(name,[]).append(row)
# Selected mappings win; others retain one preferred file and all source versions as aliases.
catalog=[]
for name,variants in groups.items():
 variants.sort(key=lambda r:(not bool(r['selected_for']),not r['transparent'],r['edge_contact'],0 if '/food-clean-v3/' in r['asset'] else 1))
 catalog.append(dict(dish=name,preferred=variants[0]['asset'],variants=[r['asset'] for r in variants],status='mapped' if any(r['selected_for'] for r in variants) else 'reserve_review_before_use'))
report=root/'reports';report.mkdir(exist_ok=True)
with (report/'food-asset-inventory.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
(report/'food-asset-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2))
with (report/'recipe-image-mapping.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['recipe_id','菜名','状态','唯一图片路径','说明'])
 for id,r in mapping.items():w.writerow([id,r['name'],'已匹配' if r['src'] else '缺图',r['src'] or '',r['note']])
matched=[r['name'] for r in mapping.values() if r['src']];missing=[r['name'] for r in mapping.values() if not r['src']]
text=f'''# 菜品图片审计\n\n盘点 {len(rows)} 个项目内新旧文件，{len(pixels)} 个不同像素内容；{len(rows)-len(pixels)} 个完全重复版本以索引别名去重，原文件保留。按已知菜名归并为 {len(catalog)} 个素材组，其余仅作备用，不自动进入菜谱。\n\n范围：P0、v5、supplement、food-20260926、food-combinations、food-expansion-24、旧 complete 库与新 clean isolated v3，另含根目录旧番茄炒蛋图。新包 30 张全部归档。未新增菜谱。\n\n唯一运行时来源：src/recipe-image-map.js；明确登记当前全部 {len(mapping)} 道菜，其中 {len(matched)} 道有图、{len(missing)} 道缺图。无图不会用相似菜或食材拼图替代。\n\n## 已匹配\n\n{', '.join(matched)}\n\n## 缺图\n\n{', '.join(missing)}\n\n## 选择与保留\n\n同一道菜先核对主要可见食材和形态，再优先完整、透明、风格一致版本。所有 PNG 按原字节复制；页面 contain 完整显示画布，不放大裁边，不 mask，不重新生成。旧素材保留为备用，catalog 的 reserve_review_before_use 不代表已匹配菜谱。旧 complete 库含风格较简化的示意图，不以它们填补成熟手绘菜图缺口。\n\n洋葱牛肉不用于洋葱猪肉；玉米排骨不用于肉片汤；虾仁炒饭不用于蛋炒饭。照烧鸡肉缺饭、炒西兰花混入胡萝卜、番茄意面疑似肉酱，均暂列缺图。\n\n精确和轻微适配沿用已审定 ID；明显适配仅接受业务逻辑已指定的对应菜谱 ID（例如菠菜换生菜），其余占位，不按文件名或食材组合猜图。\n'''
(report/'food-assets-audit.md').write_text(text)
print(f'{len(rows)} files / {len(pixels)} unique pixels / {len(catalog)} groups; {len(matched)} mapped / {len(missing)} missing')
