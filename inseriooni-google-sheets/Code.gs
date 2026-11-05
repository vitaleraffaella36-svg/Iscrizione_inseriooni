/**
 * INSERIOONI · Collettore iscrizioni per Google Sheets
 * Incolla questo codice in Estensioni > Apps Script di un foglio Google vuoto.
 * Esegui inizializzaInseriooni una sola volta, approva le autorizzazioni,
 * distribuisci come App web (esegui come Me, accesso Chiunque).
 * Il foglio e la cartella delle autorizzazioni NON vanno condivisi pubblicamente.
 */
const SETTINGS = {
  SHEET: 'Iscrizioni',
  DASHBOARD: 'Cruscotto',
  FOLDER_PROPERTY: 'INSERIOONI_FOLDER_ID',
  MAX_FILE_BYTES: 8 * 1024 * 1024,
  MAX_PAYLOAD_CHARS: 12 * 1024 * 1024,
  EVENT: 'Caccia Inseriooni 28–29 dicembre 2026'
};
const HEADERS = [
  'ID iscrizione','Data e ora','Nome','Cognome','Età al 28/12/2026','Telefono','Email',
  'Team','Esperienza precedente','Ex squadra','Disponibilità (facoltativa)',
  'Allergie/intolleranze (facoltative)','Consenso esplicito dati salute',
  'Minorenne','Autorizzazione firmata (link privato)',
  'Zaino q.tà','Cappello q.tà','Felpa q.tà','Felpa taglia',
  'Giubbotto q.tà','Giubbotto taglia','Sciarpa q.tà',
  'Quota partecipazione €','Totale merch €','Totale dovuto €',
  'Metodo di pagamento','Pagamento ricevuto','Data pagamento','Note organizzatori',
  'Informativa presa visione','Condizioni pagamento accettate'
];
const COSTS = { zaino:10, cappello:5, felpa:20, giubbotto:30, sciarpa:15 };
const SIZES = ['XS','S','M','L','XL','XXL'];
const TEAMS = ['Menti','Prove pratiche','Incursori'];
const PAYMENTS = ['Bonifico bancario','PayPal','Revolut','Contanti'];
const EXPERIENCES = ['Sì, con Inseriooni','Sì, con un\'altra squadra','No, è la mia prima caccia'];

