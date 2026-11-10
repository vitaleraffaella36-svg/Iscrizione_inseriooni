const products=[{id:'zaino',name:'Zaino Inseriooni',price:15,desc:'Patch ufficiale',image:'assets/zaino.webp'},{id:'cappello',name:'Cappello Inseriooni',price:5,desc:'Berretto nero',image:'assets/cappello.webp'},{id:'felpa',name:'Felpa Inseriooni',price:20,desc:'Logo fronte e stampa retro',image:'assets/felpa.webp',size:true},{id:'giubbotto',name:'Giubbotto Inseriooni',price:30,desc:'Logo sul petto',image:'assets/giubbotto.webp',size:true},{id:'sciarpa',name:'Sciarpa Inseriooni',price:15,desc:'Grafica ufficiale',image:'assets/sciarpa.webp'},{id:'combo',name:'Combo zaino + sciarpa',price:25,desc:'Risparmi 5 € rispetto ai prodotti singoli',image:'assets/zaino.webp',secondImage:'assets/sciarpa.webp'}];const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);const form=document.querySelector('#enrollment');const panels=[...document.querySelectorAll('.panel')];const steps=[...document.querySelectorAll('.step')];let current=0;const grid=document.querySelector('#merch-grid');grid.innerHTML=products.map(p=>`<article class="merch-card"><div class="merch-picture"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.secondImage?`<img src="${p.secondImage}" alt="Sciarpa inclusa nella combo" loading="lazy" class="combo-second-image">`:``}</div><div class="merch-info"><div class="merch-name"><span>${p.name}</span><span class="merch-price">${euro(p.price)}</span></div><div class="merch-desc">${p.desc}</div><div class="merch-options"><div><label for="qty-${p.id}">Quantità</label><select name="quantita_${p.id}" id="qty-${p.id}">${[0,1,2,3,4,5].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></div>${p.size?`<div><label for="size-${p.id}">Taglia <b class="size-required" id="required-${p.id}" hidden>*</b></label><select name="taglia_${p.id}" id="size-${p.id}"><option value="">Seleziona</option>${['XS','S','M','L','XL','XXL'].map(s=>`<option value="${s}">${s}</option>`).join('')}</select></div>`:''}</div></div></article>`).join('');const merchIsOpen=()=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const d=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${d.year}-${d.month}-${d.day}`<='2026-12-01'};function enforceMerchDeadline(){if(merchIsOpen())return;products.forEach(p=>{const qty=document.querySelector('#qty-'+p.id);qty.value='0';qty.disabled=true;const size=document.querySelector('#size-'+p.id);if(size){size.value='';size.disabled=true}});const notice=document.querySelector('.merch-deadline');if(notice)notice.innerHTML='<span class="merch-deadline-icon" aria-hidden="true">⏳</span><div><strong>ORDINI MERCH CHIUSI</strong><p>La scadenza per ordinare merch era il 1° dicembre 2026. Puoi comunque completare l’iscrizione alla caccia senza merch.</p></div>';}enforceMerchDeadline();
// La combo e i prodotti zaino/sciarpa singoli sono alternative esclusive.
function syncComboExclusivity(changed){
  const combo=document.querySelector('#qty-combo');
  const zaino=document.querySelector('#qty-zaino');
  const sciarpa=document.querySelector('#qty-sciarpa');
  if(!combo||!zaino||!sciarpa)return;
  if(changed===combo && Number(combo.value)>0){zaino.value='0';sciarpa.value='0';}
  if((changed===zaino||changed===sciarpa) && (Number(zaino.value)>0||Number(sciarpa.value)>0)){combo.value='0';}
  const comboSelected=Number(combo.value)>0;
  const singlesSelected=Number(zaino.value)>0||Number(sciarpa.value)>0;
  // Non riattivare le opzioni dopo la scadenza merch.
  const open=merchIsOpen();
  combo.disabled=!open||singlesSelected;
  zaino.disabled=!open||comboSelected;
  sciarpa.disabled=!open||comboSelected;
  const message=document.querySelector('#combo-exclusivity-message');
  if(message){
    message.textContent=comboSelected?'Hai scelto la combo: zaino e sciarpa singoli non sono selezionabili. Per cambiarli, riporta prima la combo a 0.':singlesSelected?'Hai scelto zaino o sciarpa singoli: la combo non è selezionabile. Per sceglierla, riporta entrambi i singoli a 0.':'La combo non è cumulabile con zaino e sciarpa singoli.';
  }
}
syncComboExclusivity();function cart(){return products.map(p=>({ ...p,qty:+document.querySelector('#qty-'+p.id).value,size:p.size?document.querySelector('#size-'+p.id).value:''})).filter(p=>p.qty>0)}const quotaIscrizione=()=>{const now=new Date();const segments=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const x=Object.fromEntries(segments.map(z=>[z.type,z.value]));return `${x.year}-${x.month}-${x.day}`<='2026-12-01'?20:25};function refresh(){enforceMerchDeadline();const c=cart(),quota=quotaIscrizione(),sum=quota+c.reduce((t,p)=>t+p.qty*p.price,0);document.querySelector('#side-total').textContent=euro(sum);document.querySelector('#side-merch').innerHTML=c.map(p=>`<div class="mini-cost"><span>${p.qty}× ${p.name}${p.size?' ('+ (p.size||'taglia?') +')':''}</span><strong>${euro(p.qty*p.price)}</strong></div>`).join('');document.querySelector('#total-input').value=sum;document.querySelector('[name="quota_partecipazione"]').value=quota;document.querySelector('#side-quota').textContent=euro(quota);document.querySelector('#merch-details').value=c.length?c.map(p=>`${p.name}: ${p.qty} × €${p.price}${p.size?'; taglia '+p.size:''}`).join(' | '):'Nessuno';document.querySelector('#summary').innerHTML=`<div class="summary-line"><span>Team selezionato</span><strong>${document.querySelector('#team').value || '—'}</strong></div><div class="summary-line"><span>Quota iscrizione — 1 persona</span><strong>${euro(quota)}</strong></div>${c.map(p=>`<div class="summary-line"><span>${p.qty} × ${p.name}${p.size?' · '+p.size:''}</span><strong>${euro(p.qty*p.price)}</strong></div>`).join('')}<div class="summary-line total"><span>TOTALE DA PAGARE</span><strong>${euro(sum)}</strong></div>`}function syncSizeRequirements(){for(const p of products.filter(item=>item.size)){const qty=document.querySelector('#qty-'+p.id),size=document.querySelector('#size-'+p.id),mark=document.querySelector('#required-'+p.id),selected=+qty.value>0;size.required=selected;size.disabled=!selected;mark.hidden=!selected;size.setCustomValidity('');}}grid.addEventListener('change',event=>{syncComboExclusivity(event.target);syncSizeRequirements();refresh()});syncSizeRequirements();syncComboExclusivity();refresh();const allergy=form.querySelector('[name="allergie_intolleranze"]'),healthConsent=document.querySelector('#health-consent'),healthConsentWrap=document.querySelector('#health-consent-wrap');allergy.addEventListener('input',()=>{const needed=allergy.value.trim().length>0;healthConsentWrap.hidden=!needed;healthConsent.required=needed;if(!needed)healthConsent.checked=false});const age=document.querySelector('#age'),minor=document.querySelector('#minor'),signed=document.querySelector('#signed-file');age.addEventListener('input',()=>{const under=age.value!==''&&+age.value<18;minor.hidden=!under;signed.required=under;if(!under)signed.value=''});document.querySelectorAll('input[name="esperienza"]').forEach(i=>i.addEventListener('change',()=>{const other=document.querySelector('input[name="esperienza"]:checked')?.value==='Sì, con un\'altra squadra';document.querySelector('#former-team-wrap').hidden=!other;document.querySelector('#former-team').required=other;if(!other)document.querySelector('#former-team').value=''}));function checkStep(){let elems=[...panels[current].querySelectorAll('input,textarea,select')].filter(el=>el.willValidate&&!el.disabled);for(const el of elems){if(!el.checkValidity()){el.reportValidity();return false}}if(current===1&&Number(age.value)<18&&allergy.value.trim()){alert('Per un partecipante minorenne non inserire allergie o intolleranze in questo modulo. Contatta direttamente gli organizzatori per segnalare eventuali esigenze particolari.');allergy.focus();return false}if(current===0&&!minor.hidden&&signed.files[0]?.size>8*1024*1024){alert('Il file deve essere inferiore a 8 MB.');return false}if(current===2){syncComboExclusivity();if(Number(document.querySelector('#qty-combo').value)>0&&(Number(document.querySelector('#qty-zaino').value)>0||Number(document.querySelector('#qty-sciarpa').value)>0)){alert('La combo non può essere acquistata insieme a zaino o sciarpa singoli.');return false;}syncSizeRequirements();for(const p of cart()){if(p.size&&!p.size.length){const el=document.querySelector('#size-'+p.id);el.setCustomValidity('Seleziona una taglia per '+p.name);el.reportValidity();el.setCustomValidity('');return false}}}return true}function show(n){current=n;panels.forEach((p,i)=>p.classList.toggle('active',i===n));steps.forEach((s,i)=>{s.classList.toggle('active',i===n);s.classList.toggle('done',i<n);s.setAttribute('aria-current',i===n?'step':'false')});document.querySelector('#prev').hidden=n===0;document.querySelector('#next').hidden=n===3;document.querySelector('#submit').hidden=n!==3;refresh();document.querySelector('#dossier').scrollIntoView({behavior:'smooth',block:'start'})}document.querySelector('#next').onclick=()=>{if(checkStep())show(Math.min(3,current+1))};document.querySelector('#prev').onclick=()=>show(current-1);steps.forEach((s,i)=>s.onclick=()=>{if(i<=current)show(i);else{for(let j=current;j<i;j++){const old=current;current=j;if(!checkStep()){current=old;show(j);return}}show(i)}});document.querySelector('#start').onclick=()=>document.querySelector('#dossier').scrollIntoView({behavior:'smooth'});const pay=document.querySelector('#payment-detail'),iban='IT59O3608105138283897583910';document.querySelectorAll('input[name="metodo_pagamento"]').forEach(el=>el.addEventListener('change',()=>{const v=el.value;if(v==='Bonifico bancario')pay.innerHTML=`<strong>Bonifico a Raffaella Vitale</strong><div>IBAN: <code>${iban}</code> <button type="button" id="copy-iban">COPIA</button></div><div>Causale suggerita: INSERIOONI 2026 + nome e cognome</div>`;if(v==='PayPal')pay.innerHTML='<strong>Pagamento con PayPal</strong><div><a href="https://www.paypal.me/Inseriooni" target="_blank" rel="noopener noreferrer">Apri paypal.me/Inseriooni ↗</a></div><div>Inserisci manualmente il totale indicato nel riepilogo.</div>';if(v==='Revolut')pay.innerHTML='<strong>Pagamento con Revolut</strong><div><a href="https://revolut.me/raffaellavita" target="_blank" rel="noopener noreferrer">Apri revolut.me/raffaellavita ↗</a></div><div>Inserisci manualmente il totale indicato nel riepilogo.</div>';if(v==='Contanti')pay.innerHTML='<strong>Pagamento in contanti</strong><div>Consegna il totale indicato nel riepilogo direttamente agli organizzatori.</div><div>Concorda con loro il momento della consegna. Il modulo non registra l’avvenuto pagamento.</div>';document.querySelector('#copy-iban')?.addEventListener('click',()=>navigator.clipboard.writeText(iban).then(()=>alert('IBAN copiato'))) }));// Google Apps Script: invio tramite iframe nascosto per compatibilità con il redirect di Apps Script.
// Il browser non invia dati se la connessione a Google Sheets non è configurata.
const scriptUrl=String(window.INSERIOONI_SCRIPT_URL||'').trim();
let waitingToken=null;
let submitTimeout=null;
let postFrame=null;
let pollTimer=null;
let pollCounter=0;
const submitButton=document.querySelector('#submit');
const sendNote=document.querySelector('#mode-note');
if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl)){
  sendNote.textContent='COLLEGAMENTO DA ATTIVARE: gli organizzatori devono configurare Google Sheets prima di ricevere iscrizioni.';
  sendNote.style.color='#f29a38';
}
function field(name){return form.elements.namedItem(name)}
function selectedValue(name){return form.querySelector(`[name="${name}"]:checked`)?.value||''}
function fileToBase64(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(new Error('Impossibile leggere il file.'));reader.readAsDataURL(file)})}
function resetSending(){
  submitButton.disabled=false;
  submitButton.textContent='INVIA IL DOSSIER ↗';
  if(submitTimeout)clearTimeout(submitTimeout);
  if(pollTimer)clearTimeout(pollTimer);
  submitTimeout=null; pollTimer=null;
}
function confermaRegistrazione(id){
  if(!waitingToken)return;
  waitingToken=null;
  resetSending();
  sessionStorage.removeItem('inseriooni_pending_request');
  sessionStorage.setItem('inseriooni_last_id',String(id||''));
  location.href='success.html';
}
// Apps Script può salvare la riga senza riuscire a notificare la pagina.
// Interroghiamo solo lo stato del codice casuale, senza leggere dati personali.
function verificaSalvataggio(token){
  if(waitingToken!==token)return;
  const callback='__inseriooniAck_'+(++pollCounter);
  const tag=document.createElement('script');
  let done=false;
  let expire;
  const cleanup=()=>{if(expire)clearTimeout(expire);delete window[callback];tag.remove()};
  const next=()=>{if(done)return;done=true;cleanup();if(waitingToken===token)pollTimer=setTimeout(()=>verificaSalvataggio(token),3200)};
  window[callback]=(answer)=>{
    if(done)return;
    done=true;cleanup();
    if(waitingToken!==token)return;
    if(answer&&answer.status==='ok'&&answer.request_id===token){confermaRegistrazione(answer.id);return;}
    if(answer&&answer.status==='error'&&answer.request_id===token){waitingToken=null;sessionStorage.removeItem('inseriooni_pending_request');resetSending();alert(answer.message||'Registrazione rifiutata. Contatta gli organizzatori.');return;}
    pollTimer=setTimeout(()=>verificaSalvataggio(token),3200);
  };
  tag.onerror=next;
  expire=setTimeout(next,9000);
  tag.src=scriptUrl+'?action=check&request_id='+encodeURIComponent(token)+'&prefix='+encodeURIComponent(callback)+'&_='+Date.now();
  document.head.appendChild(tag);
}
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
      disponibilita:field('disponibilita').value,materiale_base:field('materiale_base').value,allergie_intolleranze:field('allergie_intolleranze').value,
      consenso_esplicito_dati_salute:healthConsent.checked,
      quantita:Object.fromEntries(products.map(x=>[x.id,Number(field('quantita_'+x.id).value)])),
      taglia:{felpa:field('taglia_felpa').value,giubbotto:field('taglia_giubbotto').value},
      metodo_pagamento:selectedValue('metodo_pagamento'),
      accettazione_informativa:field('accettazione_informativa').checked,
      versione_informativa:'1.0-2026-11-09',
      presa_visione_pagamento:field('presa_visione_pagamento').checked
    };
    if(attachment)p.autorizzazione={mime:attachment.type,base64:await fileToBase64(attachment)};
    const requestId=(sessionStorage.getItem('inseriooni_pending_request') || (crypto.randomUUID?crypto.randomUUID():'ins-'+Date.now()+'-'+Math.random().toString(36).slice(2))); // Riusa il token se l'invio precedente è rimasto incerto: nessun duplicato
    if(postFrame)postFrame.remove();
    postFrame=document.createElement('iframe');postFrame.name='inseriooni_result_frame';postFrame.title='Risposta invio iscrizione';postFrame.style.display='none';document.body.append(postFrame);
    const sender=document.createElement('form');sender.style.display='none';sender.method='POST';sender.action=scriptUrl;sender.target=postFrame.name;sender.enctype='application/x-www-form-urlencoded';
    for(const [key,value] of Object.entries({payload:JSON.stringify(p),request_id:requestId})){
      const i=document.createElement('input');i.type='hidden';i.name=key;i.value=value;sender.append(i);
    }
    document.body.append(sender);waitingToken=requestId;
    sessionStorage.setItem('inseriooni_pending_request',requestId);
    sender.submit();sender.remove();
    // Il controllo parte a prescindere dal postMessage dell'iframe.
    pollTimer=setTimeout(()=>verificaSalvataggio(requestId),2500);
    submitTimeout=setTimeout(()=>{if(waitingToken===requestId){waitingToken=null;resetSending();alert('Conferma non disponibile: l’iscrizione potrebbe essere stata salvata. Controlla Google Sheets o contatta gli organizzatori prima di riprovare. Il codice tecnico dello stesso invio è conservato per evitare duplicati.')}},75000);
  }catch(error){waitingToken=null;resetSending();alert('Impossibile preparare l’invio. Controlla il documento allegato e riprova.');}
});


// Feedback diretto quando il browser consente a Google Apps Script di inviarlo.
window.addEventListener('message', event=>{
  if(!/^https:\/\/(?:[a-z0-9-]+\.)*(?:googleusercontent\.com|google\.com)$/.test(event.origin))return;
  const answer=event.data;
  if(!answer || answer.type!=='INSERIOONI_RESULT' || !waitingToken || answer.request_id!==waitingToken)return;
  if(answer.status==='ok'){confermaRegistrazione(answer.id);return;}
  if(answer.status==='error'){
    waitingToken=null;sessionStorage.removeItem('inseriooni_pending_request');resetSending();
    alert(answer.message||'Iscrizione non registrata. Contatta gli organizzatori.');
  }
});
