/** @jsxImportSource preact */
"use client";

import { h, render } from 'preact';
import { PDFContainerPreact } from './pdf-container-preact';

export function definePDFContainer() {
  if (typeof window !== "undefined" && typeof window.customElements !== "undefined") {
    // Custom HTML element for pdfviewer
    class PDFContainerElement extends HTMLElement {
      private root: ShadowRoot;

      constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
      }

      connectedCallback() {
        this.renderContainer();
      }

      private renderContainer() {
        const url = this.getAttribute("url") || "https://snippet.embedpdf.com/ebook.pdf";
        
        // Render Preact component into shadow root
        render(<PDFContainerPreact url={url} />, this.root);
      }
    }

    if (!customElements.get("pdf-container")) {
      customElements.define("pdf-container", PDFContainerElement);
    }
  }
}