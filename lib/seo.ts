import type { Metadata } from 'next';

export const siteConfig = {
  name: 'BrewMaestro',
  title: 'BrewMaestro — App cervecera con IA para dominar tu arte',
  description:
    'Calculadoras pro, guía inteligente y comunidad para llevar tus cervezas al siguiente nivel.',
  url: 'https://brewmaestro.app',
  twitterHandle: '@brewmaestroapp',
  ogImage: '/og.jpg',
  ogImageAlt: 'Logo BrewMaestro con icono cebada-M y hop, fondo Deep Brew.'
};

export const createMetadata = (overrides?: Metadata): Metadata => {
  const baseMetadata: Metadata = {
    metadataBase: new URL(siteConfig.url),
    title: siteConfig.title,
    description: siteConfig.description,
    applicationName: siteConfig.name,
    alternates: {
      canonical: '/' as const
    },
    openGraph: {
      type: 'website',
      url: '/',
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: siteConfig.ogImageAlt
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      creator: siteConfig.twitterHandle,
      title: siteConfig.title,
      description: siteConfig.description,
      images: [siteConfig.ogImage]
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico'
    }
  };

  return {
    ...baseMetadata,
    ...overrides,
    openGraph: {
      ...baseMetadata.openGraph,
      ...overrides?.openGraph
    },
    twitter: {
      ...baseMetadata.twitter,
      ...overrides?.twitter
    }
  };
};
