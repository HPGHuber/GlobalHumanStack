import { createHmac, timingSafeEqual, createPublicKey, verify as verifySignature } from "node:crypto";
const b64 = v => Buffer.from(v).toString("base64url");
const sign = (v,s) => createHmac("sha256",s).update(v).digest("base64url");
function readCookie(req,name){const raw=req.headers.cookie||"";const hit=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));return hit?decodeURIComponent(hit.slice(name.length+1)):null;}
function verifyCookie(value,secret){if(!value)return null;const [payload,mac]=value.split(".");if(!payload||!mac)return null;const expected=sign(payload,secret);try{if(!timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return null;const data=JSON.parse(Buffer.from(payload,"base64url").toString());return data.exp>Date.now()?data:null;}catch{return null;}}
function decodeJwt(token){const p=token.split(".");if(p.length!==3)throw new Error("Invalid ID token");return {header:JSON.parse(Buffer.from(p[0],"base64url").toString()),claims:JSON.parse(Buffer.from(p[1],"base64url").toString()),signature:Buffer.from(p[2],"base64url"),input:p[0]+"."+p[1]};}
export default async function handler(req,res){
 const secret=process.env.WORLD_SESSION_SECRET;const tx=verifyCookie(readCookie(req,"world_tx"),secret||"");
 const clear="world_tx=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
 if(!tx||!req.query.code||req.query.state!==tx.state){res.setHeader("Set-Cookie",clear);return res.redirect(302,"/?error=invalid_or_expired_login");}
 try{
  const issuer=process.env.WORLD_ISSUER||"https://auth.world.org";
  const d=await fetch(issuer+"/.well-known/openid-configuration").then(r=>r.json());
  const body=new URLSearchParams({grant_type:"authorization_code",code:String(req.query.code),redirect_uri:process.env.WORLD_REDIRECT_URI,client_id:process.env.WORLD_CLIENT_ID,code_verifier:tx.verifier});
  const headers={"Content-Type":"application/x-www-form-urlencoded"};
  if((process.env.WORLD_CLIENT_AUTH_METHOD||"client_secret_basic")==="client_secret_post"){body.set("client_secret",process.env.WORLD_CLIENT_SECRET);}else{headers.Authorization="Basic "+Buffer.from(process.env.WORLD_CLIENT_ID+":"+process.env.WORLD_CLIENT_SECRET).toString("base64");}
  const tokenRes=await fetch(d.token_endpoint,{method:"POST",headers,body});if(!tokenRes.ok)throw new Error("Token exchange failed");
  const tokens=await tokenRes.json();const parsed=decodeJwt(tokens.id_token);const {header,claims,input,signature}=parsed;
  if(header.alg!=="RS256"||!header.kid)throw new Error("Unsupported ID token signature");
  const jwks=await fetch(d.jwks_uri).then(r=>r.json());const jwk=jwks.keys.find(k=>k.kid===header.kid);if(!jwk)throw new Error("Signing key not found");
  const key=createPublicKey({key:jwk,format:"jwk"});if(!verifySignature("RSA-SHA256",Buffer.from(input),key,signature))throw new Error("Invalid ID token signature");
  const audience=Array.isArray(claims.aud)?claims.aud:[claims.aud];
  if(claims.iss!==issuer||!audience.includes(process.env.WORLD_CLIENT_ID)||claims.exp*1000<Date.now()||claims.nonce!==tx.nonce)throw new Error("ID token validation failed");
  if(audience.length>1&&claims.azp!==process.env.WORLD_CLIENT_ID)throw new Error("Invalid authorized party");
  if(claims.acr!=="https://world.org/oidc/acr/orb")throw new Error("Orb-level World ID credential required");
  const sessionPayload=b64(JSON.stringify({verified:true,acr:claims.acr,authTime:claims.auth_time||null,exp:Date.now()+8*60*60*1000}));
  const session=sessionPayload+"."+sign(sessionPayload,secret);
  res.setHeader("Set-Cookie",[clear,"world_session="+session+"; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=28800"]);
  return res.redirect(302,"/?world=verified");
 }catch(e){res.setHeader("Set-Cookie",clear);return res.redirect(302,"/?error=authentication_failed");}
}