# CampusOS — City University, Bangladesh
> **A Student-First Digital Campus Hub | City University Permanent Campus**
> সম্পূর্ণ প্রজেক্ট ডকুমেন্টেশন, পেজ ফিচার গাইড, ওটিপি (OTP) অথেন্টিকেশন এবং লাইভ ডিপ্লয়মেন্ট (Deployment) গাইড।

---

## ১. প্রজেক্ট পরিচিতি (Project Overview)
**CampusOS** হলো সিটি ইউনিভার্সিটি (বাংলাদেশ)-এর শিক্ষার্থীদের জন্য তৈরি একটি সেন্ট্রালাইজড ডিজিটাল ক্যাম্পাস প্ল্যাটফর্ম। সিটি ইউনিভার্সিটির একাডেমিক ও ক্যাম্পাস জীবনের গুরুত্বপূর্ণ তথ্যগুলো বিভিন্ন ফেসবুক গ্রুপ, মেসেঞ্জার চ্যাট ও নোটিশ বোর্ডে ছড়িয়ে-ছিটিয়ে থাকে। 

CampusOS এর মূল লক্ষ্য:
* সকালে একজন শিক্ষার্থী অ্যাপে প্রবেশ করলেই জানতে পারবে **আজকের ক্যাম্পাসে কি কি করণীয়** (আজকের পরীক্ষা, জরুরি নোটিশ, বাস ছাড়ার সময়)।
* অফিসিয়াল নোটিশগুলোকে সাধারণ ভাষায় রূপান্তর ও **AI Notice Synthesizer**-এর মাধ্যমে সুস্পষ্ট অ্যাকশনে পরিণত করা।
* **জিরো হ্যালুসিনেশন (Zero Hallucination)** নিশ্চিত করে অফিসিয়াল তথ্যের ভিত্তিতে ক্যাম্পাস এআই হেল্পডেস্ক অ্যাসিস্ট্যান্ট সরবরাহ করা।
* কেন্দ্রীয় অ্যাডমিন প্যানেল যেখান থেকে রেজিস্টার অফিস বা ডিপার্টমেন্ট প্রশাসন নোটিশ, পরীক্ষার রুটিন, ইভেন্ট, স্টাডি মেটেরিয়াল ও বাসের শিডিউল ম্যানেজ ও পাবলিশ করতে পারবে।

---

## ২. ইমেইল ওটিপি অথেন্টিকেশন সিস্টেম (Email OTP 2FA Authentication)

### মূল বৈশিষ্ট্যসমূহ:
1. **একক ও ক্লিন লগইন (Single Clean Unified Login)**:
   * লগইন পেজে কোনো অপ্রয়োজনীয় ডামি বাটন, ডামি ওটিপি কোড বা "Admin/Student" সুইচ রাখা হয়নি।
   * শিক্ষার্থী বা অ্যাডমিন—সবার জন্য একটাই স্ট্যান্ডার্ড লগইন উইন্ডো (ইমেইল এবং পাসওয়ার্ড)।
   * সিস্টেম স্বয়ংক্রিয়ভাবে ইমেইল এবং রোলের ভিত্তিতে ইউজারকে চিহ্নিত করে। `sahinfdr89@gmail.com` দিয়ে লগইন করলে স্বয়ংক্রিয়ভাবে **Admin Panel** এক্সেস পাওয়া যায়।
   * যেকোনো সাধারণ ইউজার নতুন অ্যাকাউন্ট তৈরি (Register) করলে তার ডিফল্ট রোল স্বয়ংক্রিয়ভাবে **STUDENT** হবে।

2. **রিয়েল জিমেইল ওটিপি ডেলিভারি (Direct Gmail SMTP 2FA)**:
   * ওটিপি কোনো স্ক্রিনে বা পেজে প্রদর্শিত হয় না; এটি সরাসরি ইউজারের আসল জিমেইল ইনবক্সে প্রেরিত হয়।
   * সেন্ডার জিমেইল কনফিগারেশন:
     * **জিমেইল আইডি**: `sahinfdr89@gmail.com`
     * **অ্যাপ পাসওয়ার্ড (App Password)**: `mgroqsvvtdsugldz`
   * `nodemailer` সার্ভিসের মাধ্যমে অফিশিয়াল সিটি ইউনিভার্সিটি ব্র্যান্ডেড সিকিউর ইমেইল টেমপ্লেট সহ ৬ ডিজিটের ওটিপি যায় (১০ মিনিট মেয়াদী)।
   * ওটিপি ইনবক্সে না পেলে স্প্যাম (Spam/Junk) ফোল্ডার চেক করুন।

