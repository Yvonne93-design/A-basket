// Authored everyday recipes. Times are conservative estimates, never model-generated safety rules.
// Extra seasonings use canonical units; no conversion from arbitrary model quantities.
export function enrichRecipes(recipes,ingredients){
 const extra=[['vinegar','醋','毫升','调味'],['sugar','糖','克','调味'],['chili','辣椒','个','蔬菜'],['sesame_oil','芝麻油','毫升','调味'],['butter','黄油','克','蛋奶'],['cheese','奶酪','克','蛋奶'],['bread','面包','片','主食'],['kimchi','泡菜','克','蔬菜']];
 for(const [id,name,unit,category] of extra)ingredients[id]={id,name,unit,defaultUnit:unit,category};
 // id, common name, cuisine, meal type, method, cookware, amounts, prep action/instruction, heat action/instruction/duration/passive.
 const rows=[
 ['cucumber_salad','拍黄瓜','中式','沙拉拌碗','拌','mixing_bowl',{cucumber:2,garlic:2,vinegar:10,salt:2},'slice|黄瓜洗净拍裂切段，蒜切末。','mix|拌入醋、蒜和盐。|2|0'],
 ['garlic_spinach','蒜蓉菠菜','中式','米饭配菜','炒','wok',{spinach:1,garlic:2,cooking_oil:5,salt:2},'chop|菠菜洗净切段，蒜切末。','stir_fry|炒香蒜末，下菠菜炒至熟软。|5|0'],
 ['broccoli_garlic','蒜蓉西兰花','中式','米饭配菜','炒','wok',{broccoli:300,garlic:2,cooking_oil:5,salt:2},'slice|西兰花切小朵洗净，蒜切末。','boil|加少量水，盖锅焖至熟软。|5|1;stir_fry|加入蒜末、油和盐炒匀。|3|0'],
 ['vinegar_potato','醋溜土豆丝','中式','米饭配菜','炒','wok',{potato:2,vinegar:10,cooking_oil:10,salt:2},'slice|土豆去皮切细丝，清水冲洗沥干。','stir_fry|热油炒土豆丝至断生熟透，加醋盐。|8|0'],
 ['pepper_pork','青椒炒肉','中式','米饭配菜','炒','wok',{chili:2,pork:200,soy:10,cooking_oil:10},'slice|先切辣椒，再用独立砧板切猪肉片；清洁双手、刀和砧板。','fry|肉片下锅炒至中心熟透，无生肉。|8|0;stir_fry|加辣椒和酱油炒熟。|4|0'],
 ['tomato_tofu','番茄烧豆腐','中式','米饭配菜','炖','wok',{tomato:2,tofu:300,cooking_oil:5,salt:2},'slice|番茄洗净切块，豆腐切块。','stir_fry|热油炒番茄出汁。|3|0;simmer|加豆腐和少量水，焖至滚烫熟透，加盐。|8|1'],
 ['mushroom_chicken','香菇焖鸡','中式','米饭配菜','炖','stockpot',{chicken:300,mushroom:150,soy:15,cooking_oil:5},'slice|香菇切片；生鸡肉用独立砧板切块，不冲洗生鸡肉，随后清洁工具和双手。','fry|先煎鸡肉表面。|5|0;simmer|加香菇、酱油和足量水焖煮，鸡肉中心达到74°C。|20|1'],
 ['corn_pork_soup','玉米肉片汤','中式','汤粥','煮','stockpot',{corn:1,pork:150,salt:2},'slice|玉米切段，另板切肉片，清洁刀板双手。','boil|加足量水煮开玉米。|8|1;simmer|放肉片煮至中心熟透，再加盐。|10|1'],
 ['tomato_egg_soup','番茄蛋花汤','中式','汤粥','煮','stockpot',{tomato:1,egg:2,salt:2,cooking_oil:5},'slice|番茄洗净切块，鸡蛋在另碗打散，洗手。','boil|加水煮开番茄。|6|1;mix|保持沸腾淋蛋液，煮至完全凝固，加盐。|3|0'],
 ['egg_fried_rice','蛋炒饭','中式','盖饭拌饭','炒','wok',{rice:150,egg:2,carrot:1,cooking_oil:10,salt:2},'dice|胡萝卜切丁，鸡蛋打散后洗手；使用刚煮熟的米饭。','fry|炒熟鸡蛋至完全凝固。|3|0;stir_fry|加入胡萝卜和熟米饭炒至均匀热透，加盐。|6|0'],
 ['steamed_egg','蒸水蛋','中式','米饭配菜','蒸','steamer',{egg:3,salt:2},'mix|鸡蛋打散，加约1.5倍温水与盐，倒入耐热碗，洗手。','steam|水开后上锅蒸至中心完全凝固；未凝固继续蒸。|15|1'],
 ['onion_beef_style_pork','洋葱炒肉片','中式','米饭配菜','炒','wok',{onion:1,pork:200,soy:10,cooking_oil:5},'slice|先切洋葱，独立砧板切肉片，清洁双手与工具。','fry|肉片炒至中心熟透。|8|0;stir_fry|加入洋葱和酱油炒至软熟。|5|0'],
 ['oyakodon','亲子丼','日式','盖饭拌饭','煮','wok',{chicken:200,egg:2,onion:1,rice:150,soy:15,sugar:5},'slice|洋葱切丝，鸡肉另板切小块并清洁工具，蛋液打散后洗手。','simmer|洋葱鸡肉加酱油、糖和水煮，鸡肉中心达到74°C。|15|1;mix|淋蛋液煮至完全凝固，盛在新煮米饭上。|4|0'],
 ['japanese_potato_stew','日式土豆炖肉','日式','米饭配菜','炖','stockpot',{potato:2,pork:200,onion:1,carrot:1,soy:15,sugar:5},'slice|蔬菜切块，猪肉另板切片并清洁工具。','simmer|食材加水、酱油糖，炖至土豆软烂、肉片中心熟透。|25|1'],
 ['butter_mushroom','黄油炒蘑菇','日式','米饭配菜','炒','frying_pan',{mushroom:250,butter:10,soy:5},'slice|香菇洗净切薄片。','fry|融化黄油，蘑菇炒至全熟变软，加酱油。|8|0'],
 ['tofu_egg_rice','豆腐鸡蛋盖饭','日式','盖饭拌饭','煮','stockpot',{tofu:200,egg:2,rice:150,soy:10},'slice|豆腐切块，鸡蛋打散后洗手。','simmer|豆腐加少量水和酱油煮透。|6|1;mix|淋蛋液煮至完全凝固，盖到新煮熟的米饭上。|4|0'],
 ['kimchi_fried_rice','泡菜炒饭','韩式','盖饭拌饭','炒','wok',{kimchi:150,rice:150,egg:2,cooking_oil:10},'chop|泡菜切碎，鸡蛋打散并洗手。泡菜须核对包装过敏原。','fry|炒鸡蛋至完全凝固。|3|0;stir_fry|加入泡菜和新煮米饭，炒至均匀热透。|6|0'],
 ['korean_tofu_soup','韩式豆腐汤','韩式','汤粥','煮','stockpot',{tofu:300,kimchi:100,mushroom:100,salt:1},'slice|豆腐切块，香菇切片；核对泡菜包装过敏原。','boil|加水煮开泡菜和香菇。|8|1;simmer|加入豆腐煮至滚烫熟透，再调盐。|6|1'],
 ['korean_potato','韩式酱烧土豆','韩式','米饭配菜','炖','wok',{potato:2,soy:15,sugar:5,cooking_oil:5},'dice|土豆去皮切小块洗净。','fry|土豆用油煎至表面微黄。|5|0;simmer|加水酱油糖焖至中心熟软。|12|1'],
 ['tomato_pasta','番茄意面','西式','面条米粉','煮','stockpot',{noodles:180,tomato:2,onion:1,cooking_oil:5,salt:2},'dice|番茄与洋葱洗净切丁。','stir_fry|锅内热油，炒软番茄和洋葱。|5|0;boil|加足量水下面条，按包装时间煮熟（预计12分钟），加盐。|12|1'],
 ['cheese_omelette','芝士蛋饼','西式','米饭配菜','煎','frying_pan',{egg:3,cheese:40,milk:30,cooking_oil:5,salt:1},'mix|鸡蛋加牛奶和盐打散，洗手。','fry|热锅下油倒蛋液，小火煎并加奶酪，中心完全凝固。|8|0'],
 ['potato_soup','土豆浓汤','西式','汤粥','煮','stockpot',{potato:2,onion:1,milk:200,salt:2},'dice|土豆去皮切小丁，洋葱切碎。','boil|先加水煮土豆洋葱至熟软。|15|1;mix|压碎土豆，加牛奶搅匀小火煮透，勿干烧。|5|0'],
 ['vegetable_noodles','青菜鸡蛋面','中式','面条米粉','煮','stockpot',{noodles:180,spinach:1,egg:2,salt:2},'wash|菠菜洗净，鸡蛋打散后洗手。','boil|水开下面条，按包装时间煮熟（预计10分钟）。|10|1;mix|放菠菜蛋液煮至菜熟、蛋完全凝固，加盐。|4|0'],
 ['cucumber_egg','黄瓜炒鸡蛋','中式','米饭配菜','炒','wok',{cucumber:2,egg:3,cooking_oil:10,salt:2},'slice|黄瓜洗净切片，鸡蛋打散后洗手。','fry|鸡蛋炒至完全凝固。|3|0;stir_fry|加入黄瓜炒熟，加盐。|4|0']
 ];
 const allergensFor=ids=>[...new Set(ids.flatMap(id=>({egg:['鸡蛋'],milk:['牛奶'],butter:['牛奶'],cheese:['牛奶'],soy:['大豆','小麦'],tofu:['大豆'],noodles:['小麦'],bread:['小麦'],sesame_oil:['芝麻'],kimchi:['海鲜','大豆','小麦']}[id]||[])))];
 for(const [id,name,cuisine,subtype,method,tool,amounts,prep,heat] of rows){const chunks=heat.split(';');recipes.push({id,name,cuisine,subtype,servingBase:2,difficulty:'简单',flavorTags:amounts.chili||amounts.kimchi?['香辣']:['家常'],methodTags:[method],cookwareReq:[tool,...(amounts.rice?['rice-cooker']:[])],ingredients:Object.entries(amounts).map(([ingredientId,qty])=>({ingredientId,qty,unit:ingredients[ingredientId].unit})),allergens:allergensFor(Object.keys(amounts)),steps:{prep:prep.split('|')[1],heat:chunks.map(c=>c.split('|')[1]).join(' '),finish:'确认食材熟透后关火盛盘。'},_prep:prep,_heat:heat});}
 const originals={
 tomato_scrambled_egg:['slice|番茄洗净切块，鸡蛋另碗打散后洗手。','fry|炒鸡蛋至凝固，暂盛出。|3|0;stir_fry|炒番茄出汁，倒回鸡蛋加盐炒匀至全熟。|5|0'],
 garlic_lettuce:['chop|生菜洗净沥干，蒜切末。','stir_fry|热油炒蒜末和生菜，加盐炒至叶片熟软。|5|0'],
 miso_tofu_soup:['slice|豆腐切块、香菇切片、小葱切末。','boil|加600毫升水煮开香菇与豆腐。|4|0;simmer|小火煮10分钟，加入盐和小葱煮透。|11|1'],
 teriyaki_chicken_rice:['slice|生鸡肉另板切块，不冲洗生鸡肉，清洁工具和双手。','fry|热油煎鸡肉表面。|5|0;simmer|加酱油和水加盖焖熟，鸡肉中心达到74°C。|15|1'],
 creamy_mushroom_pasta:['slice|香菇洗净切薄片。','boil|面条按包装时间煮熟（预计12分钟）。|12|1;simmer|沥去多余水，加香菇牛奶煮至熟透，加盐。|8|1'],
 potato_egg:['slice|土豆去皮切薄片，鸡蛋另碗打散并洗手。','fry|鸡蛋炒熟后暂盛出。|3|0;simmer|土豆加水焖至熟软。|8|1;stir_fry|加入熟鸡蛋加盐炒匀。|2|0']};
 for(const r of recipes){
  const ids=r.ingredients.map(i=>i.ingredientId);r.allergens=allergensFor(ids);if(ids.includes('rice')&&!r.cookwareReq.includes('rice-cooker'))r.cookwareReq.push('rice-cooker');
  const [prep,heat]=originals[r.id]||[r._prep,r._heat];delete r._prep;delete r._heat;
  const raw=ids.some(id=>['chicken','pork'].includes(id));const prepDuration=raw?6:ids.length>4?5:3;
  const steps=[];const step=(id,action,ingredientIds,duration,handsOn,instruction,phase,toolIds,dependencies)=>({id,action,ingredientIds,targetState:phase==='prep'?'prepared':'cooked',toolIds,resource:phase==='prep'?'prep_station':'stove',duration,handsOn,dependencies,instruction,phase,safetyGroup:raw?'raw_protein':'plant_or_egg'});
  const washable=ids.filter(id=>['tomato','lettuce','spinach','broccoli','cucumber','mushroom','carrot','onion','potato','corn','chili'].includes(id));
  for(const id of washable)steps.push({...step('wash_'+id,'wash',[id],1,true,'洗净'+ingredients[id].name,'wash',[],[]),resource:'prep_station',targetState:'clean',safetyGroup:'plant'});
  steps.push(step('prep',prep.split('|')[0],ids,prepDuration,true,prep.split('|')[1],'prep',['knife','cutting_board'],washable.map(id=>'wash_'+id)));
  if(raw)steps.push(step('sanitize','wash',[],2,true,'处理生肉后清洗消毒刀板和双手，再处理其他食材。','prep',['knife','cutting_board'],['prep']));
  let dep=steps.at(-1).id;
  if(ids.includes('rice')){steps.push({...step('rice_setup','wash',['rice'],2,true,'淘洗大米并按电饭煲刻度加水。','appliance_setup',['rice-cooker'],[dep]),resource:'appliance'});steps.push({...step('rice','boil',['rice'],25,false,'启动电饭煲煮熟米饭，保温待用。','appliance',['rice-cooker'],['rice_setup']),resource:'appliance'});}
  heat.split(';').forEach((c,n)=>{const [action,instruction,duration,passive]=c.split('|');const id='heat'+n;steps.push(step(id,action,ids,Number(duration),passive!=='1',instruction,'heat',[r.cookwareReq[0]],[dep]));dep=id;});
  steps.push({...step('plate','plate',ids,1,true,r.steps.finish,'finish',[],[dep,...(ids.includes('rice')?['rice']:[])]),resource:'prep_station'});
  if(r.id==='tomato_pasta'){r.cookwareAlternatives=['stockpot','wok'];for(const s of steps.filter(s=>s.phase==='heat'))s.toolIds=[...r.cookwareAlternatives];}
  r.flavorTags=ids.includes('kimchi')?['酸辣']:ids.includes('chili')?['香辣']:ids.includes('vinegar')?['酸香']:ids.some(id=>['milk','butter','cheese'].includes(id))?['奶香']:['不辣'];r.atomicSteps=steps;r.substyle=r.cuisine==='中式'?'家常':r.subtype==='汤粥'?'汤物':r.subtype==='盖饭拌饭'?'盖饭':'家常';r.mealType=r.subtype;r.handsOnTime=steps.filter(s=>s.handsOn).reduce((a,b)=>a+b.duration,0);r.prepEffort=raw?3:prepDuration>3?2:1;r.cleanupScore=r.cookwareReq.length+(raw?1:0);r.mealPrepSuitability=!ids.includes('lettuce');r.parallelizable=steps.some(s=>!s.handsOn);r.totalTime=washable.length+prepDuration+(raw?2:0)+Math.max(ids.includes('rice')?27:0,steps.filter(s=>s.phase==='heat').reduce((a,b)=>a+b.duration,0))+1;
 }
}
