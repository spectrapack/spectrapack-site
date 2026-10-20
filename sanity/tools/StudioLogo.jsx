import React from 'react';

/** Spectra Pack's logo in the studio's top-left, instead of a generic initial. */
export default function StudioLogo() {
  return (
    <img
      src="/assets/images/brand/logo.svg"
      alt="Spectra Pack"
      style={{ height: 24, width: 'auto', display: 'block' }}
    />
  );
}
