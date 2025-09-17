"use client";

import { PDFContainerElement } from './pdf-container-element';
import { PDFContainerConfig } from './pdf-container-config';

type InitializerConfig = PDFContainerConfig & {
  target: Element,
}

if (typeof window !== 'undefined' && typeof window.customElements !== "undefined") {
  customElements.define('pdf-container', PDFContainerElement as CustomElementConstructor);
}

function initContainer(config: InitializerConfig) {
  const { target: _target, ...containerConfig } = config;
  const pdfContainerElement = document.createElement('pdf-container') as any;
  pdfContainerElement.config = containerConfig;
  config.target.appendChild(pdfContainerElement);
  return pdfContainerElement;
}

export default {
  init: (
    config: InitializerConfig,
  ): ReturnType<typeof initContainer> | undefined => {
    return initContainer(config);
  }
}