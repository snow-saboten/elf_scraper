import puppeteer from 'puppeteer';

const URLs = [
    "https://jimbocho-manzaigekijyo.yoshimoto.co.jp/schedule/",
    "https://ngk.yoshimoto.co.jp/schedule/",
    // "https://lumine.yoshimoto.co.jp/schedule/",
    // "https://gion.yoshimoto.co.jp/",
    // "https://manzaigekijyo.yoshimoto.co.jp/schedule/",
    // "https://morinomiya-manzaigekijyo.yoshimoto.co.jp/schedule/",
    // "https://mugendai.yoshimoto.co.jp/schedule/",
    // "https://mugendai-dome.yoshimoto.co.jp/schedule/",
    // "https://makuhari.yoshimoto.co.jp/",
    // "https://omiya.yoshimoto.co.jp/schedule/",
    // "https://fukuokagekijyo.yoshimoto.co.jp/schedule/",
    // "https://numazu.yoshimoto.co.jp/schedule/",
    // "https://dotonbori.yoshimoto.co.jp/schedule/",
  ];



async function scrape() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  let newShows = [];

  for (let url of URLs) {
    try {
        await page.goto(url);
        const blocks = await page.evaluate(() => document.querySelectorAll('div.schedule-block'));

        console.log(blocks.item(0));

    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }

  await browser.close();
  console.log(newShows);
  return newShows;
}

scrape();