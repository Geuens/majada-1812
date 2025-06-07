from scrapy.crawler import CrawlerProcess
from scrapy.spiders import Spider
import scrapy


import scrapy

class MajadahondaNoticiasSpider(scrapy.Spider):
    name = "majadahonda_noticias"
    start_urls = ['https://www.majadahonda.org/noticias']

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
        print(f"[INFO] Content HTML snippet: {content_html[:200]}")  # Solo primeros 200 caracteres

        # Aquí podrías guardar o procesar la info (por ejemplo yield a dict)
        yield {
            'url': response.url,
            'title': title,
            'content_html': content_html,
            # 'content_text': content_text,  # si usas texto plano
        }




if __name__ == "__main__":
    process = CrawlerProcess(settings={
        "FEEDS": {
            "output.json": {"format": "json"},
        },
        "USER_AGENT": "Mozilla/5.0",
        "LOG_LEVEL": "ERROR"  # Reduce logging noise, keep only prints
    })

    process.crawl(MajadahondaNoticiasSpider)
    process.start()
    print("\n✅ Finished scraping. Check output.json for full data.")
