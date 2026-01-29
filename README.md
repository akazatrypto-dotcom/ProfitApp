# Profit App - Telegram Mini App

تطبيق Telegram مصغر لمساعدة المستخدمين في كسب أول دولار من الإنترنت من خلال منصات التداول ومحافظ العملات الرقمية.

## المميزات

- 🎯 شاشة ترحيب تفاعلية مع عرض شرائح
- 👤 صفحة الملف الشخصي مع معلومات المستخدم
- 💰 صفحة المحافظ (منصات التداول، محافظ TON، محافظ Web3)
- 💎 صفحة الربح (بوتات Telegram، مواقع، تطبيقات)
- ⚙️ صفحة الإعدادات مع الوضع الداكن
- 🔧 لوحة تحكم للإدارة (للأدمن فقط)
- 📱 تصميم متجاوب يعمل على جميع الأجهزة

## قواعد البيانات المطلوبة (Supabase)

### جدول المستخدمين (users)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    username VARCHAR(100),
    language_code VARCHAR(10) DEFAULT 'en',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول المشاريع (projects)
```sql
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'wallets' or 'earn'
    section VARCHAR(50) NOT NULL, -- 'exchange', 'ton', 'web3', 'bots', 'sites', 'apps'
    name VARCHAR(200) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    registration_link TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول الإشعارات (notifications)
```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    sent_by VARCHAR(50) NOT NULL, -- admin telegram_id
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipients_count INTEGER DEFAULT 0
);
```

## خطوات النشر

### 1. إعداد قاعدة البيانات (Supabase)

1. انتقل إلى [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. في SQL Editor، قم بتشغيل الاستعلامات أعلاه لإنشاء الجداول
4. احفظ URL المشروع و Anon Key

### 2. إعداد المستودع (GitHub)

1. أنشئ مستودع جديد على GitHub
2. ارفع جميع الملفات إلى المستودع
3. تأكد من أن جميع الملفات موجودة في الجذر

### 3. النشر على Vercel

1. انتقل إلى [Vercel](https://vercel.com)
2. اربط حسابك مع GitHub
3. اختر "New Project"
4. اختر المستودع الخاص بك
5. في إعدادات Environment Variables، أضف:
   - `SUPABASE_URL`: رابط مشروع Supabase
   - `SUPABASE_ANON_KEY`: مفتاح Supabase
   - `WEB_APP_URL`: سيتم إنشاؤه تلقائياً بعد النشر
6. اضغط Deploy

### 4. إعداد البوت

1. انتقل إلى [@BotFather](https://t.me/BotFather) على Telegram
2. استخدم الأمر `/setmenubutton` واختر البوت
3. أضف زر القائمة:
   - Text: "🚀 فتح Profit App"
   - URL: رابط Vercel الخاص بك

### 5. تحديث رابط التطبيق

بعد النشر على Vercel:
1. انسخ الرابط الذي تم إنشاؤه (مثل: https://your-app.vercel.app)
2. في إعدادات Vercel، حدث متغير `WEB_APP_URL`
3. في ملف `server.js`، تأكد من أن `WEB_APP_URL` يشير للرابط الصحيح

## التطوير المحلي

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم
npm run dev
```

## معلومات البوت

- **اسم البوت**: Profit App
- **يوزر البوت**: @ProfitAppBot
- **توكن البوت**: 8549179163:AAHlUhn6V7h-fWzwNBVC4OHsoORsUMsrFpk
- **آيدي الأدمن**: 7812317222

### الرسالة الترحيبية

عند إرسال `/start` للبوت، يتلقى المستخدم:
- **صورة**: شعار التطبيق
- **رسالة**: "Welcome to Profit App, [الاسم الكامل] 🚀\nI'll help you earn your first dollar online for free 💸\nWhat are you waiting for? Explore Profit App now!"
- **أزرار**:
  - Open 🚀 → https://t.me/ProfitAppBot/open
  - Channel 📌 → https://t.me/MoneyCatsPromoCode

## الاستخدام

### للمستخدمين العاديين:
1. ابدأ محادثة مع البوت `/start`
2. اضغط على زر "فتح Profit App"
3. تصفح المنصات والمشاريع المتاحة
4. انقر على أي مشروع لمعرفة التفاصيل والتسجيل

### للأدمن:
1. افتح التطبيق
2. انتقل إلى صفحة الإعدادات
3. اضغط على "Control Panel"
4. يمكنك:
   - إرسال إشعارات لجميع المستخدمين
   - إضافة مشاريع جديدة

## الدعم الفني

للدعم الفني، تواصل مع:
- المطور: [@hamza_king_crypto](https://t.me/hamza_king_crypto)
- القناة الرسمية: [@MoneyCatsPromoCode](https://t.me/MoneyCatsPromoCode)

## الترخيص

MIT License