from scrapy.crawler import CrawlerProcess
import scrapy
from agent_utils.agent_utils import parse_spanish_date


#SPIDER 1
class MajadahondaNoticiasSpider(scrapy.Spider):
    name = "majadahonda_noticias"
    start_urls = ['https://www.majadahonda.org/noticias']

    custom_settings = {
        "FEEDS": {
            "majadahondanoticias_output.json": {"format": "json", "overwrite": True},
        }
    }

    def parse(self, response):
        # Get all article URLs and dates
        article_links = response.css('a.title-wrapper::attr(href)').getall()
        article_dates = response.css('span.date::text').getall()

        for link, date in zip(article_links, article_dates):
            full_url = response.urljoin(link)
            cleaned_date = date.replace("·", "-")

            # Follow each article URL, passing the date
            yield scrapy.Request(
                url=full_url,
                callback=self.parse_article,
                meta={'date': cleaned_date, 'url': full_url}
            )

    def parse_article(self, response):
        # Extraer el título
        title = response.css('span.header-title::text').get()

        # Extraer el contenido, incluyendo el texto con formato HTML (por ejemplo, párrafos y listas)
        content_html = response.css('div.text').get()

        # También puedes extraer el contenido solo en texto plano, si prefieres:
        # content_text = response.css('div.text *::text').getall()
        # content_text = ' '.join(content_text).strip()

        print(f"[INFO] Article URL: {response.url}")
        print(f"[INFO] Title: {title}")
        print(f"[INFO] Content HTML snippet: {content_html[:20]}")  # Solo primeros 200 caracteres

        # Aquí podrías guardar o procesar la info (por ejemplo yield a dict)
        yield {
            'url': response.url,
            'title': title,
            'content_html': content_html,
            # 'content_text': content_text,  # si usas texto plano
        }

class RayoMajadahondaSpider(scrapy.Spider):
    name = "rayo_majadahonda"
    start_urls = ['https://www.rayomajadahonda.com/']

    custom_settings = {
        "FEEDS": {
            "rayomajadahonda_output.json": {"format": "json", "overwrite": True},
        }
    }

    def parse(self, response):
        # Use the anchor tag with data-hook or distinctive class
        article_links = response.css('a.O16KGI::attr(href)').getall()

        for link in article_links:
            full_url = response.urljoin(link)
            yield scrapy.Request(
                url=full_url,
                callback=self.parse_article
            )

    def parse_article(self, response):
        title = response.css('h1[data-hook="post-title"]::text').get()

        # Extraer todos los textos de párrafos dentro del contenedor principal
        paragraphs = response.css('div.text p *::text, div.text p::text').getall()

        # Si no hay `div.text`, buscar entodo el artículo por si hay otros contenedores
        if not paragraphs:
            paragraphs = response.css('article p *::text, article p::text').getall()

        content = ' '.join([p.strip() for p in paragraphs if p.strip()])

        yield {
            'url': response.url,
            'title': title,
            'content': content
        }


if __name__ == "__main__":
    process = CrawlerProcess(settings={
        "USER_AGENT": "Mozilla/5.0",
        "LOG_LEVEL": "ERROR"
    })

    process.crawl(MajadahondaNoticiasSpider)
    process.crawl(RayoMajadahondaSpider)

    process.start()
    print("\n✅ All spiders finished.")

