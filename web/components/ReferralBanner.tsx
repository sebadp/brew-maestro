'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'brewmaestro-referral-banner-dismissed';

const ReferralBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="bg-surface text-sm" role="region" aria-label="Referral message">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="text-muted">
          Invita a otro maestro cervecero y ambos desbloquean una sesión con nuestro equipo de expertos.
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar aviso de referidos"
          className="rounded-full p-1 text-muted transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default ReferralBanner;
