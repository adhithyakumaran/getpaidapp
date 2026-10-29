import {nativeFrameOrigin} from '@/src/modules/ads/config';
import {AdvertisingProvider,AdSlot} from '@/components/ads/advertising';
import type { Metadata } from 'next';
import { Footer, Navigation } from '@/components/catalogue/chrome';
import {pageMetadata,SITE_ORIGIN,jsonLd} from '@/src/modules/seo/config';
import './globals.css';
export const metadata:Metadata={...pageMetadata('Coupon Intelligence','Find source-listed coupon codes and practical shopping guides for online stores in India.','/'),
  title:{default:'Coupon Intelligence',template:'%s | Coupon Intelligence'},metadataBase:new URL(SITE_ORIGIN)};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return <html lang="en-IN" data-theme="coupon"><body><AdvertisingProvider nativeOrigin={nativeFrameOrigin(process.env)}><div className="site-body"><a className="skip-link" href="#main-content">Skip to content</a><Navigation/><AdSlot placement="top"/><main id="main-content" className="site-main" tabIndex={-1}>{children}</main><AdSlot placement="native"/><Footer/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@type':'WebSite',name:'Coupon Intelligence',url:SITE_ORIGIN,inLanguage:'en-IN'})}}/></div></AdvertisingProvider></body></html>;
}
