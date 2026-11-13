import { createHmac, timingSafeEqual } from "node:crypto";
function readCookie(req,name){const raw=req.headers.cookie||"";const hit=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="));return hit?decodeURIComponent(hit.slice(name.length+1)):null;}
export default function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({error:"Method not allowed"});
 const secret=process.env.WORLD_SESSION_SECRET;const value=readCookie(req,"world_session");
 if(!secret||!value)return res.status(200).json({verified:false});
 const [payload,mac]=value.split(".");if(!payload||!mac)return res.status(200).json({verified:false});
 const expected=createHmac("sha256",secret).update(payload).digest("base64url");
 try{if(!timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return res.status(200).json({verified:false});const s=JSON.parse(Buffer.from(payload,"base64url").toString());if(!s.verified||s.exp<Date.now())return res.status(200).json({verified:false});return res.status(200).json({verified:true,assurance:"orb",authTime:s.authTime});}catch{return res.status(200).json({verified:false});}
}