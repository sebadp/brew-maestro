import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Recetas base, calculadoras esenciales, comunidad abierta.'
  },
  {
    name: 'Pro',
    price: '$12',
    description: 'Perfiles de agua avanzados, métricas históricas, desafíos premium y exportaciones.'
  }
];

const Pricing = () => {
  return (
    <section id="precios">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-h2 font-semibold text-foreground">Planes para cada propósito</h2>
          <p className="mt-3 text-body text-muted">
            Elige el plan que acompaña tu evolución: empieza gratis y escala cuando lo pida tu cerveza.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]"
            >
              <div>
                <p className="text-small font-semibold uppercase tracking-wide text-hop">{tier.name}</p>
                <p className="mt-4 text-4xl font-semibold text-foreground">{tier.price}</p>
                <p className="mt-2 text-body text-muted">{tier.description}</p>
              </div>
              <Link
                href="#download"
                className="mt-auto inline-flex items-center justify-center rounded-full bg-maestro px-6 py-3 text-sm font-semibold text-deep transition hover:brightness-105"
              >
                Elegir mi plan
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
