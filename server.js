'use strict';
// No third-party packages. Requires Node.js 18+.
const http=require('node:http'), fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const ROOT=__dirname, PORT=Number(process.env.PORT||3000), ADMIN_KEY=process.env.ADMIN_KEY;
if(!ADMIN_KEY || ADMIN_KEY.length<16){console.error('Set ADMIN_KEY to a secret of at least 16 characters before starting.');process.exit(1)}
const dataDir=path.join(ROOT,'private-data');fs.mkdirSync(dataDir,{recursive:true});
const ordersFile=path.join(dataDir,'orders.json');
const visitsFile=path.join(dataDir,'visits.json');
let visits=[];try{visits=JSON.parse(fs.readFileSync(visitsFile,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
const sessions=new Map();
function sessionAuth(req){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('rs_admin='));if(!raw)return false;const token=raw.slice(9);const exp=sessions.get(token);if(!exp)return false;if(exp<Date.now()){sessions.delete(token);return false}return true}
function cookie(res,token,maxAge){res.setHeader('Set-Cookie',`rs_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`)}
function persistVisits(){const temp=visitsFile+'.tmp';fs.writeFileSync(temp,JSON.stringify(visits),{mode:0o600});fs.renameSync(temp,visitsFile)}
const products=JSON.parse(fs.readFileSync(path.join(ROOT,'assests/json/products.json'),'utf8'));
const byId=new Map(products.map(p=>[p.id,p]));
let orders=[];try{orders=JSON.parse(fs.readFileSync(ordersFile,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
const sequenceFile=path.join(dataDir,'sequence.json');
let nextOrderNumber=1001;
try{const seq=JSON.parse(fs.readFileSync(sequenceFile,'utf8'));if(Number.isSafeInteger(seq.next)&&seq.next>=1001)nextOrderNumber=seq.next}catch(e){if(e.code!=='ENOENT')throw e}
for(const o of orders){const m=/^RS-(\d+)$/.exec(o.id);if(m)nextOrderNumber=Math.max(nextOrderNumber,Number(m[1])+1)}
function persistSequence(){fs.writeFileSync(sequenceFile,JSON.stringify({next:nextOrderNumber}),{mode:0o600})}
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
function auth(req){const key=req.headers['x-admin-key'];if(typeof key!=='string')return false;const a=Buffer.from(key),b=Buffer.from(ADMIN_KEY);return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function persist(){const temp=ordersFile+'.tmp';fs.writeFileSync(temp,JSON.stringify(orders,null,2),{mode:0o600});fs.renameSync(temp,ordersFile)}
function readBody(req){return new Promise((resolve,reject)=>{let s='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>16000){reject(new Error('Request too large'));req.destroy();return}s+=chunk});req.on('end',()=>{try{resolve(JSON.parse(s))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
const clean=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
const rate=new Map();
function limited(ip){const now=Date.now(),v=rate.get(ip)||[];const recent=v.filter(t=>now-t<3600000);recent.push(now);rate.set(ip,recent);return recent.length>15}
const server=http.createServer(async(req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/admin/login'&&req.method==='POST'){
  try{const body=await readBody(req);const k=String(body.password||'');const a=Buffer.from(k),b=Buffer.from(ADMIN_KEY);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return send(res,401,{error:'Invalid admin password'});const token=crypto.randomBytes(32).toString('hex');sessions.set(token,Date.now()+8*3600000);cookie(res,token,8*3600);return send(res,200,{success:true})}catch{return send(res,400,{error:'Login failed'})}
 }
 if(pathname==='/api/admin/logout'&&req.method==='POST'){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('rs_admin='));if(raw)sessions.delete(raw.slice(9));cookie(res,'',0);return send(res,200,{success:true})}
 if(pathname==='/api/visit'&&req.method==='POST'){
  try{const body=await readBody(req);const id=clean(body.visitorId,80);if(!/^[a-zA-Z0-9-]{16,80}$/.test(id))return send(res,400,{error:'Invalid visitor ID'});const now=Date.now();const last=visits.findLast(v=>v.id===id&&now-v.at<30*60000);if(!last){visits.push({id,at:now});if(visits.length>30000)visits=visits.slice(-30000);persistVisits()}return send(res,200,{ok:true})}catch{return send(res,400,{error:'Invalid request'})}
 }
 if(pathname==='/api/admin/summary'&&req.method==='GET'){
  if(!sessionAuth(req))return send(res,401,{error:'Admin login required'});
  const now=Date.now(),day=86400000;const uniq=(v)=>new Set(v.map(x=>x.id)).size;
  return send(res,200,{totalOrders:orders.length,pendingOrders:orders.filter(o=>!['Delivered','Cancelled'].includes(o.status)).length,paymentPending:orders.filter(o=>o.paymentStatus!=='Paid').length,paidOrders:orders.filter(o=>o.paymentStatus==='Paid').length,uniqueVisitors:uniq(visits),visitorsToday:uniq(visits.filter(v=>now-v.at<day)),visitorsLast7Days:uniq(visits.filter(v=>now-v.at<7*day)),visitEvents:visits.length,customers:new Set(orders.map(o=>o.customer.phone)).size});
 }
 if(pathname.startsWith('/api/admin/orders/')&&req.method==='PATCH'){
  if(!sessionAuth(req))return send(res,401,{error:'Admin login required'});
  const id=decodeURIComponent(pathname.slice('/api/admin/orders/'.length)),o=orders.find(x=>x.id===id);if(!o)return send(res,404,{error:'Order not found'});
  try{const b=await readBody(req);if(b.status!==undefined){if(!['New — awaiting confirmation','Confirmed','Packing','Dispatched','Delivered','Cancelled'].includes(b.status))return send(res,400,{error:'Invalid order status'});o.status=b.status}if(b.paymentStatus!==undefined){if(!['Not paid','Awaiting verification','Paid','Refunded'].includes(b.paymentStatus))return send(res,400,{error:'Invalid payment status'});o.paymentStatus=b.paymentStatus}persist();return send(res,200,{success:true,order:o})}catch{return send(res,400,{error:'Invalid update'})}
 }

 if(pathname==='/api/orders'&&req.method==='POST'){
  if(limited(req.socket.remoteAddress||''))return send(res,429,{error:'Too many submissions. Please try later.'});
  try{
   const body=await readBody(req);const customer=body.customer||{};
   const name=clean(customer.name,100),phone=clean(customer.phone,25),address=clean(customer.address,400),city=clean(customer.city,100),postal=clean(customer.postal,30),notes=clean(customer.notes,400);
if (!name || !/^\+?[0-9\s()-]{10,20}$/.test(phone) || address.length < 10 || !city) {
  return send(res, 400, {
    error: 'Please provide valid name, phone, full address and city.'
  });
}   if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)return send(res,400,{error:'Cart is empty or invalid.'});
   let kg=0,subtotal=0;const items=[];
   for(const item of body.items){const p=byId.get(item.id),qty=item.qty;
    if(!p||p.box||p.badge==='Sold Out'||!Number.isInteger(qty)||qty<1||qty>100||!Number.isFinite(p.price))return send(res,400,{error:'Invalid product or quantity in cart.'});
    kg+=qty;subtotal+=qty*p.price;items.push({id:p.id,name:p.name,qtyKg:qty,unitPrice:p.price,lineTotal:qty*p.price});
   }
   if(kg<1||kg>100)return send(res,400,{error:'Minimum 1 KG and maximum 100 KG per order.'});
   const order={id:'RS-'+String(nextOrderNumber++),createdAt:new Date().toISOString(),customer:{name,phone,address,city,postal,notes},items,totalKg:kg,productSubtotal:subtotal,shipping:'Included (TCS)',finalPayable:subtotal,paymentStatus:'Not paid',status:'New — awaiting confirmation'};
   orders.unshift(order);persist();persistSequence();return send(res,201,{success:true,orderId:order.id,productSubtotal:subtotal,totalKg:kg,message:'Order received. TCS delivery included; advance payment required.'});
  }catch(e){console.error(e);return send(res,400,{error:'Could not save order. Please retry.'})}
 }
 if(pathname==='/api/admin/orders'&&req.method==='GET'){if(!sessionAuth(req))return send(res,401,{error:'Admin login required'});return send(res,200,{orders})}
 if(pathname.startsWith('/api/'))return send(res,404,{error:'Not found'});
 if(req.method!=='GET'&&req.method!=='HEAD')return send(res,405,{error:'Method not allowed'});
 let rel;try{rel=decodeURIComponent(pathname==='/'?'/index.html':pathname)}catch{return send(res,400,{error:'Bad path'})}
 const file=path.resolve(ROOT,'.'+rel);if(!file.startsWith(ROOT+path.sep)||file.includes(path.sep+'private-data'+path.sep)||path.basename(file).startsWith('.')||['server.js','package.json','README.txt'].includes(path.basename(file)))return send(res,403,{error:'Forbidden'});
 fs.stat(file,(err,st)=>{if(err||!st.isFile())return send(res,404,{error:'Not found'});res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res)});
});
server.listen(PORT,()=>console.log(`Riwaayat-e-Sohan: http://localhost:${PORT} | Admin: http://localhost:${PORT}/admin.html`));
