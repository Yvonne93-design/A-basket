import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createAIGateway,readAIConfig,AIError} from './server/ai-gateway.js';
const root=fileURLToPath(new URL('.',import.meta.url));
const runAI=createAIGateway();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
const rates=[];
export const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/api/ai/status'&&req.method==='GET'){const config=await readAIConfig();return json(res,200,{mode:'real',configured:!!config.apiKey,tasks:['planBasket','recommendRecipes']});}
  if(pathname==='/api/ai'){
   if(req.method!=='POST')return json(res,405,{error:'仅支持 POST'});
   if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`)return json(res,403,{error:'不允许跨站 AI 请求'});
   if(!(req.headers['content-type']||'').startsWith('application/json'))return json(res,415,{error:'需要 JSON 请求'});
   while(rates.length&&rates[0]<Date.now()-60000)rates.shift();if(rates.length>=15)return json(res,429,{error:'请求过于频繁，请稍后重试'});rates.push(Date.now());
   let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>262144)throw new AIError('BODY_TOO_LARGE','请求内容过大',413);}
   let payload;try{payload=JSON.parse(body);}catch{throw new AIError('BAD_JSON','请求格式无效',400);}
   if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new AIError('BAD_JSON','请求格式无效',400);
   return json(res,200,await runAI(payload.task,payload.input));
  }
  if(pathname.startsWith('/api/'))return json(res,404,{error:'接口不存在'});
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  const rel=pathname.startsWith('/src/')?pathname.slice(1):'public'+(pathname==='/'?'/index.html':pathname);
  let file=path.resolve(root,rel);if(!file.startsWith(root)||pathname.includes('/.')||pathname.includes('\\')){res.writeHead(403);return res.end();}
  let data;try{data=await readFile(file);}catch{if(path.extname(pathname)){res.writeHead(404);return res.end('Not found');}file=path.join(root,'public/index.html');data=await readFile(file);}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
 }catch(e){json(res,e instanceof AIError?e.status:500,{error:e instanceof AIError?e.message:'服务暂时不可用',code:e instanceof AIError?e.code:'INTERNAL_ERROR'});}
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log(`一篮 http://localhost:${Number(process.env.PORT)||4173}/preview.html`));
