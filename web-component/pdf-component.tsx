/** @jsxImportSource react */
"use client";

import { FC, useRef, useEffect } from "react";
import PDFContainerInitializer  from "./pdf-container-initializer";
import { PDFContainerConfig } from "./pdf-container-config";

interface PDFComponentProps extends PDFContainerConfig {}

export const PDFComponent: FC<PDFComponentProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      PDFContainerInitializer.init({
        ...props,
        target: containerRef.current,
      });
    }
  }, [props]);

  return <div ref={containerRef} />;
};