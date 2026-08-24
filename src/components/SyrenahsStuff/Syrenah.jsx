import React from 'react';
import AboutMe from './AboutMe';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
function Syrenah() {
  return (
    <div>
      <AboutMe />

      <div style={{ height: '750px' }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer fileUrl="src\components\SyrenahsStuff\ExprienceSyrenahStein.pdf" />
        </Worker>
      </div>
    </div>
  );
}

export default Syrenah;
