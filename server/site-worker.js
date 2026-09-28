// Hosting adapter; the app, rules and validated AI gateway remain shared.
import {createAIGateway,AIError} from './server/ai-gateway.js';
const gateways=new WeakMap();
const rates=new Map();
const config=env=>({apiKey:env.OPENAI_API_KEY||'',model:env.OPENAI_MODEL||'deepseek-flash',baseUrl:env.OPENAI_BASE_URL||'https://api.deepseek.com'});
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/healthz')return json({ok:true});
  if(url.pathname==='/api/ai/status')return json({mode:'real',configured:!!config(env).apiKey,model:config(env).model,provider:'deepseek',tasks:['planBasket','recommendRecipes','proposeCookingStrategy'],fallback:true});
  if(url.pathname==='/api/ai'){
   if(request.method!=='POST')return json({error:'仅支持 POST'},405);
   if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'不允许跨站 AI 请求'},403);
   if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return json({error:'需要 JSON 请求'},415);
   const client=request.headers.get('CF-Connecting-IP')||'unknown',now=Date.now();
   const recent=(rates.get(client)||[]).filter(t=>t>now-60000);
   if(recent.length>=15)return json({error:'请求过于频繁，请稍后重试'},429);
   if(rates.size>500)rates.clear();recent.push(now);rates.set(client,recent);
   try{
    let text='',size=0;const decoder=new TextDecoder();
    if(request.body){const reader=request.body.getReader();while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144){await reader.cancel();return json({error:'请求内容过大'},413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}
    let payload;try{payload=JSON.parse(text);}catch{return json({error:'请求格式无效'},400);}
    if(!payload||typeof payload!=='object'||Array.isArray(payload))return json({error:'请求格式无效'},400);
    if(!gateways.has(env))gateways.set(env,createAIGateway({getConfig:async()=>config(env)}));
    return json(await gateways.get(env)(payload.task,payload.input));
   }catch(e){return json({error:e instanceof AIError?e.message:'服务暂时不可用',code:e instanceof AIError?e.code:'INTERNAL_ERROR'},e instanceof AIError?e.status:500);}
  }
  if(url.pathname.startsWith('/api/'))return json({error:'接口不存在'},404);
  return env.ASSETS.fetch(request);
 }
};
