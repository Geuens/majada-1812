// pages/_app.js
import '../styles/global.css';

// Importación de fuentes de Google usando next/font/google
import { Cinzel } from 'next/font/google';
import { Spectral } from 'next/font/google';
import { Coiny } from 'next/font/google';
import { Averia_Libre } from 'next/font/google';
import { Barriecito } from 'next/font/google';
import { Zeyada as Zain } from 'next/font/google'; // Zain no existe; usamos Zeyada
import { Sono } from 'next/font/google';

// Configuración de cada fuente
const cinzel = Cinzel({ subsets: ['latin'], weight: ['700', '900'] });
const spectral = Spectral({ subsets: ['latin'], weight: ['400', '500', '600'] });
const coiny = Coiny({ subsets: ['latin'] });
const averia = Averia_Libre({ subsets: ['latin'] });
const barriecito = Barriecito({ subsets: ['latin'] });
const zain = Zain({ subsets: ['latin'] });
const sono = Sono({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
    <div className={`${cinzel.className} ${spectral.className} ${coiny.className} ${averia.className} ${barriecito.className} ${zain.className} ${sono.className}`}>
      <Component {...pageProps} />
    </div>
  );
}





