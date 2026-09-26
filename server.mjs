import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); const rel=pathname.startsWith('/src/')?pathname.slice(1):'public'+(pathname==='/'?'/index.html':pathname);let file=path.resolve(root,rel);if(!file.startsWith(root)){res.writeHead(403);return res.end();}let data;try{data=await readFile(file);}catch{if(path.extname(pathname)){res.writeHead(404);return res.end('Not found');}file=path.join(root,'public/index.html');data=await readFile(file);}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(400);res.end('Bad request');}}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('一篮 V0 http://localhost:4173'));
