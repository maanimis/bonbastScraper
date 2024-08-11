const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

class BonbastScraper {
  async initDriver() {
    const browser = await puppeteer.launch({
      headless: "new", // Runs in headless mode
      timeout: 0,
      defaultViewport: null,

      args: [
        "--proxy-server=http://127.0.0.1:20171",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
      executablePath: "/usr/bin/google-chrome-stable",
    });
    return browser;
  }

  async extract() {
    const browser = await this.initDriver();
    const page = await browser.newPage();
    await page.goto("https://www.bonbast.com");

    const html = await page.content();
    const $ = cheerio.load(html);
    const currencies = $("table.table.table-condensed");
    const data = {};

    currencies.each((_, table) => {
      $(table)
        .find("tr")
        .each((_, row) => {
          const cells = $(row).find("td");
          if (cells.length === 4) {
            const code = $(cells[0]).text().trim();
            const sell = $(cells[2]).text().trim();
            const buy = $(cells[3]).text().trim();
            data[code] = [sell, buy];
          }
        });
    });

    await browser.close();
    return data;
  }
}

(async () => {
  const bonbast = new BonbastScraper();
  const data = await bonbast.extract();
  console.log(data);
})();
