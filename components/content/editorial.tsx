import Link from 'next/link';
import {Fragment} from 'react';
import {categoryPages,guides,editorialUpdatedAt} from '@/src/content/model';
import {jsonLd,SITE_ORIGIN} from '@/src/modules/seo/config';
function Inline({text}:{text:string}){return <>{text.split(/(\*\*[^*]+\*\*)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:<Fragment key={i}>{part}</Fragment>)}</>;}
export function Markdown({body}:{body:string}) {
 return <div className="article-body">{body.split(/\n\n+/).map((block,i)=>{
  if(block.startsWith('## '))return <h2 key={i}>{block.slice(3)}</h2>;
  if(block.startsWith('- '))return <ul key={i}>{block.split('\n').map((s,j)=><li key={j}><Inline text={s.replace(/^- /,'')}/></li>)}</ul>;
  if(/^\d+\. /.test(block))return <ol key={i}>{block.split('\n').map((s,j)=><li key={j}><Inline text={s.replace(/^\d+\. /,'')}/></li>)}</ol>;
  return <p key={i}><Inline text={block}/></p>;
 })}</div>;
}
const guideLabels:Record<string,string>={'how-to-use-coupon-codes-india':'Using coupon codes','why-coupon-code-not-working':'Why a code might fail','coupon-vs-cashback-vs-bank-offer':'Coupons, cashback and banks','how-to-compare-online-deals':'Compare online deals','new-user-coupons-explained':'New-user eligibility','online-shopping-safety-coupon-sites':'Shopping safely','how-coupon-verification-works':'How verification works','festival-sale-shopping-checklist':'Festival sale checklist'};
export function RelatedReading({slugs=guides.slice(0,3).map(g=>g.slug)}:{slugs?:string[]}) {
 return <nav className="related-reading" aria-label="Related shopping guides"><h2>Useful before you shop</h2>{slugs.map(slug=>{const g=guides.find(item=>item.slug===slug);return g?<Link key={slug} href={'/'+slug} title={g.title}>{guideLabels[slug]??g.title}</Link>:null;})}<Link href="/guides">All shopping guides</Link></nav>;
}
export function ContentDirectory() {return <section className="shell content-directory"><h2>Find offers by category</h2><div className="content-category-links">{categoryPages.map(c=><Link key={c.slug} href={'/'+c.slug}>{c.title}</Link>)}</div><RelatedReading/></section>;}
export function Article({title,excerpt,body,path,guide=false}:{title:string;excerpt:string;body:string;path:string;guide?:boolean}) {
 return <article className="shell editorial-page"><nav className="breadcrumbs-line" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>{guide?<Link href="/guides">Shopping guides</Link>:<span>{title}</span>}</nav><header><h1>{title}</h1><p className="article-summary">{excerpt}</p><p className="article-byline">Coupon Intelligence editorial <span>Updated <time dateTime={editorialUpdatedAt}>{editorialUpdatedAt}</time></span></p></header><Markdown body={body}/><RelatedReading slugs={guides.filter(g=>'/'+g.slug!==path).slice(0,3).map(g=>g.slug)}/><nav className="article-links"><Link href="/search">Browse coupons</Link><Link href="/faq">Coupon questions</Link><Link href="/contact-report-an-offer">Contact & report</Link></nav>{guide&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'Article',headline:title,description:excerpt,datePublished:editorialUpdatedAt,dateModified:editorialUpdatedAt,author:{'@type':'Organization',name:'Coupon Intelligence'},publisher:{'@type':'Organization',name:'Coupon Intelligence'},mainEntityOfPage:SITE_ORIGIN+path,inLanguage:'en-IN'})}}/>}</article>;
}
