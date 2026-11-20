(function(g){
const cents=n=>Math.round(Number(n||0)*100);
function nextDate(start,step,freq){
 const [y,m,d]=start.split('-').map(Number);let z;
 if(freq==='weekly')z=new Date(Date.UTC(y,m-1,d+7*step));
 else {const q=freq==='yearly'?12*step:step;const first=new Date(Date.UTC(y,m-1+q,1));const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();z=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth(),Math.min(d,last)));}
 return z.toISOString().slice(0,10);
}
function stats(b){
 const sum=a=>(a||[]).reduce((s,x)=>s+cents(x.amount),0);
 let income=sum(b.income),expense=sum(b.expense),adds=sum(b.capitalAdds),withdraw=sum(b.withdrawals),returned=0,reinvested=0;
 for(const x of b.walletEntries||[]){const a=cents(x.amount);switch(x.kind){case 'profit':income+=a;break;case 'sale':income+=a;expense+=cents(x.cost);break;case 'expense':expense+=a;break;case 'owner':adds+=a;break;case 'withdraw':withdraw+=a;break;case 'return':returned+=a;break;case 'reinvest':reinvested+=a;break;}}
 const invested=cents(b.capital)+cents(b.openingCost)+adds,net=income-expense,covered=Math.min(invested,Math.max(0,net));
 return {i:income/100,e:expense/100,a:adds/100,w:withdraw/100,inv:invested/100,net:net/100,ret:(net-withdraw)/100,rec:covered/100,pct:invested>0?covered/invested*100:0,mo:0,ml:null,returned:returned/100,reinvested:reinvested/100,left:Math.max(0,invested-covered)/100,cashLeft:Math.max(0,invested-returned)/100};
}
const api={cents,nextDate,stats};if(typeof module!=='undefined')module.exports=api;else g.WalletCore=api;
})(globalThis);