3. **পাসওয়ার্ড রিসেট ফ্লো (Forgot Password Flow)**:
   * পাসওয়ার্ড ভুলে গেলে "Forgot password?" লিংকে ক্লিক করে রেজিস্টার্ড ইমেইল প্রদান করলে সরাসরি জিমেইলে ৬ ডিজিটের রিসেট কোড যায়।
   * সেই কোড এবং নতুন পাসওয়ার্ড দিয়ে অ্যাকাউন্ট রিকভার করা যায়।

---

## ৩. অ্যাডমিন ও স্টুডেন্ট অ্যাকাউন্ট ক্রেডেনশিয়াল (Credentials)

| ইউজার ধরন | ইমেইল (Real Valid Gmail) | পাসওয়ার্ড | ২এফএ ওটিপি (OTP) ভেরিফিকেশন |
| :--- | :--- | :--- | :--- |
| **রেজিস্ট্রার অ্যাডমিন (Admin)** | `sahinfdr89@gmail.com` | `admin123` | সরাসরি আপনার জিমেইল ইনবক্সে আসবে |
| **নতুন স্টুডেন্ট রেজিস্ট্রেশন** | আপনার ব্যক্তিগত জিমেইল | আপনার পছন্দমত পাসওয়ার্ড | সরাসরি আপনার জিমেইল ইনবক্সে আসবে |

---

## ৪. অ্যাডমিন কনসোল ও কনটেন্ট অ্যাড করার নিয়ম (Admin Content Management)

অ্যাডমিন (`sahinfdr89@gmail.com`) লগইন করার পর টপ নাবার-এ **"Admin Panel"** বাটন দৃশ্যমান হবে। এখান থেকে ক্যাম্পাসের সমস্ত ডেটা রিয়েলটাইমে পাবলিশ ও মডারেশন করা যায়:

1. **অফিসিয়াল নোটিশ পাবলিশ (Notices)**:
   * "Create Notice" বাটনে ক্লিক করে শিরোনাম, ডিপার্টমেন্ট (CSE, EEE, BBA, Civil, Law ইত্যাদি বা All Departments), ক্যাটাগরি, প্রায়োরিটি (Normal, Important, Urgent Alert), ডেডলাইন এবং বিস্তারিত লিখে "Publish Official Notice" এ ক্লিক করলেই সাথে সাথে গ্রিন কনফার্মেশন মেসেজ আসবে এবং ওয়েবসাইটের সকল স্টুডেন্টের ফিডে লাইভ হয়ে যাবে।
2. **পরীক্ষার রুটিন যোগ (Exam Routines)**:
   * "Add Exam Schedule" বাটনে ক্লিক করে কোর্স নাম, কোর্স কোড (e.g. `CSE 311`), পরীক্ষার তারিখ, সময় এবং খাগান ক্যাম্পাসের কক্ষ নাম্বার (e.g. `Academic Bldg 1, Room 304`) দিয়ে সেভ করা যায়।
3. **ক্যাম্পাস ইভেন্ট পাবলিশ (Campus Events)**:
   * "Create Event" বাটনে ক্লিক করে আয়োজক ক্লাব, তারিখ, ভেন্যু এবং বিবরণ দিলে স্টুডেন্টরা "RSVP Now" করতে পারবে।
4. **একাডেমিক রিসোর্স ভল্ট (Study Materials)**:
   * "Add Material" বাটনে ক্লিক করে লেকচার নোটস, বিগত ট্রাইমেস্টারের প্রশ্নব্যাংক, ল্যাব ম্যানুয়াল বা ড্রাইভ লিংক যুক্ত করা যায়।
5. **শাটল বাস রুটিন (Shuttle Bus Schedules)**:
   * "Add Bus Route" বাটনে ক্লিক করে মিরপুর, উত্তরা, সাভার বা গাবতলী রুটের বাস নাম্বার, ছাড়ার সময়, ফেরার সময় এবং ড্রাইভারের ফোন নাম্বার যুক্ত করা যায়।

> **রিয়েলটাইম সেভ**: অ্যাডমিন কোনো কিছু অ্যাড করার সাথে সাথে তা ব্যাকএন্ডের `.campusos_db.json` ফাইলে স্থায়ীভাবে সেভ হয়ে যায় এবং স্ক্রিনে সুস্পষ্ট গ্রিন সাকসেস নোটিফিকেশন প্রদর্শন করে।

