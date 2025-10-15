import os
import json
import re
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class Lazaro:
    def __init__(self, input_file, output_dir="articles"):
        self.input_file = input_file
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        self.client = OpenAI(
            api_key=os.getenv("DEEPSEEK_API_KEY"),
            base_url=os.getenv("DEEPSEEK_API_URL")
        )

    def deepseek_api_call(self, prompt):
        response = self.client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            stream=False
        )
        return response.choices[0].message.content.strip()

    def is_noticia(self, content):
        prompt = f"""
¿Es noticia?

Dado el contenido del siguiente texto:
{content}

Analiza el contenido para ver si es interesante para una noticia en un periódico local. Debes valorar si es de interés al lector y a la comunidad.
Deberás poner una nota del 1 al 10. Donde el 1 es una noticia sosa y sin interés y el 10 una noticia extremadamente relevante e informativa.
Responde únicamente y directamente con este formato:

"{{Es noticia: Si/No; Nota: nota numérica}}"
"""
        response = self.deepseek_api_call(prompt)
        return 'Si' in response, response

    def generate_article(self, content):
        prompt = f"""
Con la siguiente información y únicamente con la siguiente información redacta un artículo periodístico informativo en tono neutro y aureliano:

\"\"\"{content}\"\"\"

El artículo debe seguir las siguientes reglas:
1) Debe ser claramente diferenciable del texto original con la información dada, debe aportar un valor añadido.
2) Se debe priorizar la claridad y sencillez para transmitir la información de forma eficaz.
3) Si es procedente, puede reestructurarse información, con bullet points u otros esquemas y resúmenes para poder consumir la información con un simple vistazo.
4) Utiliza negrita y subtítulos para una lectura más fácil y dinámica.
5) El artículo debe tener un **antetítulo**.
6) El primer párrafo del artículo debe captar la atención y hacer entender qué se va a tratar, debe ser la joya de la corona.
"""
        return self.deepseek_api_call(prompt)

    import re

    def format_article_json(self, title, generated_article, date, url):
        prompt = f"""
    Dbes fromatear el contenido de este articulo de la froma indicada.
    El contenido es el siguiente:
    
    \"\"\"{generated_article}\"\"\"
    
    Debes devolver *únicamente* el siguiente JSON, sin ningún texto adicional ni explicaciones:

    {{
      "title": "El titulo que consideres apropiado para el articulo",
      "subtitle": "Aqui debes poner un antetitulo relevante a la noticia",
      "cover": "/data/articles/articles_resources/titulo.jpg",
      "type": "aquie de bes elegir una o varias categroias de la lista [Noticias, Opinion, Cultura y Deporte]
      "link": "el url",
      "date": "fecha de hoy",
      "author": "Lázaro Majara y del Río",
      "content": [
        {{
          "type": "image",
          "src": "/data/articles/articles_resources/titulo.jpg",
          "alt": "descripción imagen"
        }},
        {{
          "type": "paragraph",
          "text": "contenido de los aprafos que se quieran añadir, uno de estos por parrafo",
          "bold": ["PalabraNegrita que se quiera resaltar", "Frase en negrita que se quiera resaltar"]
        }},
        {{
          "type": "subtitle",
          "text": "subtítulos que se quieran añadir"
        }}
      ]
    }}
    """
        raw_response = self.deepseek_api_call(prompt)

        # 🧼 Limpieza para extraer solo el JSON
        try:
            json_text = self.extract_json(raw_response)
            return json.loads(json_text)
        except json.JSONDecodeError as e:
            print("❌ Error: la IA no devolvió un JSON válido.")
            print("Respuesta completa:\n", raw_response)
            raise e

    def save_article_json(self, article_json):
        title_slug = re.sub(r'\W+', '-', article_json['title'].lower())
        filename = os.path.join(self.output_dir, f"{title_slug}.json")
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(article_json, f, ensure_ascii=False, indent=2)
        print(f"✅ Saved article: {filename}")

    def process_articles(self):
        with open(self.input_file, 'r', encoding='utf-8') as f:
            articles = json.load(f)

        for article in articles:
            content = article.get("content_html", "")
            title = article.get("title", "sin_titulo")
            url = article.get("url", "https://majada1812.com")
            date = article.get("date", "2025-06-08")

            es_noticia, evaluacion = self.is_noticia(content)
            print(f"\n📋 Título: {title}")
            print("¿Es noticia?", es_noticia)
            print("Evaluación:", evaluacion)

            if es_noticia:
                generated_article = self.generate_article(content)
                article_json = self.format_article_json(title, generated_article, date, url)
                self.save_article_json(article_json)
            else:
                print("⛔️ No es noticia relevante.")

    def extract_json(self, text):
        # Extrae el primer bloque {...} que parece JSON
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            return match.group(0)
        return ""


if __name__ == "__main__":
    lazaro = Lazaro(input_file="majadahondanoticias_output.json")
    lazaro.process_articles()
