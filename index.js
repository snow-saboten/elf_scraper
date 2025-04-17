const axios = require("axios");
import puppeteer from 'puppeteer';
const fs = require("fs-extra");
require("dotenv").config();

// 監視するURL一覧
const URLs = [
  "https://jimbocho-manzaigekijyo.yoshimoto.co.jp/schedule/",
  "https://ngk.yoshimoto.co.jp/schedule/",
  "https://lumine.yoshimoto.co.jp/schedule/",
  "https://gion.yoshimoto.co.jp/",
  "https://manzaigekijyo.yoshimoto.co.jp/schedule/",
  "https://morinomiya-manzaigekijyo.yoshimoto.co.jp/schedule/",
  "https://mugendai.yoshimoto.co.jp/schedule/",
  "https://mugendai-dome.yoshimoto.co.jp/schedule/",
  "https://makuhari.yoshimoto.co.jp/",
  "https://omiya.yoshimoto.co.jp/schedule/",
  "https://fukuokagekijyo.yoshimoto.co.jp/schedule/",
  "https://numazu.yoshimoto.co.jp/schedule/",
  "https://dotonbori.yoshimoto.co.jp/schedule/",
];

const ARTIFACT_FILE = "previous_data.json";

// LINE Notify トークン（GitHub Secretsで設定）
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// スクレイピング関数
async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
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
return null;
}

// LINEメッセージ送信関数
async function sendMessage(message) {
    try{
        const response = await axios.post(
            "https://api.line.me/v2/bot/message/broadcast",
            {
                messages:[
                    { type: "text", text: message }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                }
            }
        );

        console.log("success", response.data);
    }catch (error) {
        console.error("fail", error.response ? error.response.data : error.message);
    }   
}

// メイン処理
(async function () {
  const newShows = await scrape();

  // 前回のデータを取得
  let previousData = [];
  if (fs.existsSync(ARTIFACT_FILE)) {
    previousData = JSON.parse(fs.readFileSync(ARTIFACT_FILE, "utf-8"));
  }

  // 新しい公演情報があるかチェック
  const updates = newShows.filter(
    (newShow) => !previousData.some((oldShow) => oldShow.title === newShow.title)
  );

  if (updates.length > 0) {
    const message = updates.map((show) => `🎤 ${show.title}\n🔗 ${show.link}`).join("\n\n");
    await sendMessage(`🎭 新しい「エルフ」の公演が見つかりました！\n\n${message}`);

    // 最新のデータを保存
    fs.writeFileSync(ARTIFACT_FILE, JSON.stringify(newShows, null, 2));
  } else {
    console.log("No new updates.");
  }
})();
