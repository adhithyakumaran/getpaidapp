import Link from 'next/link';
export default function NotFound() {
  return <div className="shell text-page"><h1>That page is not available.</h1><p>The offer may be unpublished, or the address may be incorrect.</p><Link className="btn btn-primary" href="/search">Browse offers</Link></div>;
}
