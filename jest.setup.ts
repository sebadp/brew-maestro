import '@testing-library/jest-dom';
import React from 'react';

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string) {
    this.store[key] = value;
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
  configurable: true,
  writable: true
});

jest.mock('next/image', () => {
  const ActualNextImage = jest.requireActual('next/image');
  return {
    __esModule: true,
    ...ActualNextImage,
    default: React.forwardRef<HTMLImageElement, React.ComponentProps<'img'>>(
      ({ src, alt, ...props }, ref) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={ref} src={typeof src === 'string' ? src : ''} alt={alt ?? ''} {...props} />
      )
    )
  };
});
