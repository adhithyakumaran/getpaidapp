export const brands=[
  {id:'amazon-india',name:'Amazon India',url:'https://www.amazon.in/'},
  {id:'myntra',name:'Myntra',url:'https://www.myntra.com/'},
  {id:'ajio',name:'AJIO',url:'https://www.ajio.com/'},
  {id:'nykaa',name:'Nykaa',url:'https://www.nykaa.com/'},
  {id:'zepto',name:'Zepto',url:'https://www.zepto.com/'},
  {id:'pizza-hut',name:'Pizza Hut',url:'https://www.pizzahut.co.in/'},
  {id:'kfc',name:'KFC',url:'https://online.kfc.co.in/'},
  {id:'mojo-pizza',name:'Mojo Pizza',url:'https://mojopizza.in/'},
  {id:'rage-coffee',name:'Rage Coffee',url:'https://ragecoffee.com/'},
  {id:'hk-vitals',name:'HK Vitals',url:'https://www.hkvitals.com/'},
  {id:'muscleblaze',name:'MuscleBlaze',url:'https://www.muscleblaze.com/'},
  {id:'dot-key',name:'Dot & Key',url:'https://www.dotandkey.com/'},
  {id:'croma',name:'Croma',url:'https://www.croma.com/'},
  {id:'reliance-digital',name:'Reliance Digital',url:'https://www.reliancedigital.in/'},
  {id:'damensch',name:'DaMENSCH',url:'https://www.damensch.com/'},
  {id:'gostops',name:'goSTOPS',url:'https://gostops.com/'},
  {id:'redbus',name:'redBus',url:'https://www.redbus.in/'},
  {id:'kurlon',name:'Kurlon',url:'https://kurlon.com/'},
  {id:'zomato',name:'Zomato',url:'https://www.zomato.com/'},
  {id:'flipkart-flights',name:'Flipkart Flights',url:'https://www.flipkart.com/travel/flights'},
  {id:'flipkart',name:'Flipkart',url:'https://www.flipkart.com/'},
] as const;
export const brandIds=brands.map(b=>b.id);
export const brandFor=(id:string)=>brands.find(b=>b.id===id)??brands[0];
export const brandIdForName=(name:string)=>{
  const aliases:Record<string,string>={'Pizza Hut Gift Cards':'pizza-hut','Zepto listing':'zepto'};
  return aliases[name]??brands.find(b=>b.name.toLowerCase()===name.toLowerCase())?.id;
};
export const sourceListingUrls=[
  'https://www.grabon.in/myntra-coupons/','https://zoutons.com/category/food',
  'https://www.zoutons.com/category/groceries','https://zoutons.com/category/personal-care',
  'https://zoutons.com/zepto-coupons','https://www.zoutons.com/nykaa-coupons',
  'https://zoutons.com/category/mobile','https://www.zoutons.com/category/clothing-%26-accessories',
  'https://www.zoutons.com/gostops-coupons','https://www.grabon.in/delhi-deals/',
  'https://www.grabon.in/chennai-deals/','https://www.grabon.in/zomato-coupons/',
  'https://zoutons.com/ajio-coupons','https://www.zoutons.com/flipkart-coupons',
] as const;
