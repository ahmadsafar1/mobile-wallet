
// Local UI lock only. Existing walletDB data and PIN hash format are preserved.
let walletPinBusy=false, walletPinFailures=0, walletPinUntil=0;
const walletText=(ar,en)=>L==='ar'?ar:en;
const walletOldRender=render;
render=function(){walletOldRender();const c=document.querySelector('#view-settings button[onclick="openLock(\'set\')"]');if(c)c.onclick=()=>openLock(pinHash?'change':'set');};
openLock=function(mode){
  pinMode=mode;pinBuffer='';if(mode!=='confirm')pinTemp='';
  const titles={unlock:t('enterPin'),set:t('choosePin'),confirm:t('repeatPin'),remove:t('enterCurrent'),change:t('enterCurrent')};
  $('lockTitle').textContent=titles[mode]||t('enterPin');
  $('lockNote').textContent=walletText('أدخل من 4 إلى 8 أرقام ثم اضغط تأكيد. هذا القفل لا يشفّر البيانات.','Enter 4–8 digits, then Confirm. This lock does not encrypt data.');
  $('lockCancel').style.display=mode==='unlock'?'none':'inline-block';$('lockCancel').textContent=t('cancel');
  drawPin();$('lock').classList.add('open');
};
pressPin=function(n){
  if(walletPinBusy)return;
  if(n==='C')pinBuffer='';else if(n==='⌫')pinBuffer=pinBuffer.slice(0,-1);else if(/^\d$/.test(n)&&pinBuffer.length<8)pinBuffer+=n;
  drawPin();
};
checkPin=async function(){
  if(walletPinBusy)return;
  if(Date.now()<walletPinUntil){alert(walletText('انتظر قليلًا قبل المحاولة مجددًا.','Please wait before trying again.'));return;}
  if(!/^\d{4,8}$/.test(pinBuffer)){alert(t('shortPin'));return;}
  walletPinBusy=true;
  try{
    const h=await hashPin(pinBuffer),mode=pinMode;
    if(mode==='set'){pinTemp=h;openLock('confirm');return;}
    if(mode==='confirm'){
      if(h!==pinTemp){pinBuffer='';drawPin();alert(t('mismatch'));return;}
      localStorage.setItem('appPin',h);pinHash=h;pinTemp='';pinBuffer='';$('lock').classList.remove('open');render();alert(t('lockOn'));return;
    }
    if(h!==pinHash){walletPinFailures++;if(walletPinFailures>=5){walletPinUntil=Date.now()+30000;walletPinFailures=0;}pinBuffer='';drawPin();alert(t('wrongPin'));return;}
    walletPinFailures=0;walletPinUntil=0;
    if(mode==='change'){openLock('set');return;}
    if(mode==='remove'){localStorage.removeItem('appPin');pinHash='';}
    pinBuffer='';$('lock').classList.remove('open');render();
  }catch(e){alert(walletText('تعذّر إتمام العملية. افتح رابط HTTPS وحاول مجددًا.','Operation failed. Open the HTTPS site and try again.'));console.error(e);}
  finally{walletPinBusy=false;}
};
initLock=function(){
  $('keypad').dir='ltr';$('keypad').innerHTML=[1,2,3,4,5,6,7,8,9,'C',0,'⌫'].map(x=>`<button onclick="pressPin('${x}')">${x}</button>`).join('')+`<button class="primary" style="grid-column:1/-1" onclick="checkPin()">${t('confirm')}</button>`;
  if(pinHash)openLock('unlock');
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&pinHash){closeModal();openLock('unlock');}});
render();initLock();