function inizializzaInseriooni() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw Error('Apri lo script dal menu Estensioni del tuo Google Sheets.');
  let sheet = ss.getSheetByName(SETTINGS.SHEET) || ss.insertSheet(SETTINGS.SHEET);
  sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,HEADERS.length).setBackground('#181818').setFontColor('#f29a38').setFontWeight('bold');
  sheet.setRowHeight(1,50);
  sheet.getRange(1,1,1,HEADERS.length).setWrap(true);
  sheet.setColumnWidths(1,HEADERS.length,150);
  sheet.setColumnWidth(11,260); sheet.setColumnWidth(12,260); sheet.setColumnWidth(15,290);
  sheet.setColumnWidth(29,240);
  if (!sheet.getFilter()) sheet.getRange(1,1,Math.max(sheet.getLastRow(),2),HEADERS.length).createFilter();
  sheet.getRange('AA2:AA').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Da verificare','Sì','No'],true).build());
  sheet.getRange('W2:Y').setNumberFormat('€ #,##0.00');
  sheet.getRange('AB2:AB').setNumberFormat('dd/mm/yyyy');
  sheet.getRange('B2:B').setNumberFormat('dd/mm/yyyy hh:mm');
  const prop = PropertiesService.getScriptProperties();
  if (!prop.getProperty(SETTINGS.FOLDER_PROPERTY)) {
    const folder = DriveApp.createFolder('INSERIOONI · Autorizzazioni minorenni (PRIVATO)');
    prop.setProperty(SETTINGS.FOLDER_PROPERTY,folder.getId());
  }
  let dashboard=ss.getSheetByName(SETTINGS.DASHBOARD)||ss.insertSheet(SETTINGS.DASHBOARD);
  dashboard.clear();
  dashboard.getRange('A1:D1').merge().setValue('INSERIOONI · CRUSCOTTO ISCRIZIONI');
  dashboard.getRange('A1:D1').setBackground('#181818').setFontColor('#f29a38').setFontSize(17).setFontWeight('bold');
  dashboard.setRowHeight(1,48);
  dashboard.getRange('A3:B13').setValues([
    ['Indicatore','Valore'],['Iscritti totali','=COUNTA(Iscrizioni!A2:A)'],
    ['Team Menti','=COUNTIF(Iscrizioni!H2:H,"Menti")'],
    ['Team Prove pratiche','=COUNTIF(Iscrizioni!H2:H,"Prove pratiche")'],
    ['Team Incursori','=COUNTIF(Iscrizioni!H2:H,"Incursori")'],
    ['Minorenni','=COUNTIF(Iscrizioni!N2:N,"Sì")'],
    ['Quota partecipazione totale','=SUM(Iscrizioni!W2:W)'],
    ['Merch totale','=SUM(Iscrizioni!X2:X)'],
    ['Totale dovuto','=SUM(Iscrizioni!Y2:Y)'],
    ['Pagamenti ricevuti','=SUMIF(Iscrizioni!AA2:AA,"Sì",Iscrizioni!Y2:Y)'],
    ['Da incassare','=B11-B12']
  ]);
  dashboard.getRange('A3:B3').setBackground('#181818').setFontColor('#f29a38').setFontWeight('bold');
  dashboard.getRange('B9:B13').setNumberFormat('€ #,##0.00');
  dashboard.getRange('A15:B16').setValues([['Stato pagamento','Iscrizioni'],['Da verificare','=COUNTIF(Iscrizioni!AA2:AA,"Da verificare")']]);
  dashboard.getRange('A17:B17').setValues([['Pagato','=COUNTIF(Iscrizioni!AA2:AA,"Sì")']]);
  dashboard.getRange('A18:B18').setValues([['Non pagato','=COUNTIF(Iscrizioni!AA2:AA,"No")']]);
  dashboard.setColumnWidth(1,280);dashboard.setColumnWidth(2,180);
  dashboard.getRange('A1:B18').setFontFamily('Arial');
  SpreadsheetApp.flush();
  Logger.log('Foglio inizializzato: '+ss.getUrl());
  Logger.log('Cartella privata autorizzazioni: https://drive.google.com/drive/folders/'+prop.getProperty(SETTINGS.FOLDER_PROPERTY));
}

