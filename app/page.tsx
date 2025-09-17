"use client"

import {PDFComponent} from "../web-component/pdf-component";
import { PDFContainerConfig } from "../web-component/pdf-container-config";

export default function Home() {
  return (
    <div>
      <h1>My PDF Viewer Page</h1>
      <PDFComponent url="https://snippet.embedpdf.com/ebook.pdf" />
    </div>
  );
}