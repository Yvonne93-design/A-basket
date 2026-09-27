// Supplied local PNGs, indexed by the package mapping.csv. No image-generation dependency.
export const actionAssets=Object.freeze({
  sanitize:{label:"清洗消毒",src:"/assets/library/tutorial-actions/sanitize.png"},
  rice_setup:{label:"淘米准备",src:"/assets/library/tutorial-actions/rice_setup.png"},
  cook_rice:{label:"电饭煲煮饭",src:"/assets/library/tutorial-actions/cook_rice.png"},
  "wash": {
    "label": "清洗",
    "src": "/assets/library/tutorial-actions/wash.png"
  },
  "soak": {
    "label": "浸泡",
    "src": "/assets/library/tutorial-actions/soak.png"
  },
  "drain": {
    "label": "沥水",
    "src": "/assets/library/tutorial-actions/drain.png"
  },
  "peel": {
    "label": "去皮",
    "src": "/assets/library/tutorial-actions/peel.png"
  },
  "cut": {
    "label": "切 / 切块",
    "src": "/assets/library/tutorial-actions/cut.png"
  },
  "slice": {
    "label": "切片",
    "src": "/assets/library/tutorial-actions/slice.png"
  },
  "dice": {
    "label": "切丁 / 小块",
    "src": "/assets/library/tutorial-actions/dice.png"
  },
  "shred": {
    "label": "切丝",
    "src": "/assets/library/tutorial-actions/shred.png"
  },
  "mince": {
    "label": "切末 / 切碎",
    "src": "/assets/library/tutorial-actions/mince.png"
  },
  "crush": {
    "label": "拍碎 / 压碎",
    "src": "/assets/library/tutorial-actions/crush.png"
  },
  "beat": {
    "label": "打散",
    "src": "/assets/library/tutorial-actions/beat.png"
  },
  "mix": {
    "label": "搅拌 / 拌匀",
    "src": "/assets/library/tutorial-actions/mix.png"
  },
  "marinate": {
    "label": "腌制",
    "src": "/assets/library/tutorial-actions/marinate.png"
  },
  "coat": {
    "label": "裹粉 / 挂浆",
    "src": "/assets/library/tutorial-actions/coat.png"
  },
  "add_ingredient": {
    "label": "下料",
    "src": "/assets/library/tutorial-actions/add_ingredient.png"
  },
  "add_water": {
    "label": "加水 / 高汤",
    "src": "/assets/library/tutorial-actions/add_water.png"
  },
  "season": {
    "label": "调味",
    "src": "/assets/library/tutorial-actions/season.png"
  },
  "stir": {
    "label": "翻拌 / 推拌",
    "src": "/assets/library/tutorial-actions/stir.png"
  },
  "stir_fry": {
    "label": "翻炒",
    "src": "/assets/library/tutorial-actions/stir_fry.png"
  },
  "pan_fry": {
    "label": "煎",
    "src": "/assets/library/tutorial-actions/pan_fry.png"
  },
  "flip": {
    "label": "翻面",
    "src": "/assets/library/tutorial-actions/flip.png"
  },
  "deep_fry": {
    "label": "炸",
    "src": "/assets/library/tutorial-actions/deep_fry.png"
  },
  "boil": {
    "label": "煮",
    "src": "/assets/library/tutorial-actions/boil.png"
  },
  "blanch": {
    "label": "焯水",
    "src": "/assets/library/tutorial-actions/blanch.png"
  },
  "simmer": {
    "label": "小火煮 / 焖",
    "src": "/assets/library/tutorial-actions/simmer.png"
  },
  "steam": {
    "label": "蒸",
    "src": "/assets/library/tutorial-actions/steam.png"
  },
  "cover": {
    "label": "盖盖等待",
    "src": "/assets/library/tutorial-actions/cover.png"
  },
  "wait": {
    "label": "静置 / 等待",
    "src": "/assets/library/tutorial-actions/wait.png"
  },
  "plate": {
    "label": "盛出 / 装盘",
    "src": "/assets/library/tutorial-actions/plate.png"
  },
  "garnish": {
    "label": "撒料 / 点缀",
    "src": "/assets/library/tutorial-actions/garnish.png"
  },
  "knead": {
    "label": "揉面 / 揉团",
    "src": "/assets/library/tutorial-actions/knead.png"
  },
  "roll": {
    "label": "擀开",
    "src": "/assets/library/tutorial-actions/roll.png"
  },
  "wrap": {
    "label": "包 / 卷",
    "src": "/assets/library/tutorial-actions/wrap.png"
  },
  "roast_bake": {
    "label": "烤",
    "src": "/assets/library/tutorial-actions/roast_bake.png"
  },
  "air_fry": {
    "label": "空气炸",
    "src": "/assets/library/tutorial-actions/air_fry.png"
  },
  "reduce": {
    "label": "收汁",
    "src": "/assets/library/tutorial-actions/reduce.png"
  },
  "thicken": {
    "label": "勾芡",
    "src": "/assets/library/tutorial-actions/thicken.png"
  },
  "blend": {
    "label": "搅打 / 打碎",
    "src": "/assets/library/tutorial-actions/blend.png"
  }
});

