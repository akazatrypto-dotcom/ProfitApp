const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const BOT_TOKEN = '8549179163:AAHlUhn6V7h-fWzwNBVC4OHsoORsUMsrFpk';
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const ADMIN_ID = '7812317222';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-vercel-app.vercel.app';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize Telegram Bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.post('/api/send-notification', async (req, res) => {
    try {
        const { message, adminId } = req.body;
        
        // Verify admin
        if (adminId !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Get all users from database
        const { data: users, error } = await supabase
            .from('users')
            .select('telegram_id');
            
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Send notification to all users
        const promises = users.map(user => {
            return bot.sendMessage(user.telegram_id, message).catch(err => {
                console.error(`Failed to send message to ${user.telegram_id}:`, err);
            });
        });
        
        await Promise.all(promises);
        
        res.json({ success: true, message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/add-project', async (req, res) => {
    try {
        const { category, section, name, image, description, link, adminId } = req.body;
        
        // Verify admin
        if (adminId !== ADMIN_ID) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Add project to database
        const { data, error } = await supabase
            .from('projects')
            .insert([
                {
                    category,
                    section,
                    name,
                    image_url: image,
                    description,
                    registration_link: link,
                    created_at: new Date().toISOString()
                }
            ]);
            
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ success: true, message: 'Project added successfully' });
    } catch (error) {
        console.error('Error adding project:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Telegram Bot Handlers
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const user = msg.from;
    
    try {
        // Save user to database
        const { error } = await supabase
            .from('users')
            .upsert([
                {
                    telegram_id: user.id.toString(),
                    first_name: user.first_name,
                    last_name: user.last_name || null,
                    username: user.username || null,
                    language_code: user.language_code || 'en',
                    last_active: new Date().toISOString()
                }
            ], { onConflict: 'telegram_id' });
            
        if (error) {
            console.error('Database error:', error);
        }
        
        // Create full name
        const fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        
        // Send welcome message with photo and buttons
        const welcomeMessage = `Welcome to Profit App, ${fullName} 🚀\n\nI'll help you earn your first dollar online for free 💸\n\nWhat are you waiting for? Explore Profit App now!`;
        
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: 'Open 🚀',
                        url: 'https://t.me/ProfitAppBot/open'
                    },
                    {
                        text: 'Channel 📌',
                        url: 'https://t.me/MoneyCatsPromoCode'
                    }
                ]
            ]
        };
        
        await bot.sendPhoto(chatId, 'https://raw.githubusercontent.com/akazatrypto-dotcom/Images1/refs/heads/main/%D8%A8%D8%AF%D9%88%D9%86%20%D8%A7%D8%B3%D9%85156_20260128132246.jpg', {
            caption: welcomeMessage,
            reply_markup: keyboard
        });
        
    } catch (error) {
        console.error('Error handling /start command:', error);
        bot.sendMessage(chatId, 'An error occurred, please try again.');
    }
});

// Handle other messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }
    
    try {
        // Update user's last active time
        await supabase
            .from('users')
            .update({ last_active: new Date().toISOString() })
            .eq('telegram_id', userId);
            
        // Send default response with same buttons as /start
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: 'Open 🚀',
                        url: 'https://t.me/ProfitAppBot/open'
                    },
                    {
                        text: 'Channel 📌',
                        url: 'https://t.me/MoneyCatsPromoCode'
                    }
                ]
            ]
        };
        
        bot.sendMessage(chatId, 'Use the buttons below to access Profit App:', {
            reply_markup: keyboard
        });
        
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Error handling
bot.on('error', (error) => {
    console.error('Telegram Bot Error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Bot is running...`);
});

module.exports = app;