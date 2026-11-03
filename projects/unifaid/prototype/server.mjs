import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = join(ROOT, "public");
const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const MAX_BODY = 256 * 1024;
const providers = ["openai", "anthropic", "gemini", "mistral"];
const envKeys = {openai:"OPENAI_API_KEY",anthropic:"ANTHROPIC_API_KEY",gemini:"GEMINI_API_KEY",mistral:"MISTRAL_API_KEY"};
const envModels = {openai:"OPENAI_MODEL",anthropic:"ANTHROPIC_MODEL",gemini:"GEMINI_MODEL",mistral:"MISTRAL_MODEL"};
function json(res,status,body){res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(body));}
async function readBody(req){let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>MAX_BODY)throw new Error("Request too large");}return JSON.parse(raw||"{}");}
function config(){const configured=providers.filter(id=>Boolean(process.env[envKeys[id]])).length;const mode=configured===0?"mock":configured===providers.length?"live":"hybrid";return {protocol:"unifaid/0.1",mode,providers:providers.map(id=>({id,configured:Boolean(process.env[envKeys[id]]),model:process.env[envModels[id]]||null}))};}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function mockReply(provider,messages){await sleep(300+Math.random()*400);const last=messages.filter(m=>m.role==="user").at(-1)?.content||"";return {provider,model:"unifaid-demo-mock",text:"[DEMO RESPONSE — "+provider.toUpperCase()+" MOCK]\n\nI received your message: “"+last.slice(0,700)+"”\n\nThis is simulated. Configure this provider's official API key to receive a live model response."};}
function historyFor(messages){return messages.filter(m=>["user","assistant","system"].includes(m.role)).map(m=>({role:m.role,content:m.content}));}
async function callProvider(provider,messages){
 const cfg={key:process.env[envKeys[provider]],model:process.env[envModels[provider]]||({openai:"gpt-4.1-mini",anthropic:"claude-3-5-haiku-latest",gemini:"gemini-2.5-flash",mistral:"mistral-small-latest"})[provider]};
 if(!cfg.key)return mockReply(provider,messages);
 const history=historyFor(messages);let response,data,text;
 if(provider==="openai"||provider==="mistral"){
  const endpoint=provider==="openai"?"https://api.openai.com/v1/chat/completions":"https://api.mistral.ai/v1/chat/completions";
  response=await fetch(endpoint,{method:"POST",headers:{authorization:"Bearer "+cfg.key,"content-type":"application/json"},body:JSON.stringify({model:cfg.model,messages:history,temperature:0.7})});
  data=await response.json();if(!response.ok)throw new Error(data.error?.message||"HTTP "+response.status);text=data.choices?.[0]?.message?.content||"(No text returned)";
 }else if(provider==="anthropic"){
  const system=history.filter(m=>m.role==="system").map(m=>m.content).join("\n");
  response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":cfg.key,"anthropic-version":"2023-06-01","content-type":"application/json"},body:JSON.stringify({model:cfg.model,max_tokens:1200,...(system?{system}:{}),messages:history.filter(m=>m.role!=="system")})});
  data=await response.json();if(!response.ok)throw new Error(data.error?.message||"HTTP "+response.status);text=(data.content||[]).filter(p=>p.type==="text").map(p=>p.text).join("\n");
 }else{
  const prompt=history.map(m=>m.role.toUpperCase()+": "+m.content).join("\n\n");
  response=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+encodeURIComponent(cfg.model)+":generateContent?key="+encodeURIComponent(cfg.key),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}]})});
  data=await response.json();if(!response.ok)throw new Error(data.error?.message||"HTTP "+response.status);text=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||"").join("\n");
 }
 return {provider,model:cfg.model,text};
}
async function route(req,res){
 const url=new URL(req.url,"http://localhost");
 if(req.method==="GET"&&url.pathname==="/api/config")return json(res,200,config());
 if(req.method==="POST"&&url.pathname==="/api/chat"){
  try{
   const body=await readBody(req);
   if(body.consent!==true)return json(res,400,{error:"Explicit consent is required before sending content to providers."});
   if(!Array.isArray(body.providers)||!body.providers.length||body.providers.some(p=>!providers.includes(p)))return json(res,400,{error:"Choose at least one supported provider."});
   if(!Array.isArray(body.messages)||!body.messages.length||body.messages.length>40)return json(res,400,{error:"Provide between 1 and 40 messages."});
   if(body.messages.some(m=>!["user","assistant","system"].includes(m.role)||typeof m.content!=="string"||m.content.length>12000))return json(res,400,{error:"Invalid message format or message too long."});
   const results=await Promise.all(body.providers.map(async provider=>{try{return await callProvider(provider,body.messages);}catch(error){return {provider,error:error.message||"Provider request failed"};}}));
   return json(res,200,{protocol:"unifaid/0.1",created_at:new Date().toISOString(),results});
  }catch(error){return json(res,error.message==="Request too large"?413:400,{error:error.message||"Invalid request"});}
 }
 if(req.method==="GET"){
  const requested=normalize(decodeURIComponent(url.pathname)).replace(/^([.][.][/\\])+/, "");
  const path=requested==="/"?"index.html":requested.replace(/^[/\\]/,"");
  try{const file=await readFile(join(PUBLIC,path));const type={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"}[extname(path)]||"application/octet-stream";res.writeHead(200,{"content-type":type,"x-content-type-options":"nosniff"});return res.end(file);}catch{return json(res,404,{error:"Not found"});}
 }
 return json(res,405,{error:"Method not allowed"});
}
http.createServer((req,res)=>{route(req,res).catch(()=>json(res,500,{error:"Internal server error"}));}).listen(PORT,HOST,()=>console.log("UNIFAID prototype running at http://"+HOST+":"+PORT));
