const levels = [
  {
    name: 'Principiantes',
    headline: 'Empieza con confianza',
    description: 'Recetas guiadas y resultados consistentes.'
  },
  {
    name: 'Intermedios',
    headline: 'Experimenta con precisión',
    description: 'Variables controladas, mejoras claras.'
  },
  {
    name: 'Avanzados',
    headline: 'Optimiza y lidera',
    description: 'Consistencia lote a lote y herramientas de nivel pro.'
  }
];

const Levels = () => {
  return (
    <section id="niveles">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-semibold text-foreground">Niveles para crecer sin límites</h2>
          <p className="mt-3 text-body text-muted">
            Avanza a tu ritmo con contenido curado para cada etapa del camino cervecero.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {levels.map((level) => (
            <article
              key={level.name}
              className="rounded-2xl border border-border bg-surface p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]"
            >
              <p className="text-small font-semibold uppercase tracking-wide text-hop">{level.name}</p>
              <h3 className="mt-4 text-h3 font-semibold text-foreground">{level.headline}</h3>
              <p className="mt-2 text-body text-muted">{level.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Levels;
