const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();

/* ENV */
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_ID = process.env.ADMIN_ID;
const WEB_APP_URL = process.env.WEB_APP_URL;

/* Clients */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const bot = new TelegramBot(BOT_TOKEN);

/* Middleware */
app.use(express.json());
app.use(express.static("."));

/* Home */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* Telegram Webhook */
app.post("/api/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

/* API */
app.post("/api/send-notification", async (req, res) => {
  const { message, adminId } = req.body;
  if (adminId !== ADMIN_ID) return res.status(403).json({ error: "Unauthorized" });

  const { data: users } = await supabase.from("users").select("telegram_id");
  await Promise.all(
    users.map(u => bot.sendMessage(u.telegram_id, message).catch(() => {}))
  );

  res.json({ success: true });
});

app.post("/api/add-project", async (req, res) => {
  const { category, section, name, image, description, link, adminId } = req.body;
  if (adminId !== ADMIN_ID) return res.status(403).json({ error: "Unauthorized" });

  await supabase.from("projects").insert([{
    category,
    section,
    name,
    image_url: image,
    description,
    registration_link: link,
    created_at: new Date().toISOString()
  }]);

  res.json({ success: true });
});

app.get("/api/projects", async (req, res) => {
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  res.json({ projects: data });
});

/* BOT */
bot.onText(/\/start/, async msg => {
  const chatId = msg.chat.id;
  const user = msg.from;

  await supabase.from("users").upsert([{
    telegram_id: user.id.toString(),
    first_name: user.first_name,
    last_name: user.last_name || null,
    username: user.username || null,
    language_code: user.language_code || "en",
    last_active: new Date().toISOString()
  }], { onConflict: "telegram_id" });

  await bot.sendMessage(chatId, "Welcome to Profit App 🚀", {
    reply_markup: {
      inline_keyboard: [[
        { text: "Open 🚀", url: WEB_APP_URL },
        { text: "Channel 📌", url: "https://t.me/MoneyCatsPromoCode" }
      ]]
    }
  });
});

/* ❌ لا app.listen */
module.exports = app;
