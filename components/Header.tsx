'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { label: 'Valores', href: '#valores' },
  { label: 'Cómo funciona', href: '#como-funciona' },
  { label: 'Características', href: '#caracteristicas' },
  { label: 'Niveles', href: '#niveles' },
  { label: 'Recetas', href: '#recetas' },
  { label: 'Precios', href: '#precios' },
  { label: 'FAQ', href: '#faq' }
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Ir al inicio">
          <span className="relative h-10 w-10">
            <Image
              src="/logo.svg"
              alt="Logotipo BrewMaestro"
              fill
              sizes="40px"
              priority
            />
          </span>
          <span className="text-lg font-semibold text-foreground">BrewMaestro™</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Navegación principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="#download"
            className="hidden rounded-full border border-transparent bg-maestro px-4 py-2 text-sm font-semibold text-deep transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 md:inline-flex"
          >
            Probar BrewMaestro
          </Link>
          <button
            type="button"
            onClick={handleToggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="rounded-full border border-border p-2 md:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav id="mobile-nav" className="border-t border-border bg-background md:hidden" aria-label="Navegación móvil">
          <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-2 text-sm text-muted transition hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="#demo"
              onClick={closeMenu}
              className="rounded-full border border-water px-4 py-2 text-sm font-semibold text-water transition hover:bg-water/10"
            >
              Ver demo interactiva
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
