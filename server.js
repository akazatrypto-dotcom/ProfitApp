const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();

/* ================== ENV CHECK ================== */
if (!process.env.BOT_TOKEN) throw new Error("BOT_TOKEN is missing");
if (!process.env.SUPABASE_URL) throw new Error("SUPABASE_URL is missing");
if (!process.env.SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY is missing");
if (!process.env.ADMIN_ID) throw new Error("ADMIN_ID is missing");
if (!process.env.WEB_APP_URL) throw new Error("WEB_APP_URL is missing");

/* ================== CONFIG ================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_ID = process.env.ADMIN_ID;
const WEB_APP_URL = process.env.WEB_APP_URL;

/* ================== CLIENTS ================== */
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let bot;
function getBot() {
  if (!bot) {
    bot = new TelegramBot(BOT_TOKEN);
  }
  return bot;
}

/* ================== MIDDLEWARE ================== */
app.use(express.json());
app.use(express.static("."));

/* ================== ROUTES ================== */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Telegram Webhook
app.post("/api/webhook", (req, res) => {
  getBot().processUpdate(req.body);
  res.sendStatus(200);
});

// Get projects
app.get("/api/projects", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({ projects: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Add project (admin only)
app.post("/api/add-project", async (req, res) => {
  try {
    const { category, section, name, image, description, link, adminId } = req.body;
    if (adminId !== ADMIN_ID) return res.status(403).json({ error: "Unauthorized" });

    const { error } = await supabase.from("projects").insert([{
      category,
      section,
      name,
      image_url: image,
      description,
      registration_link: link,
      created_at: new Date().toISOString()
    }]);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add project" });
  }
});

// Send notification (admin only)
app.post("/api/send-notification", async (req, res) => {
  try {
    const { message, adminId } = req.body;
    if (adminId !== ADMIN_ID) return res.status(403).json({ error: "Unauthorized" });

    const { data: users, error } = await supabase
      .from("users")
      .select("telegram_id");

    if (error) throw error;

    await Promise.all(
      users.map(u =>
        getBot().sendMessage(u.telegram_id, message).catch(() => {})
      )
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

/* ================== BOT HANDLERS ================== */

getBot().onText(/\/start/, async msg => {
  const chatId = msg.chat.id;
  const user = msg.from;

  try {
    await supabase.from("users").upsert([{
      telegram_id: user.id.toString(),
      first_name: user.first_name,
      last_name: user.last_name || null,
      username: user.username || null,
      language_code: user.language_code || "en",
      last_active: new Date().toISOString()
    }], { onConflict: "telegram_id" });

    await getBot().sendMessage(
      chatId,
      "Welcome to Profit App 🚀\nStart earning online now 💸",
      {
        reply_markup: {
          inline_keyboard: [[
            { text: "Open 🚀", url: WEB_APP_URL },
            { text: "Channel 📌", url: "https://t.me/MoneyCatsPromoCode" }
          ]]
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
});

/* ================== EXPORT ================== */
module.exports = app;
