import Link from 'next/link';
import {faqs} from '@/src/content/model';
import {pageMetadata} from '@/src/modules/seo/config';
export const metadata=pageMetadata('Coupon questions: eligibility, expiry and verification','Clear answers about source-listed coupons, restrictions, cashback and reporting failed codes.','/faq');
export default function FaqPage(){return <section className="shell editorial-page"><h1>Questions before you copy?</h1><p className="article-summary">A listed code is a starting point. These answers explain what to check next.</p><div className="faq-list">{faqs.map(f=><details className="collapse collapse-arrow" key={f.q}><summary className="collapse-title">{f.q}</summary><div className="collapse-content"><p>{f.a}</p></div></details>)}</div><Link className="btn btn-primary" href="/contact-report-an-offer">Contact & report an offer</Link></section>;}
