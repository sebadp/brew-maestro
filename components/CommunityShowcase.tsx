const recipes = [
  {
    name: 'Solar Saison',
    style: 'Farmhouse',
    highlight: 'Fermentación mixta con perfil cítrico balanceado'
  },
  {
    name: 'Lúpulo Nebuloso',
    style: 'Hazy IPA',
    highlight: 'Dry hop escalonado y control preciso de turbidez'
  },
  {
    name: 'Maltas del Valle',
    style: 'Vienna Lager',
    highlight: 'Perfil de agua ajustado para caramelos sutiles'
  }
];

const CommunityShowcase = () => {
  return (
    <section id="recetas">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-semibold text-foreground">Recetas de la comunidad</h2>
          <p className="mt-3 text-body text-muted">
            Descubre creaciones destacadas y aprende de los maestros que ya optimizan sus lotes con BrewMaestro.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.name}
              className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <p className="text-small font-semibold uppercase tracking-wide text-hop">{recipe.style}</p>
              <h3 className="mt-4 text-h3 font-semibold text-foreground">{recipe.name}</h3>
              <p className="mt-2 text-body text-muted">{recipe.highlight}</p>
              <p className="mt-4 text-small text-muted">Compartida por la comunidad BrewMaestro</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityShowcase;
