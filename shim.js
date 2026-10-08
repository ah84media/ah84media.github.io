// يوفّر واجهة claude للنسخة المكتبية: الحفظ عبر نافذة ويندوز، والذكاء الاصطناعي عبر مفتاح Anthropic API الخاص بك
(()=>{if(window.claude)return;
const key=()=>new Promise(r=>{let k=localStorage.getItem('akey');if(k)return r(k);const d=document.createElement('dialog');d.innerHTML='<p>Anthropic API key:</p><input id="k" style="width:300px"> <button>OK</button>';document.body.append(d);d.showModal();d.querySelector('button').onclick=()=>{k=d.querySelector('#k').value.trim();localStorage.setItem('akey',k);d.remove();r(k)}});
const dl={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=filename;document.body.append(a);a.click();a.remove()}};
const NATIVE=()=>window.Capacitor?.isNativePlatform?.();
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
async function sample(input,o={}){const K=await key();let msgs=typeof input=='string'?[{role:'user',content:input}]:input.map(m=>({...m}));
 if(o.images?.length){const l=msgs[msgs.length-1];l.content=[...await Promise.all(o.images.map(async b=>({type:'image',source:{type:'base64',media_type:b.type||'image/png',data:await b64(b)}}))),{type:'text',text:l.content}]}
 const tools=(o.tools||[]).map(t=>({name:t.name,description:t.description,input_schema:t.inputSchema||{type:'object',properties:{}}}));let text='';
 for(let n=0;n<25;n++){const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':K,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:4096,messages:msgs,...(tools.length?{tools}:{})})});const j=await r.json();
  if(!r.ok){if(r.status==401)localStorage.removeItem('akey');throw{code:'error',message:j.error?.message||r.status}}
  text+=j.content.filter(c=>c.type=='text').map(c=>c.text).join('');o.onText?.({text,delta:''});if(j.stop_reason!='tool_use')break;
  msgs.push({role:'assistant',content:j.content});const res=[];for(const c of j.content.filter(c=>c.type=='tool_use')){const t=(o.tools||[]).find(t=>t.name==c.name);res.push({type:'tool_result',tool_use_id:c.id,content:String(await t.execute(c.input))});}msgs.push({role:'user',content:res});text+='\n'}
 return{text,truncated:false}}
sample.limits=async()=>({images:true});
if(NATIVE())dl.save=async({filename,data})=>{const P=Capacitor.Plugins,r=await P.Filesystem.writeFile({path:filename,data:await b64(data),directory:'CACHE'});await P.Share.share({title:filename,url:r.uri,dialogTitle:filename})};
window.claude={use:async n=>n=='downloads'?dl:n=='sample'?sample:null}})();
