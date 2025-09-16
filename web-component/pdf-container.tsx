"use client";

import { FC, useEffect } from "react";
import { definePDFContainer } from "./pdf-container-element";

interface PDFContainerProps {
  url: string;
}

const PDFContainer: FC<PDFContainerProps> = ({ url }) => {
  useEffect(() => {
    // Define the custom element when the component mounts
    definePDFContainer();
  }, []);

  return <pdf-container url={url} />;
};

// Optionally, use dynamic import to ensure client-side rendering
import dynamic from "next/dynamic";

export default dynamic(() => Promise.resolve(PDFContainer), { ssr: false });