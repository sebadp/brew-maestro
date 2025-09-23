import Link from 'next/link';

const footerLinks = [
  { label: 'Privacidad', href: '#privacidad' },
  { label: 'Términos', href: '#terminos' },
  { label: 'Contacto', href: '#contacto' }
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-foreground">BrewMaestro™ — Master Your Craft</p>
          <p className="mt-2">© 2025. Trademark pending. Todos los derechos reservados.</p>
        </div>
        <nav className="flex gap-6" aria-label="Enlaces del pie de página">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
