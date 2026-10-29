'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Icon({name,size=20}:{name:'search'|'arrow'|'menu'|'close'|'copy'|'check'|'ticket'|'external'|'audio'|'computer'|'phone'|'accessory';size?:number}) {
  const paths:Record<string,string>={search:'m21 21-4.5-4.5M19 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',arrow:'M5 12h14m-6-6 6 6-6 6',menu:'M4 7h16M4 12h16M4 17h16',close:'m6 6 12 12M18 6 6 18',copy:'M9 9h11v12H9zM15 5V2H3v13h3',check:'m5 12 4 4L19 6',ticket:'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4V5Zm13 0v3m0 3v2m0 3v3',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',audio:'M4 14v-3a8 8 0 0 1 16 0v3M4 12H2v8h5v-8H4Zm16 0h2v8h-5v-8h3',computer:'M2 4h20v13H2zM8 22h8m-4-5v5',phone:'M6 2h12v20H6zM10 18h4',accessory:'M7 3h10v7H7zM12 10v7a4 4 0 0 0 4 4h4M10 1v2m4-2v2'};
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
export function Brand() {
  return <span className="brand"><span className="brand-mark"><Icon name="ticket" size={23}/></span><span>coupon<span className="brand-second">intelligence</span></span></span>;
}
export function Navigation() {
  const path=usePathname();const [open,setOpen]=useState(false);
  const links=[['/search','Browse offers'],['/#stores','Brands'],['/guides','Guides'],['/methodology','How we list offers']];
  return <header className="site-header" id="top"><div className="shell navbar header-inner">
    <Link href="/" className="brand-link" aria-label="Coupon Intelligence home" onClick={()=>setOpen(false)}><Brand/></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>
    <div className="header-actions"><a className="btn btn-outline promo-contact" href="https://wa.me/919965985951"><span>List promo codes</span></a>
      <button className="btn btn-ghost btn-square mobile-menu-button" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}><Icon name={open?'close':'menu'}/></button></div>
    {open&&<nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}}>{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}</nav>}
  </div></header>;
}
export function Footer() {
  return <footer className="site-footer"><div className="shell footer-content"><Link href="/" aria-label="Coupon Intelligence home"><Brand/></Link><p>Conditions first. Always read the source before you use an offer.</p><nav aria-label="Footer navigation"><Link href="/#stores">Browse brands</Link><Link href="/methodology">How we list offers</Link><Link href="/about">About</Link><Link href="/faq">FAQ</Link><Link href="/contact-report-an-offer">Contact & report</Link><Link href="/affiliate-disclosure">Disclosure</Link><Link href="/terms">Terms</Link><Link href="/privacy-policy-placeholder">Privacy draft</Link><Link href="/site-map">Site map</Link></nav></div><div className="shell footer-note"><span>Independent offer directory. Not affiliated with the listed brands.</span><span>Read the conditions before redemption.</span></div></footer>;
}
