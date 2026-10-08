// نسخة مجانية بالكامل بلا مفاتيح: OCR محلي (Tesseract.js) + نموذج لغوي مجاني (Pollinations) + حفظ عبر المتصفح
(()=>{if(window.claude)return;
const NATIVE=()=>window.Capacitor?.isNativePlatform?.();
const b64=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result.split(',')[1]);f.readAsDataURL(b)});
const dl={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=filename;document.body.append(a);a.click();a.remove()}};
if(NATIVE())dl.save=async({filename,data})=>{const P=Capacitor.Plugins,r=await P.Filesystem.writeFile({path:filename,data:await b64(data),directory:'CACHE'});await P.Share.share({title:filename,url:r.uri,dialogTitle:filename})};
let TS;const loadTS=()=>TS||(TS=new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=res;s.onerror=()=>{TS=null;rej({code:'error',message:'Could not load the OCR engine (check your internet connection).'})};document.head.append(s)}));
async function ocr(blob){await loadTS();const w=await Tesseract.createWorker(localStorage.getItem('ocrlang')||'ara+deu+eng');try{return(await w.recognize(blob)).data.text.trim()}finally{await w.terminate()}}
async function chat(msgs,tools){const r=await fetch('https://text.pollinations.ai/openai',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({model:'openai',messages:msgs,...(tools.length?{tools}:{})})});let j=null;try{j=await r.json()}catch{}
 if(!r.ok||!j?.choices)throw{code:'error',message:'The free AI service is unavailable right now ('+r.status+'). Try again in a moment.'};return j.choices[0].message}
async function sample(input,o={}){
 if(o.images?.length){const t=await ocr(o.images[0]);o.onText?.({text:t});return{text:t,truncated:false}}
 const msgs=typeof input=='string'?[{role:'user',content:input}]:input.map(m=>({role:m.role,content:m.content})),T=o.tools||[],tools=T.map(t=>({type:'function',function:{name:t.name,description:t.description,parameters:t.inputSchema||{type:'object',properties:{}}}}));let text='';
 for(let n=0;n<15;n++){const m=await chat(msgs,tools);if(m.content){text+=(text?'\n':'')+m.content;o.onText?.({text})}if(!m.tool_calls?.length)break;
  msgs.push({role:'assistant',content:m.content||'',tool_calls:m.tool_calls});
  for(const c of m.tool_calls){const t=T.find(x=>x.name==c.function.name);let a={};try{a=JSON.parse(c.function.arguments||'{}')}catch{}msgs.push({role:'tool',tool_call_id:c.id,content:String(t?await t.execute(a):'unknown tool')})}}
 return{text:text||'(no answer)',truncated:false}}
sample.limits=async()=>({images:true});
window.claude={use:async n=>n=='downloads'?dl:n=='sample'?sample:null}})();
