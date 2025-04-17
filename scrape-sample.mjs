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
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

  for (let url of URLs) {
    try {
          await page.goto(url, { waitUntil: "networkidle2" });
          //カレンダー上部の月を選択する
          const months = await page.$$eval("ul.calendar-month a", (elements) => 
            elements.map((el) => el.getAttribute("data-m"))
          );

          console.log("取得した月：", months);

          for(const month of months) {
            const selector = `a[data-m="${month}"]`;

            await page.waitForSelector(selector);
            await page.click(selector);
            await page.waitForFunction(
              (selector) => document.querySelector(selector)?.classList.contains("active"),
              {},
              selector
            );
            //ページ描写が間に合ってなくて出演情報を取れてないけど、どうすりゃいいかわからぬ
          }

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
  return null;
}

scrape();