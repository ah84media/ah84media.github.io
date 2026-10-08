// نسخة مجانية بالكامل بلا مفاتيح: OCR محلي (Tesseract.js) + نموذج لغوي مجاني (Pollinations) + حفظ عبر المتصفح
(()=>{if(window.claude)return;
const NATIVE=()=>window.Capacitor?.isNativePlatform?.();
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
const dl={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=filename;document.body.append(a);a.click();a.remove()}};
if(NATIVE())dl.save=async({filename,data})=>{const P=Capacitor.Plugins,r=await P.Filesystem.writeFile({path:filename,data:await b64(data),directory:'CACHE'});await P.Share.share({title:filename,url:r.uri,dialogTitle:filename})};
let TS;const loadTS=()=>TS||(TS=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=res;s.onerror=()=>{TS=null;rej({code:'error',message:'Could not load the OCR engine (check your internet connection).'})};document.head.append(s)}));
async function ocr(blob){await loadTS();const w=await Tesseract.createWorker(localStorage.getItem('ocrlang')||'ara+deu+eng');try{return(await w.recognize(blob)).data.text.trim()}finally{await w.terminate()}}
const U='https://text.pollinations.ai/',post=async(u,b)=>{const r=await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}),t=await r.text();if(!r.ok)throw Error(r.status+' '+t.slice(0,80));return t};
async function chatNative(msgs,tools){if(BAD)throw Error('offline');const t=await post(U+'openai',{model:'openai',messages:msgs,tools});const j=JSON.parse(t);if(!j.choices)throw Error('bad response');return j.choices[0].message}
let BAD=0,ENG,CUR;
async function local(msgs){if(!navigator.gpu)throw{code:'error',message:'The free online AI is down and this browser has no WebGPU for the local model. Use Chrome or Edge on a desktop computer.'};
 ENG??=(async()=>{const W=await import('https://esm.run/@mlc-ai/web-llm'),cb=p=>CUR?.onText?.({text:'⬇ Downloading the local AI model (first time only) '+Math.round((p.progress||0)*100)+'%'});try{return await W.CreateMLCEngine('Qwen2.5-3B-Instruct-q4f16_1-MLC',{initProgressCallback:cb})}catch(e){return await W.CreateMLCEngine('Qwen2.5-1.5B-Instruct-q4f16_1-MLC',{initProgressCallback:cb})}})();
 let e;try{e=await ENG}catch(x){ENG=null;throw{code:'error',message:'Could not load the local AI model: '+(x?.message||x)}}
 CUR?.onText?.({text:'…'});const r=await e.chat.completions.create({messages:msgs,temperature:.3,max_tokens:2048});return r.choices[0].message.content||''}
async function plain(msgs){if(!BAD){
 try{const j=JSON.parse(await post(U+'openai',{model:'openai',messages:msgs}));if(j.choices)return j.choices[0].message.content||''}catch(e){}
 try{return await post(U,{model:'openai',messages:msgs})}catch(e){}
 try{const q=msgs.map(m=>m.role+': '+m.content).join('\n').slice(-5500),r=await fetch(U+encodeURIComponent(q)+'?model=openai');if(r.ok)return await r.text()}catch(e){}
 BAD=1}return local(msgs)}
const jx=t=>{const a=t.indexOf('{'),b=t.lastIndexOf('}');if(a<0||b<a)return null;try{return JSON.parse(t.slice(a,b+1))}catch{return null}};
async function sample(input,o={}){CUR=o;
 if(o.images?.length){const t=await ocr(o.images[0]);o.onText?.({text:t});return{text:t,truncated:false}}
 const msgs=typeof input=='string'?[{role:'user',content:input}]:input.map(m=>({role:m.role,content:m.content})),T=o.tools||[],tools=T.map(t=>({type:'function',function:{name:t.name,description:t.description,parameters:t.inputSchema||{type:'object',properties:{}}}}));let text='',native=T.length>0;
 const sys=T.length?{role:'system',content:'You control a PDF editor through tools. To call a tool reply ONLY with JSON: {"tool":"NAME","args":{...}}. After the tool result, continue; when finished reply with a short plain-text answer (no JSON). Tools:\n'+T.map(t=>t.name+': '+t.description+' args '+JSON.stringify(t.inputSchema?.properties||{})).join('\n')}:null;
 for(let n=0;n<15;n++){let m;
  if(native){try{m=await chatNative(msgs,tools)}catch(e){native=false}}
  if(!native){const out=await plain(sys?[sys,...msgs]:msgs),j=sys&&jx(out);m=j?.tool?{content:'',raw:out,tool_calls:[{id:'t'+n,function:{name:j.tool,arguments:JSON.stringify(j.args||{})}}]}:{content:out}}
  if(m.content){text+=(text?'\n':'')+m.content;o.onText?.({text})}if(!m.tool_calls?.length)break;
  if(native)msgs.push({role:'assistant',content:m.content||'',tool_calls:m.tool_calls});else msgs.push({role:'assistant',content:m.raw});
  for(const c of m.tool_calls){const t=T.find(x=>x.name==c.function.name);let a={};try{a=JSON.parse(c.function.arguments||'{}')}catch{}let r;try{r=String(t?await t.execute(a):'unknown tool')}catch(e){r='error: '+e.message}
   if(native)msgs.push({role:'tool',tool_call_id:c.id,content:r});else msgs.push({role:'user',content:'Tool result ('+c.function.name+'): '+r})}}
 return{text:text||'(no answer)',truncated:false}}
sample.limits=async()=>({images:true});
window.claude={use:async n=>n=='downloads'?dl:n=='sample'?sample:null}})();
