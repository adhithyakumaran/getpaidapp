import type { Metadata } from 'next';
import { Footer, Navigation } from '@/components/catalogue/chrome';
import {pageMetadata,SITE_ORIGIN,jsonLd} from '@/src/modules/seo/config';
import './globals.css';
export const metadata:Metadata={...pageMetadata('Coupon Intelligence','Find source-listed coupon codes and practical shopping guides for online stores in India.','/'),
  title:{default:'Coupon Intelligence',template:'%s | Coupon Intelligence'},metadataBase:new URL(SITE_ORIGIN)};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="en-IN" data-theme="coupon"><body><div className="site-body"><a className="skip-link" href="#main-content">Skip to content</a><Navigation/><main id="main-content" className="site-main" tabIndex={-1}>{children}</main><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'WebSite',name:'Coupon Intelligence',url:SITE_ORIGIN,inLanguage:'en-IN'})}}/></div></body></html>;
}
