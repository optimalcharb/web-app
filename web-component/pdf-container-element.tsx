/** @jsxImportSource preact */
"use client";

import { h, render } from 'preact';
import { PDFContainerPreact } from './pdf-container-preact';
import { PDFContainerConfig } from './pdf-container-config';

const PDFContainerElement = typeof window !== 'undefined'
  // Custom HTML element for pdfviewer
  ? class PDFContainerElementImplementation extends HTMLElement {
    private root: ShadowRoot;
    private _config: PDFContainerConfig | null = null;

    constructor() {
      super();
      this.root = this.attachShadow({ mode: 'open' });
    }

    get config(): PDFContainerConfig | null {
      return this._config;
    }

    set config(value: PDFContainerConfig | null) {
      this._config = value;
      this.render();
    }

    connectedCallback() {
      this.render();
    }

    private render() {
      const defaultConfig: PDFContainerConfig = {
        url: "https://snippet.embedpdf.com/ebook.pdf",
      }
      
      // Render Preact component into shadow root
      render(<PDFContainerPreact config={this._config ?? defaultConfig} />, this.root);
    }
  }
  : class {};

export { PDFContainerElement };