---

## ৫. কোন পেজে কি কি ফিচার আছে (Page-by-Page Feature Guide)

1. **Today (আজকের ক্যাম্পাস ড্যাশবোর্ড)**:
   * তারিখ, জরুরি নোটিশ কাউন্টার, পরবর্তী পরীক্ষা ও ইভেন্টের রিয়েলটাইম কাউন্টার।
   * তাৎক্ষণিক অ্যাকশন রিমাইন্ডার (কোর্স রেজিস্ট্রেশন ডেডলাইন)।
   * শাটল বাসের সকালের ও বিকেলের সময়সূচি।
2. **Notices (নোটিশ বোর্ড ও AI সামারাইজার)**:
   * একাডেমিক ও প্রশাসনিক নোটিশ ফিল্টারিং।
   * **✨ AI Notice Synthesizer (Gemini 3.8 Flash)**: বড় নোটিশের সারসংক্ষেপ ৪টি পয়েন্টে (What, Who, Dates, Actions) তৈরি করে।
   * প্রফেশনাল ডিজাইন, হাই-কনট্রাস্ট কার্ড ও ফিক্সড ক্লোজ বাটন।
3. **Exams (পরীক্ষার রুটিন ও সিডিউল)**:
   * ডিপার্টমেন্ট ও পরীক্ষার ধরন (Final, Midterm, Quiz) অনুযায়ী ফিল্টার।
   * কক্ষ নাম্বার, সময় ও নির্দেশনা।
4. **Events & Clubs (ইভেন্ট ও ক্লাব ডিরেক্টরি)**:
   * রিয়েল ডাটাবেজ RSVP কাউন্টার।
   * সিটি ইউনিভার্সিটির ক্লাবসমূহ (CPCCU, CURC, CUCC, CUDC, CUSC)।
5. **Resources (একাডেমিক রিসোর্স ভল্ট)**:
   * হ্যান্ডরিটেন নোটস, বিগত ট্রাইমেস্টারের ফাইনাল প্রশ্নব্যাংক, ল্যাব ম্যানুয়াল।
   * স্টুডেন্টদের নিজস্ব নোট আপলোড করার সুবিধা।
6. **Transport (সিটি ইউনিভার্সিটি শাটল বাস শিডিউল)**:
   * মিরপুর, উত্তরা, সাভার, গাবতলী রুটের বাসের সময় ও সুপারভাইজার কন্টাক্ট।
7. **Helpdesk (স্মার্ট হেল্পডেস্ক ও এআই সহকারী)**:
   * সার্চ বক্সের জন্য ক্লিয়ার বাটন ('X') এবং এআই উত্তরের জন্য ডিসমিস বাটন ('X')।
   * অ্যাডভাইজিং, ফি ও ওয়েভার সংক্রান্ত অফিসিয়াল এফএকিউ।
8. **Lost & Found (হারানো ও প্রাপ্তি ডেস্ক)**:
   * ক্যাম্পাসে হারিয়ে যাওয়া আইডি কার্ড, ক্যালকুলেটর বা সামগ্রী রিপোর্ট করার অপশন।
9. **Profile (স্টুডেন্ট হাব)**:
   * প্রোফাইল তথ্য, সেভ করা নোটিশ ও পরীক্ষার তালিকা।

---

## ৬. লাইভ ডিপ্লয়মেন্ট গাইড (Complete Deployment Guide)

এই প্রজেক্টটি একটি ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন (React 19 Frontend + Express/Node.js Backend)। এটি বিভিন্ন ফ্রি ও পেইড প্ল্যাটফর্মে সহজেই ডিপ্লয় করা যায়:

---

### অপশন ১: Render.com এ ডিপ্লয় (সবচেয়ে সহজ ও রিকমেন্ডেড - সম্পূর্ণ ফ্রি)

Render.com ফুল-স্ট্যাক Node.js অ্যাপ্লিকেশনের জন্য অত্যন্ত চমৎকার এবং সহজ:

1. **GitHub এ কোড পুশ করুন**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for CampusOS"
   git branch -M main
   git remote add origin https://github.com/your-username/campusos.git
   git push -u origin main
   ```

2. **Render এ যান**:
   * [render.com](https://render.com) এ লগইন করুন।
   * ড্যাশবোর্ড থেকে **"New +"** বাটনে ক্লিক করে **"Web Service"** সিলেক্ট করুন।
   * আপনার GitHub রিপোজিটরিটি কানেক্ট করুন।

3. **সার্ভিস সেটিংস কনফিগার করুন**:
   * **Name**: `campusos-city-university`
   * **Language**: `Node`
   * **Branch**: `main`
   * **Build Command**:
     ```bash
     npm install && npm run build
     ```
   * **Start Command**:
     ```bash
     node server.ts
     ```
     *(অথবা `npm start`)*

4. **Environment Variables যোগ করুন**:
   Render ড্যাশবোর্ডের "Environment" ট্যাবে নিচের ভেরিয়েবলগুলো যোগ করুন:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `SMTP_USER` | `sahinfdr89@gmail.com` |
   | `SMTP_PASS` | `mgroqsvvtdsugldz` |
   | `JWT_SECRET` | `campusos-city-university-jwt-secret-2026` |
   | `GEMINI_API_KEY` | *(আপনার জেমিনি এআই কি, যদি থাকে)* |

5. **Deploy বাটনে ক্লিক করুন**:
   * ২-৩ মিনিটের মধ্যে বিল্ড সফল হয়ে আপনার সাইটটি লাইভ ইউআরএল পেয়ে যাবে (যেমন: `https://campusos-city-university.onrender.com`)।

---

### অপশন ২: Railway.app এ ডিপ্লয় (Railway Full-Stack Deployment)

1. [railway.app](https://railway.app) এ যান এবং লগইন করুন।
2. **"New Project"** -> **"Deploy from GitHub repo"** নির্বাচন করুন।
3. রিপোজিটরিটি বেছে নিন। Railway স্বয়ংক্রিয়ভাবে প্রজেক্ট ডিটেক্ট করবে।
4. "Variables" ট্যাবে এনভায়রনমেন্ট ভেরিয়েবলগুলো দিন:
   * `PORT`: `3000`
   * `SMTP_USER`: `sahinfdr89@gmail.com`
   * `SMTP_PASS`: `mgroqsvvtdsugldz`
   * `JWT_SECRET`: `campusos-secret-2026`
5. Railway কয়েক সেকেন্ডের মধ্যে বিল্ড শেষ করে একটি ফ্রি পাবলিক ডোমেইন জেনারেট করে দেবে।

---

### অপশন ৩: নিজস্ব VPS বা ক্লাউড সার্ভারে ডিপ্লয় (Ubuntu / DigitalOcean / AWS EC2)

আপনি যদি নিজের লিনাক্স সার্ভারে (Ubuntu 22.04 / 24.04 LTS) ডিপ্লয় করতে চান:

1. **সার্ভার আপডেট ও Node.js ইনস্টল**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo npm install -g pm2
   ```

2. **প্রজেক্ট ক্লোন ও বিল্ড**:
   ```bash
   cd /var/www
   git clone https://github.com/your-username/campusos.git
   cd campusos
   npm install
   npm run build
   ```

3. **`.env` ফাইল তৈরি করুন**:
   ```bash
   nano .env
   ```
   ফাইলে নিচের লাইনগুলো পেস্ট করুন:
   ```env
   NODE_ENV=production
   PORT=3000
   SMTP_USER=sahinfdr89@gmail.com
   SMTP_PASS=mgroqsvvtdsugldz
   JWT_SECRET=campusos-secret-prod-2026
   ```

4. **PM2 দিয়ে ব্যাকগ্রাউন্ডে সার্ভার রান করুন**:
   ```bash
   pm2 start server.ts --name "campusos" --interpreter ./node_modules/.bin/tsx
   pm2 save
   pm2 startup
   ```

5. **Nginx রিভার্স প্রক্সি কনফিগারেশন (Domain & SSL)**:
   ```nginx
   server {
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   এরপর Certbot দিয়ে ফ্রি SSL এনেবল করুন:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```

---

## ৭. লোকাল মেশিনে টেস্ট করার নিয়ম (Local Development)

```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# ডেভেলপমেন্ট সার্ভার চালু (Port 3000)
npm run dev

# প্রোডাকশন বিল্ড টেস্ট
npm run build
```

ব্রাউজারে খুলুন: `http://localhost:3000`

---

**City University, Bangladesh | Khagan, Birulia, Savar, Dhaka-1216**  
*Official Academic Portal: https://cityuniversity.ac.bd*
