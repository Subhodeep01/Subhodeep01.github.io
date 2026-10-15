'use strict';
const proofs=[...document.querySelectorAll('details.proof')];
const proofToggle=document.getElementById('proof-toggle');
function syncProofToggle(){
  const allOpen=proofs.every(p=>p.open);
  proofToggle.textContent=allOpen?'Collapse proofs':'Expand all proofs';
  proofToggle.setAttribute('aria-pressed',String(allOpen));
}
proofToggle.addEventListener('click',()=>{
  const expand=!proofs.every(p=>p.open);
  proofs.forEach(p=>p.open=expand);
  syncProofToggle();
});
proofs.forEach(p=>p.addEventListener('toggle',syncProofToggle));
let printState=[];
window.addEventListener('beforeprint',()=>{printState=proofs.map(p=>p.open);proofs.forEach(p=>p.open=true);});
window.addEventListener('afterprint',()=>{proofs.forEach((p,i)=>p.open=printState[i]);syncProofToggle();});
document.getElementById('print-article').addEventListener('click',()=>window.print());
const links=[...document.querySelectorAll('.toc a')];
const sections=[...document.querySelectorAll('article h2')];
function updatePosition(){
  const total=document.documentElement.scrollHeight-window.innerHeight;
  document.querySelector('.progress').style.width=(total>0?100*window.scrollY/total:0)+'%';
  let current=sections[0];
  sections.forEach(s=>{if(s.getBoundingClientRect().top<170)current=s;});
  links.forEach(a=>{const active=a.hash==='#'+current.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
}
window.addEventListener('scroll',updatePosition,{passive:true});
window.addEventListener('resize',updatePosition);

const elements=[
  {label:'A–B',a:0,b:1,w:4,path:'M150 62 58 204',tx:83,ty:124},
  {label:'A–C',a:0,b:2,w:3,path:'M150 62 242 204',tx:218,ty:124},
  {label:'B–C',a:1,b:2,w:2,path:'M58 204 242 204',tx:150,ty:193},
  {label:'A–A · self-pair',a:0,b:0,w:-5,path:'M140 48C91 -12 207 -12 161 49',tx:150,ty:15}
];
const bounds=[[1,4],[1,2],[1,2]];
let selected=[true,true,true,false];
function metrics(mask){
  const degrees=[0,0,0];let size=0,weight=0;
  elements.forEach((e,i)=>{if(mask[i]){degrees[e.a]++;degrees[e.b]++;size++;weight+=e.w;}});
  const fair=degrees.every((d,i)=>d>=bounds[i][0]&&d<=bounds[i][1]);
  return {degrees,size,weight,fair};
}
function optimize(sizeFirst){
  let best=null;
  for(let bits=0;bits<(1<<elements.length);bits++){
    const mask=elements.map((_,i)=>Boolean(bits&(1<<i)));
    const m=metrics(mask);if(!m.fair)continue;
    if(!best||(sizeFirst?(m.size>best.m.size||(m.size===best.m.size&&m.weight>best.m.weight)):m.weight>best.m.weight))best={mask,m};
  }
  selected=best.mask;renderSelection();
}
const lab=document.getElementById('selection-lab');
lab.className='lab';
lab.innerHTML='<span class="eyebrow">An example you can explore</span><h3>Try making a fair selection</h3><p class="lab-intro">Select or remove an element. Every group needs at least one contribution. The loop at A contributes two and has negative weight.</p><div class="lab-grid"><svg viewBox="0 0 300 267" role="img" aria-label="Three groups with three ordinary elements and one self-pair at A"><g id="lab-edges"></g><g id="lab-nodes"></g></svg><div class="lab-actions">'+elements.map((e,i)=>'<button class="edge-choice" data-edge="'+i+'" aria-pressed="false" aria-label="Select '+e.label+'"><span>'+e.label+'</span><span>weight '+e.w+'</span></button>').join('')+'</div></div><div class="lab-stats" aria-live="polite" aria-atomic="true"><span id="lab-state" class="lab-status"></span><span id="lab-size"></span><span id="lab-weight"></span><span id="lab-degrees"></span></div><div class="lab-buttons"><button id="best-weight">Find maximum weight</button><button id="best-size">Find largest set</button><button id="reset-example">Reset example</button></div><p class="lab-caption">Illustrative instance: A allows 1–4 ends; B and C allow 1–2 each. Maximum weight gives three elements and weight 9. Maximum size includes the negative loop: four elements and weight 4. This tiny example checks all 16 subsets; the general algorithm below uses matching.</p>';
lab.querySelectorAll('[data-edge]').forEach(button=>button.addEventListener('click',()=>{const i=Number(button.dataset.edge);selected[i]=!selected[i];renderSelection();}));
document.getElementById('best-weight').addEventListener('click',()=>optimize(false));
document.getElementById('best-size').addEventListener('click',()=>optimize(true));
document.getElementById('reset-example').addEventListener('click',()=>{selected=[true,true,true,false];renderSelection();});
function renderSelection(){
  const m=metrics(selected);
  document.getElementById('lab-edges').innerHTML=elements.map((e,i)=>'<path d="'+e.path+'" fill="none" stroke="'+(selected[i]?'#325e50':'#aebca6')+'" stroke-width="'+(selected[i]?3:1.5)+'" '+(!selected[i]?'stroke-dasharray="4 5"':'')+'/>'+'<text x="'+e.tx+'" y="'+e.ty+'" text-anchor="middle" fill="#68716a" font-size="12">'+e.w+'</text>').join('');
  const positions=[[150,62],[58,204],[242,204]];
  document.getElementById('lab-nodes').innerHTML=positions.map(([x,y],i)=>'<circle cx="'+x+'" cy="'+y+'" r="21" fill="#faf8f3" stroke="'+(m.degrees[i]<bounds[i][0]||m.degrees[i]>bounds[i][1]?'#a74335':'#325e50')+'" stroke-width="2"/><text x="'+x+'" y="'+(y+5)+'" text-anchor="middle" fill="#24312e" font-size="16">'+['A','B','C'][i]+'</text><text x="'+x+'" y="'+(y+39)+'" text-anchor="middle" fill="#68716a" font-size="11">'+m.degrees[i]+' / '+bounds[i][0]+'–'+bounds[i][1]+'</text>').join('');
  lab.querySelectorAll('[data-edge]').forEach((b,i)=>b.setAttribute('aria-pressed',String(selected[i])));
  const status=document.getElementById('lab-state');status.textContent=m.fair?'Fair selection':'Bounds not met';status.classList.toggle('fair',m.fair);
  document.getElementById('lab-size').textContent='Elements: '+m.size;
  document.getElementById('lab-weight').textContent='Weight: '+m.weight;
  document.getElementById('lab-degrees').textContent='Total ends: '+m.degrees.reduce((a,b)=>a+b,0)+' = 2 × '+m.size;
}
renderSelection();
const gadget=document.getElementById('gadget-figure');
const internals=[90,145,200],externals=[55,100,145,190,235];
gadget.outerHTML='<figure class="gadget"><span class="eyebrow">Inside one group gadget</span><svg viewBox="0 0 590 315" role="img" aria-labelledby="gadget-title gadget-desc"><title id="gadget-title">Three internal nodes absorb three of five external nodes</title><desc id="gadget-desc">All internal nodes connect to all external nodes. A perfect matching uses three filler edges and two twin edges. Twin endpoints on the right belong to the rest of the graph.</desc><rect x="31" y="24" width="311" height="244" rx="16" fill="#f9f8f2" stroke="#ccd6c6"/>'+internals.map(y=>externals.map(z=>'<path d="M94 '+y+' 278 '+z+'" stroke="#ccd6c6" stroke-width="1" fill="none"/>').join('')).join('')+'<g stroke="#325e50" stroke-width="3"><path d="M94 90 278 145M94 145 278 190M94 200 278 235"/></g><g stroke="#a74335" stroke-width="3"><path d="M278 55 465 55M278 100 465 100"/></g>'+internals.map(y=>'<circle cx="94" cy="'+y+'" r="9" fill="#325e50"/>').join('')+externals.map(y=>'<circle cx="278" cy="'+y+'" r="9" fill="#faf8f3" stroke="#325e50" stroke-width="2"/>').join('')+'<circle cx="465" cy="55" r="9" fill="#faf8f3" stroke="#a74335" stroke-width="2"/><circle cx="465" cy="100" r="9" fill="#faf8f3" stroke="#a74335" stroke-width="2"/><g font-size="12" fill="#68716a" text-anchor="middle"><text x="94" y="291">3 internal nodes</text><text x="278" y="291">5 external nodes</text><text x="466" y="148">2 selected ends</text><text x="466" y="171" fill="#a74335">twin edges</text><text x="175" y="248" fill="#325e50">filler edges</text></g></svg><figcaption>An illustrative gadget with d₁(v) = 5 and u′ᵥ = 2. Three internals absorb three externals; two externals remain for twin edges. Thin lines show all available fillers. Thick lines show the selected matching. The two right-hand nodes represent endpoints elsewhere in the graph.</figcaption></figure>';
updatePosition();
