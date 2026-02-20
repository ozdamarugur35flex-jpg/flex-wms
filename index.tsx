import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("Flex WMS: Önyükleme başlatıldı...");

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Flex WMS: Render başarıyla tetiklendi.");
  } catch (err) {
    console.error("Flex WMS Render Hatası:", err);
    throw err; // index.html üzerindeki onerror bunu yakalayacaktır
  }
} else {
  console.error("Hata: 'root' elementi bulunamadı!");
}