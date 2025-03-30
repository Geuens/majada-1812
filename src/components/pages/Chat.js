import React from 'react';
import './Chat.css';
import './General.css';

function Chat() {
  return (
    <div className="section-container">
      <h2>Contacto</h2>

      <div className="chat-info-container">
        <h1 className="main-title"><strong>¿Quienes somos?</strong></h1>

        <p className="info-content">
          <strong>Correo electrónico:</strong> majada1812@gmail.com
        </p>
        <p className="info-content">
          <strong>Dirección:</strong> Alonso de Fuenteblanca Mojada
        </p>
        <p className="info-content">
          <strong>Redactores:</strong> Alonso de Fuenteblanca Mojada y Lázaro Majara y el Río, son los pseudónimos de los dos majariegos responsables de la dirección y redacción de majada 1812. Los vecinos prefieren mantener su identidad en el anonimato por el momento.
        </p>

        <h1 className="founder-title"><strong>Alonso de Fuenteblanca Mojada</strong></h1>
        <div className="info-content">
          <p>
            Alonso de Fuenteblanca Mojada nació en Madrid el <strong>15 de mayo de 1984</strong>. Tras terminar sus estudios en <strong>Historia del Arte</strong> en la Universidad Complutense de Madrid en 2007, se dedicó a la restauración de obras de arte.
          </p>
          <p>
            En 2010, dejó España y viajó a Camerún, donde pasó dos años viviendo con una tribu de pigmeos en la región de Ngoya, cerca del río Dja. Durante su estancia, encontró una máscara ritual de madera que le reveló la verdadera conexión entre Europa y la tribu pigmea.
            En 2013, Alonso se trasladó a Madagascar, donde trabajó en la restauración de una iglesia en Antananarivo, construida en 1852 por un misionero anglicano que, según los registros, tenía una extraña adicción a la bebida.
          </p>
          <p>
            Hoy en día, Alonso vive en Majadahonda, y se dedica a la restauración. Pocos saben que en su hogar en majadahonda conserva una colección de más de cien máscaras africanas.
          </p>
        </div>

        <h1 className="founder-title"><strong>Lázaro Majara y el Río</strong></h1>
        <div className="info-content">
          <p>
            Lázaro Majara y el Río nació en Segovia el <strong>20 de septiembre de 1982</strong>. Tras completar sus estudios como <strong>ingeniero de montes y caminos</strong> en la Universidad de Salamanca, donde participó en la tuna universitaria, decidió cambiar de rumbo.
          </p>
          <p>
            En 2009, se trasladó a Alaska, buscando una vida distinta como pescador de cangrejos reales en Kodiak. Durante su primer invierno en la isla, una tormenta lo dejó varado en una isla deshabitada por tres días, sobreviviendo solo a base de moluscos y caracoles.
            Fue rescatado por un grupo de pescadores de gambas de Dutch Harbor. Durante esos días, Lázaro asegura haber tenido una extraña visión de un búfalo de tres ojos que le susurraba un y otra vez “Lazarillo el Monaguillo, Lazarillo el Monaguillo...”.
          </p>
          <p>
            A su regreso a España en 2011, se interesó por la recolección de plantas raras, algunas de Alaska y otras de regiones remotas de Escocia y Noruega, que cultiva en su jardín.
            Actualmente, Lázaro vive en Majadahonda, donde guarda un extraño invernadero en su casa, lleno de plantas exóticas que nunca muestra a nadie.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Chat;
