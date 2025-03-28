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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

  for (let url of URLs) {
    try {
          await page.goto(url, { waitUntil: "networkidle2" });
          //日単位で要素を取得
          const results = await page.evaluate(() => {
            const scheduleBlocks = Array.from(document.querySelectorAll("div.schedule-block"));
            const extractedData = [];

            scheduleBlocks.forEach((block) => {
              //idから日付取得
              const date = block.id.replace("schedule", "");

              //イベント単位で取得
              const scheduleTimes = Array.from(block.querySelectorAll("div.schedule-time"));
              scheduleTimes.forEach((schedule) => {
                const textContent = schedule.innerText.trim();

                if(textContent.includes("エルフ")){
                  extractedData.push({
                    date: date,
                    event: textContent,
                  });
                }
              });
            });

            return extractedData;
          });
          console.log(results);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }

  await browser.close();
  return newShows;
}

scrape();