// Legacy authored actions are broader than the illustration vocabulary. Refine only
// the visual metadata; instructions, cookware, dependencies and timing stay untouched.
export function stepActionCode(step){
 const text=step.instruction||step.text||'';
 if(/消毒|清洁.*(?:双手|刀|工具)|处理后洗手/.test(text)&&!/(?:切|炒|煎|煮|打散)/.test(text))return 'sanitize';
 if(/淘(?:洗)?米|淘洗大米/.test(text))return 'rice_setup';
 if(/电饭煲/.test(text))return 'cook_rice';
 if(step.actionCode&&Object.hasOwn(actionAssets,step.actionCode))return step.actionCode;
 const action=step.action||'';
 if(['slice','chop','dice','mix'].includes(action)&&['prep','wash'].includes(step.phase)){
  const cuts=[['shred',/切(?:细)?丝/],['dice',/切(?:小)?丁/],['slice',/切(?:薄)?片/],['cut',/切(?:小)?块|切段|切小朵/],['mince',/切末|切碎/],['crush',/拍裂|拍碎|压碎/],['beat',/打散/]];
  const matches=cuts.map(([code,re])=>({code,index:text.search(re)})).filter(x=>x.index>=0).sort((a,b)=>a.index-b.index);
  if(matches.length)return matches[0].code;
 }
 if(action==='fry')return /煎/.test(text)?'pan_fry':/炒/.test(text)?'stir_fry':null;
 if(action==='mix'&&/煮|沸腾/.test(text))return /小火/.test(text)?'simmer':'boil';
 if(action==='boil'&&/焖/.test(text))return 'simmer';
 if(action==='plate'&&!/盛[出盘在]|装盘|出锅|开饭/.test(text))return /收汁/.test(text)?'reduce':/调味|加盐/.test(text)?'season':null;
 if(action==='chop')return 'cut';
 if(Object.hasOwn(actionAssets,action))return action;
 // Unknown actions are not guessed from arbitrary ingredient words or dish names.
 const aliases={saute:'stir_fry',bake:'roast_bake',roast:'roast_bake',chopping:'cut',rest:'wait'};
 return aliases[action]||null;
}
const missing=new Map();
export function resolveActionAsset(step){
 const actionCode=stepActionCode(step);
 if(actionCode)return {actionCode,...actionAssets[actionCode]};
 const entry={stepId:step.id||'',action:step.actionCode||step.action||'',instruction:step.instruction||step.text||''};
 const key=JSON.stringify(entry);if(!missing.has(key)){if(missing.size>=200)missing.delete(missing.keys().next().value);missing.set(key,entry);}
 return null;
}
export const missingActions=()=>[...missing.values()].map(x=>({...x}));
