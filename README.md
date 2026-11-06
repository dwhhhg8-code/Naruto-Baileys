# ⚡ FLASH Baileys

نسخة معدّلة ومحسّنة من مكتبة Baileys لبوتات واتساب متعددة الأجهزة.
المالك: **haitham (dwhhhg8-code)** — مع **vhbvhb69-ai**.

## التثبيت

اربط المكتبة مباشرة من الريبو في `package.json` بتاع البوت:

```json
"dependencies": {
  "@whiskeysockets/baileys": "github:dwhhhg8-code/Naruto-Baileys"
}
```

أو من npm:

```bash
npm install flash-baileys
```

## المتطلبات

- Node.js `>= 20`
- `ffmpeg` مثبّت على النظام لو محتاج تحويل/استخراج صوت وفيديو

## الاستخدام

```js
const { default: makeWASocket, useMultiFileAuthState } = require('flash-baileys')

const start = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const sock = makeWASocket({ auth: state, printQRInTerminal: false })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', ({ connection }) => {
    if (connection === 'open') console.log('connected ✅')
  })
}

start()
```

## اللي اتعدّل في النسخة دي

- إزالة الإعلانات المدمجة: متابعة القنوات التلقائية وحقن
  `forwardedNewsletterMessageInfo` في الرسائل، وكمان اللي كان محقون في رسائل
  الألبوم (`handleAlbum`).
- المكتبة مبقتش تعمل `console.clear()` ولا تطبع بانر أول ما تتعمل لها import.
  لو عايز البانر شغّله بـ `FLASH_BAILEYS_BANNER=1`.
- إصلاح `assertColor` اللي كان بيرجّع `undefined` مع الألوان الرقمية.
- `requestPairingCode` بقى بيولّد كود عشوائي آمن لو مفيش كود مخصص، وبيرفض
  أي كود مش 8 حروف.
- إضافة handler الرسائل القائمة (`listMessage`) الناقص.
- توحيد اسم حقل `songId` مع ملف الـ proto.

## الترخيص

MIT — شوف [LICENSE](./LICENSE). مبني على
[WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys).