function doPost(e) {
  let result;
  try { result = salvaIscrizione_(e); }
  catch(err) { console.error(err); result={status:'error',message:'Invio non riuscito. Contatta gli organizzatori.'}; }
  const token=String((e&&e.parameter&&e.parameter.request_id)||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80);
  result.request_id=token;
  // Non trasmettere mai nell'iframe dati personali o informazioni sanitarie.
  const json=JSON.stringify({type:'INSERIOONI_RESULT',...result}).replace(/</g,'\\u003c');
  const html='<!doctype html><html><body><script>window.parent.postMessage('+json+',"*");<\/script><p>Esito trasmesso al modulo.</p></body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function salvaIscrizione_(e) {
  if(!e||!e.parameter||!e.parameter.payload) throw Error('Payload assente');
  if(e.parameter.payload.length>SETTINGS.MAX_PAYLOAD_CHARS) throw Error('Dati troppo grandi');
  const p=JSON.parse(e.parameter.payload);
  const s=v=>String(v==null?'':v).trim();
  const required=['nome','cognome','telefono','email'];
  required.forEach(key=>{if(!s(p[key])||s(p[key]).length>200)throw Error('Campo non valido: '+key)});
  if(!/^\S+@\S+\.\S+$/.test(s(p.email)))throw Error('Email non valida');
  const age=Number(p.eta);
  if(!Number.isInteger(age)||age<1||age>110)throw Error('Età non valida');
  if(!TEAMS.includes(p.team)||!PAYMENTS.includes(p.metodo_pagamento)||!EXPERIENCES.includes(p.esperienza))throw Error('Selezione non valida');
  if(p.esperienza==='Sì, con un\'altra squadra'&&!s(p.ex_squadra))throw Error('Manca ex squadra');
  if(!p.accettazione_informativa||!p.presa_visione_pagamento)throw Error('Consensi obbligatori mancanti');
  if(s(p.allergie_intolleranze)&&!p.consenso_esplicito_dati_salute)throw Error('Consenso dati salute mancante');
  const q={};let merch=0;
  Object.keys(COSTS).forEach(key=>{
    const n=Number((p.quantita||{})[key]||0);
    if(!Number.isInteger(n)||n<0||n>5)throw Error('Quantità non valida '+key);
    q[key]=n;merch+=n*COSTS[key];
  });
  const sizeF=s((p.taglia||{}).felpa),sizeG=s((p.taglia||{}).giubbotto);
  if(q.felpa&&!SIZES.includes(sizeF))throw Error('Taglia felpa obbligatoria');
  if(q.giubbotto&&!SIZES.includes(sizeG))throw Error('Taglia giubbotto obbligatoria');
  const file=p.autorizzazione||null;
  if(age<18&&!file)throw Error('Autorizzazione minorenne mancante');
  if(age>=18&&file)throw Error('Allegato non richiesto');
  if(file){
    if(!['application/pdf','image/jpeg','image/png'].includes(file.mime))throw Error('Formato file non consentito');
    if(!file.base64||file.base64.length>Math.ceil(SETTINGS.MAX_FILE_BYTES*4/3)+10)throw Error('File troppo grande');
  }
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sheet=ss.getSheetByName(SETTINGS.SHEET);
  if(!sheet)throw Error('Inizializza prima il foglio');
  const lock=LockService.getScriptLock();lock.waitLock(30000);
  try {
    const rid=s(e.parameter.request_id);
    const cache=CacheService.getScriptCache();
    if(rid&&cache.get('saved_'+rid))return {status:'ok',id:cache.get('saved_'+rid)};
    const id='INS-'+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),'yyyyMMdd-HHmmss')+'-'+Utilities.getUuid().slice(0,6).toUpperCase();
    let url='';
    if(file){
      const bytes=Utilities.base64Decode(file.base64);
      if(bytes.length>SETTINGS.MAX_FILE_BYTES)throw Error('File troppo grande');
      const folderId=PropertiesService.getScriptProperties().getProperty(SETTINGS.FOLDER_PROPERTY);
      if(!folderId)throw Error('Cartella autorizzazioni non configurata');
      const extension={'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png'}[file.mime];
      const name=id+'-autorizzazione.'+extension;
      const blob=Utilities.newBlob(bytes,file.mime,name);
      const doc=DriveApp.getFolderById(folderId).createFile(blob);
      url=doc.getUrl();
    }
    // Aggiunta in formato testo, impedisce a input non attendibili di diventare formule.
    const safe=v=>{const t=s(v).slice(0,5000);return /^[=+\-@]/.test(t)?"'"+t:t;};
    const row=[id,new Date(),safe(p.nome),safe(p.cognome),age,safe(p.telefono),safe(p.email),p.team,p.esperienza,safe(p.ex_squadra),safe(p.disponibilita),safe(p.allergie_intolleranze),p.consenso_esplicito_dati_salute?'Sì':'No',age<18?'Sì':'No',url,q.zaino,q.cappello,q.felpa,q.felpa?sizeF:'',q.giubbotto,q.giubbotto?sizeG:'',q.sciarpa,20,merch,20+merch,p.metodo_pagamento,'Da verificare','', '', 'Sì','Sì'];
    sheet.appendRow(row);
    if(rid)cache.put('saved_'+rid,id,21600);
    return {status:'ok',id:id};
  } finally {lock.releaseLock();}
}
