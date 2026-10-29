export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Coupon Intelligence</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed">
        Find offers with clear conditions and traceable sources.
      </p>
      <section className="mt-12 border-t border-base-300 pt-8" aria-labelledby="availability">
        <h2 id="availability" className="text-xl font-semibold">Offers are coming</h2>
        <p className="mt-3 leading-relaxed text-base-content/75">
          We are preparing our first collection of Amazon India electronics offers.
          No live coupons are available yet.
        </p>
      </section>
    </main>
  );
}
