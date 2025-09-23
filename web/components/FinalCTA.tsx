const FinalCTA = () => {
  return (
    <section id="download">
      <div className="mx-auto max-w-content rounded-3xl border border-border bg-surface px-6 py-16 text-center shadow-card-hover sm:px-10">
        <h2 className="text-h2 font-semibold text-foreground">Tu viaje a la maestría comienza hoy</h2>
        <p className="mt-4 text-body-lg text-muted">
          Descarga BrewMaestro y suma tu experiencia a una comunidad que comparte conocimiento, precisión y pasión por la cerveza.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#download"
            className="inline-flex items-center justify-center rounded-full bg-maestro px-8 py-3 text-sm font-semibold text-deep transition hover:brightness-105"
          >
            Descargar BrewMaestro
          </a>
          <a
            href="#recetas"
            className="inline-flex items-center justify-center rounded-full border border-water px-8 py-3 text-sm font-semibold text-water transition hover:bg-water/10"
          >
            Explorar recetas de la comunidad
          </a>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
