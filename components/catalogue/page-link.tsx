'use client';
import Link,{useLinkStatus} from 'next/link';
function Label({label}:{label:string}){const {pending}=useLinkStatus();return <>{label}{pending&&<span className="page-pending" aria-hidden="true">…</span>}</>;}
export function PageLink({href,label}:{href:string;label:string}){return <Link className="btn btn-outline" href={href} prefetch aria-label={label}><Label label={label}/></Link>;}
