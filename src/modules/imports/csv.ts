import {createHash} from 'node:crypto';
import {brandIdForName,brandFor} from '../catalogue/brands';
import {CouponBatch} from './schema';
export function parseCsv(text:string):Record<string,string>[] {
  const rows:string[][]=[];let row:string[]=[];let value='';let quoted=false;let closed=false;
  const input=text.replace(/^\uFEFF/,'');
  for(let i=0;i<input.length;i++) {
    const c=input[i];
    if(quoted) {if(c==='"'){if(input[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c;continue;}
    if(c==='"'){if(value || closed)throw new Error('INVALID_CSV');quoted=true;continue;}
    if(c===',' || c==='\n' || c==='\r') {
      row.push(value);value='';closed=false;
      if(c!==','){if(c==='\r' && input[i+1]==='\n')i++;if(row.some(Boolean))rows.push(row);row=[];}
    } else {if(closed)throw new Error('INVALID_CSV');value+=c;}
  }
  if(quoted)throw new Error('INVALID_CSV');if(value || row.length){row.push(value);rows.push(row);}
  const headers=rows.shift();if(!headers || new Set(headers).size!==headers.length)throw new Error('INVALID_CSV_HEADERS');
  if(rows.length>500)throw new Error('CSV_TOO_LARGE');
  return rows.map(cells=>{if(cells.length!==headers.length)throw new Error('INVALID_CSV_COLUMNS');return Object.fromEntries(headers.map((h,i)=>[h,cells[i]]));});
}
export function csvBatch(text:string,publish:boolean,now:string) {
  const hash=createHash('sha256').update(text).digest('hex');const rows=parseCsv(text);
  const expected=['record_id','coupon_code','store','category','advertised_offer','conditions_and_limits','source_url','market','collected_at_ist','source_type','verification_status','expiry_date_claimed','duplicate_group_key','notes'];
  if(!rows.length || expected.some(k=>!(k in rows[0])) || Object.keys(rows[0]).length!==expected.length)throw new Error('INVALID_CSV_HEADERS');
  const cats:Record<string,string>={'Fashion':'fashion','Beauty':'beauty','Footwear':'footwear','Food':'food','Groceries':'groceries','Personal care':'personal-care','Electronics':'electronics','Clothing':'clothing','Travel':'travel','Home':'home','Food delivery':'food','Beauty/Fashion':'beauty-fashion','Shopping':'shopping'};
  const candidates=[];const coupons=[];const seen=new Set<string>();
  for(const row of rows) {
    if(!/^INCP-\d{4}$/.test(row.record_id) || seen.has(row.record_id))throw new Error('INVALID_CSV_ID');seen.add(row.record_id);
    const retailerId=brandIdForName(row.store);const category=cats[row.category];
    if(!retailerId || !category || row.market!=='India' || !row.coupon_code.trim()) {candidates.push({externalId:row.record_id.toLowerCase(),reason:!retailerId?'MERCHANT_NOT_IDENTIFIED':'INCOMPLETE_RECORD',raw:row});continue;}
    const expiry=row.expiry_date_claimed==='unknown_or_not_stated'?'':` Source-listed expiry: ${row.expiry_date_claimed}; precise expiry time not supplied.`;
    coupons.push({externalId:row.record_id.toLowerCase(),category,originalUrl:row.source_url,evidenceReference:`sha256:${hash}/${row.record_id}`,approved:publish,sourceRecord:row,
      terms:{retailerId,title:`${brandFor(retailerId).name}: ${row.advertised_offer}`,description:'Source-listed claim supplied by the owner. Not independently checkout-tested.',kind:'CODE',code:row.coupon_code,
        eligibility:{products:row.conditions_and_limits,redemption:(row.notes+expiry).slice(0,300)}}});
  }
  return CouponBatch.parse({version:1,batchId:`csv-${hash.slice(0,24)}-${publish?'publish':'draft'}`,supplierId:'owner-supplied-csv',supplierName:'Owner-supplied coupon CSV',suppliedAt:now,synthetic:false,
    approval:publish?{actor:'Project owner via supplied CSV request',reason:'Display supplied candidate coupons with unverified source claims',rightsBasis:'Owner supplied this CSV and requested display; no automatic collection rights inferred',approvedAt:now}:null,coupons,withheldCandidates:candidates});
}
