const faqs = [
  {
    question: '¿Necesito equipo especial?',
    answer: 'No, empieza con tu setup actual y escala cuando quieras.'
  },
  {
    question: '¿Qué tan técnica es la app?',
    answer: 'Explicamos conceptos complejos con claridad y contexto.'
  },
  {
    question: '¿La IA decide por mí?',
    answer: 'No: sugiere; tú tomas las decisiones.'
  },
  {
    question: '¿Funciona offline?',
    answer: 'Sí, los elementos clave del brewday funcionan sin conexión.'
  }
];

const FAQ = () => {
  return (
    <section id="faq">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-semibold text-foreground">Preguntas frecuentes</h2>
          <p className="mt-3 text-body text-muted">Resolvemos tus dudas antes del siguiente batch.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <summary className="text-left text-body-lg font-semibold text-foreground">
                {faq.question}
              </summary>
              <p className="mt-4 text-body text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
