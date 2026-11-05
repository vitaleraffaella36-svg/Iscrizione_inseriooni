const products=[{id:'zaino',name:'Zaino Inseriooni',price:10,desc:'Patch ufficiale',image:'assets/zaino.webp'},{id:'cappello',name:'Cappello Inseriooni',price:5,desc:'Berretto nero',image:'assets/cappello.webp'},{id:'felpa',name:'Felpa Inseriooni',price:20,desc:'Logo fronte e stampa retro',image:'assets/felpa.webp',size:true},{id:'giubbotto',name:'Giubbotto Inseriooni',price:30,desc:'Logo sul petto',image:'assets/giubbotto.webp',size:true},{id:'sciarpa',name:'Sciarpa Inseriooni',price:15,desc:'Grafica ufficiale',image:'assets/sciarpa.webp'}];const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);const form=document.querySelector('#enrollment');const panels=[...document.querySelectorAll('.panel')];const steps=[...document.querySelectorAll('.step')];let current=0;const grid=document.querySelector('#merch-grid');grid.innerHTML=products.map(p=>`<article class="merch-card"><div class="merch-picture"><img src="${p.image}" alt="${p.name}" loading="lazy"></div><div class="merch-info"><div class="merch-name"><span>${p.name}</span><span class="merch-price">${euro(p.price)}</span></div><div class="merch-desc">${p.desc}</div><div class="merch-options"><div><label for="qty-${p.id}">Quantità</label><select name="quantita_${p.id}" id="qty-${p.id}">${[0,1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></div>${p.size?`<div><label for="size-${p.id}">Taglia <b class="size-required" id="required-${p.id}" hidden>*</b></label><select name="taglia_${p.id}" id="size-${p.id}"><option value="">Seleziona</option>${['XS','S','M','L','XL','XXL'].map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div>`:''}</div></div></article>`).join('');function cart(){return products.map(p=>({ ...p,qty:+document.querySelector('#qty-'+p.id).value,size:p.size?document.querySelector('#size-'+p.id).value:''})).filter(p=>p.qty>0)}function refresh(){const c=cart(),sum=20+c.reduce((t,p)=>t+p.qty*p.price,0);document.querySelector('#side-total').textContent=euro(sum);document.querySelector('#side-merch').innerHTML=c.map(p=>`<div class="mini-cost"><span>${p.qty}× ${p.name}${p.size?' ('+ (p.size||'taglia?') +')':''}</span><strong>${euro(p.qty*p.price)}</strong></div>`).join('');document.querySelector('#total-input').value=sum;document.querySelector('#merch-details').value=c.length?c.map(p=>`${p.name}: ${p.qty} × €${p.price}${p.size?'; taglia '+p.size:''}`).join(' | '):'Nessuno';document.querySelector('#summary').innerHTML=`<div class="summary-line"><span>Team selezionato</span><strong>${document.querySelector('#team').value || '—'}</strong></div><div class="summary-line"><span>Quota iscrizione — 1 persona</span><strong>${euro(20)}</strong></div>${c.map(p=>`<div class="summary-line"><span>${p.qty} × ${p.name}${p.size?' · '+p.size:''}</span><strong>${euro(p.qty*p.price)}</strong></div>`).join('')}<div class="summary-line total"><span>TOTALE DA PAGARE</span><strong>${euro(sum)}</strong></div>`}function syncSizeRequirements(){for(const p of products.filter(item=>item.size)){const qty=document.querySelector('#qty-'+p.id),size=document.querySelector('#size-'+p.id),mark=document.querySelector('#required-'+p.id),selected=+qty.value>0;size.required=selected;size.disabled=!selected;mark.hidden=!selected;size.setCustomValidity('');}}grid.addEventListener('change',()=>{syncSizeRequirements();refresh()});syncSizeRequirements();refresh();const allergy=form.querySelector('[name="allergie_intolleranze"]'),healthConsent=document.querySelector('#health-consent'),healthConsentWrap=document.querySelector('#health-consent-wrap');allergy.addEventListener('input',()=>{const needed=allergy.value.trim().length>0;healthConsentWrap.hidden=!needed;healthConsent.required=needed;if(!needed)healthConsent.checked=false});const age=document.querySelector('#age'),minor=document.querySelector('#minor'),signed=document.querySelector('#signed-file');age.addEventListener('input',()=>{const under=age.value!==''&&+age.value<18;minor.hidden=!under;signed.required=under;if(!under)signed.value=''});document.querySelectorAll('input[name="esperienza"]').forEach(i=>i.addEventListener('change',()=>{const other=document.querySelector('input[name="esperienza"]:checked')?.value==='Sì, con un\'altra squadra';document.querySelector('#former-team-wrap').hidden=!other;document.querySelector('#former-team').required=other;if(!other)document.querySelector('#former-team').value=''}));function checkStep(){let elems=[...panels[current].querySelectorAll('input,textarea,select')].filter(el=>el.willValidate&&!el.disabled);for(const el of elems){if(!el.checkValidity()){el.reportValidity();return false}}if(current===0&&!minor.hidden&&signed.files[0]?.size>8*1024*1024){alert('Il file deve essere inferiore a 8 MB.');return false}if(current===2){syncSizeRequirements();for(const p of cart()){if(p.size&&!p.size.length){const el=document.querySelector('#size-'+p.id);el.setCustomValidity('Seleziona una taglia per '+p.name);el.reportValidity();el.setCustomValidity('');return false}}}return true}function show(n){current=n;panels.forEach((p,i)=>p.classList.toggle('active',i===n));steps.forEach((s,i)=>{s.classList.toggle('active',i===n);s.classList.toggle('done',i<n);s.setAttribute('aria-current',i===n?'step':'false')});document.querySelector('#prev').hidden=n===0;document.querySelector('#next').hidden=n===3;document.querySelector('#submit').hidden=n!==3;refresh();document.querySelector('#dossier').scrollIntoView({behavior:'smooth',block:'start'})}document.querySelector('#next').onclick=()=>{if(checkStep())show(Math.min(3,current+1))};document.querySelector('#prev').onclick=()=>show(current-1);steps.forEach((s,i)=>s.onclick=()=>{if(i<=current)show(i);else{for(let j=current;j<i;j++){const old=current;current=j;if(!checkStep()){current=old;show(j);return}}show(i)}});document.querySelector('#start').onclick=()=>document.querySelector('#dossier').scrollIntoView({behavior:'smooth'});const pay=document.querySelector('#payment-detail'),iban='IT59O3608105138283897583910';document.querySelectorAll('input[name="metodo_pagamento"]').forEach(el=>el.addEventListener('change',()=>{const v=el.value;if(v==='Bonifico bancario')pay.innerHTML=`<strong>Bonifico a Raffaella Vitale</strong><div>IBAN: <code>${iban}</code> <button type="button" id="copy-iban">COPIA</button></div><div>Causale suggerita: INSERIOONI 2026 + nome e cognome</div>`;if(v==='PayPal')pay.innerHTML='<strong>Pagamento con PayPal</strong><div><a href="https://www.paypal.me/Inseriooni" target="_blank" rel="noopener noreferrer">Apri paypal.me/Inseriooni ↗</a></div><div>Inserisci manualmente il totale indicato nel riepilogo.</div>';if(v==='Revolut')pay.innerHTML='<strong>Pagamento con Revolut</strong><div><a href="https://revolut.me/raffaellavita" target="_blank" rel="noopener noreferrer">Apri revolut.me/raffaellavita ↗</a></div><div>Inserisci manualmente il totale indicato nel riepilogo.</div>';if(v==='Contanti')pay.innerHTML='<strong>Pagamento in contanti</strong><div>Consegna il totale indicato nel riepilogo direttamente agli organizzatori.</div><div>Concorda con loro il momento della consegna. Il modulo non registra l’avvenuto pagamento.</div>';document.querySelector('#copy-iban')?.addEventListener('click',()=>navigator.clipboard.writeText(iban).then(()=>alert('IBAN copiato'))) }));// Google Apps Script: invio tramite iframe nascosto per compatibilità con il redirect di Apps Script.
// Il browser non invia dati se la connessione a Google Sheets non è configurata.
const scriptUrl=String(window.INSERIOONI_SCRIPT_URL||'').trim();
let waitingToken=null;
let submitTimeout=null;
let postFrame=null;
const submitButton=document.querySelector('#submit');
const sendNote=document.querySelector('#mode-note');
if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl)){
  sendNote.textContent='COLLEGAMENTO DA ATTIVARE: gli organizzatori devono configurare Google Sheets prima di ricevere iscrizioni. Nessun dato viene inviato in questa anteprima.';
  sendNote.style.color='#f29a38';
}
function field(name){return form.elements.namedItem(name)}
function selectedValue(name){return form.querySelector(`[name="${name}"]:checked`)?.value||''}
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Impossibile leggere il file.'));reader.readAsDataURL(file)})}
function resetSending(){submitButton.disabled=false;submitButton.textContent='INVIA IL DOSSIER ↗';if(submitTimeout)clearTimeout(submitTimeout);submitTimeout=null}
window.addEventListener('message',ev=>{
  if(!waitingToken||!postFrame||ev.source!==postFrame.contentWindow)return;
  const d=ev.data;
  if(!d||d.type!=='INSERIOONI_RESULT'||d.request_id!==waitingToken)return;
  waitingToken=null;resetSending();
  if(d.status==='ok'){
    sessionStorage.setItem('inseriooni_last_id',String(d.id||''));
    location.href='success.html';
  } else {alert('Non siamo riusciti a registrare l’iscrizione. Riprova oppure contatta gli organizzatori.');}
});
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(waitingToken)return;
  syncSizeRequirements();
  const old=current;
  for(let i=0;i<panels.length;i++){
    current=i;
    if(!checkStep()){show(i);return;}
  }
  current=old;refresh();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl)){
    alert('Google Sheets non è ancora collegato. Nessuna iscrizione è stata registrata. Consulta la guida di configurazione.');return;
  }
  const attachment=signed.files?.[0];
  if(attachment&&attachment.size>8*1024*1024){show(0);alert('Il file deve essere inferiore a 8 MB.');return}
  const allowed={'application/pdf':true,'image/jpeg':true,'image/png':true};
  if(attachment&&!allowed[attachment.type]){show(0);alert('Il documento deve essere PDF, JPG o PNG.');return}
  submitButton.disabled=true;submitButton.textContent='REGISTRAZIONE IN CORSO...';
  try{
    const p={
      nome:field('nome').value,cognome:field('cognome').value,eta:field('eta').value,
      telefono:field('telefono').value,email:field('email').value,team:field('team').value,
      esperienza:selectedValue('esperienza'),ex_squadra:field('ex_squadra').value,
      disponibilita:field('disponibilita').value,allergie_intolleranze:field('allergie_intolleranze').value,
      consenso_esplicito_dati_salute:healthConsent.checked,
      quantita:Object.fromEntries(products.map(x=>[x.id,Number(field('quantita_'+x.id).value)])),
      taglia:{felpa:field('taglia_felpa').value,giubbotto:field('taglia_giubbotto').value},
      metodo_pagamento:selectedValue('metodo_pagamento'),
      accettazione_informativa:field('accettazione_informativa').checked,
      presa_visione_pagamento:field('presa_visione_pagamento').checked
    };
    if(attachment)p.autorizzazione={mime:attachment.type,base64:await fileToBase64(attachment)};
    const requestId=(crypto.randomUUID?crypto.randomUUID():'ins-'+Date.now()+'-'+Math.random().toString(36).slice(2));
    if(postFrame)postFrame.remove();
    postFrame=document.createElement('iframe');postFrame.name='inseriooni_result_frame';postFrame.title='Risposta invio iscrizione';postFrame.style.display='none';document.body.append(postFrame);
    const sender=document.createElement('form');sender.style.display='none';sender.method='POST';sender.action=scriptUrl;sender.target=postFrame.name;sender.enctype='application/x-www-form-urlencoded';
    for(const [key,value] of Object.entries({payload:JSON.stringify(p),request_id:requestId})){
      const i=document.createElement('input');i.type='hidden';i.name=key;i.value=value;sender.append(i);
    }
    document.body.append(sender);waitingToken=requestId;sender.submit();sender.remove();
    submitTimeout=setTimeout(()=>{if(waitingToken===requestId){waitingToken=null;resetSending();alert('Non è arrivata una conferma dal foglio Google. Prima di riprovare verifica con gli organizzatori che l’iscrizione non sia già stata registrata.')}},60000);
  }catch(error){waitingToken=null;resetSending();alert('Impossibile preparare l’invio. Controlla il documento allegato e riprova.');}
});
