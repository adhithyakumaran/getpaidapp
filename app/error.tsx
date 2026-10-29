'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}) {
  return <div className="shell text-page" role="alert"><h1>This page could not be loaded.</h1><p>Please try again. Your search can be continued from the offer directory.</p><button className="btn btn-primary" onClick={reset}>Try again</button><Link className="btn btn-outline error-browse" href="/search">Browse offers</Link></div>;
}
