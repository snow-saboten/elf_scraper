const axios = require("axios");
const cheerio = require("cheerio");
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
  let newShows = [];

  for (let url of URLs) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      $("a").each((_, element) => {
        const text = $(element).text().trim();
        if (text.includes("エルフ")) {
          newShows.push({
            title: text,
            link: url,
          });
        }
      });
    } catch (error) {
      console.error(`Error fetching ${url}:`, error.message);
    }
  }

  return newShows;
}

// LINEメッセージ送信関数
async function sendLineMessage(message) {
    try {
      await axios.post(
        "https://api.line.me/v2/bot/message/broadcast",
        {
          messages: [{ type: "text", text: message }],
        },
        {
          headers: {
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Notification sent!");
    } catch (error) {
      console.error("Error sending LINE message:", error.message);
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
    await sendLineNotify(`🎭 新しい「エルフ」の公演が見つかりました！\n\n${message}`);

    // 最新のデータを保存
    fs.writeFileSync(ARTIFACT_FILE, JSON.stringify(newShows, null, 2));
  } else {
    console.log("No new updates.");
  }
})();
