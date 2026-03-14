# 📧 EmailJS Setup — Enable Email Reminders (Free)

## What EmailJS does for MediCare+:
- ✅ Sends reminder email 5 min BEFORE each dose
- ✅ Sends missed dose alert 5 min AFTER if not taken
- ✅ Notifies caregiver when a dose is missed
- ✅ Marks the medicine as "missed" automatically

---

## Step 1 — Create Free EmailJS Account
1. Go to **emailjs.com**
2. Click **Sign Up Free** (200 emails/month free)
3. Verify your email

---

## Step 2 — Add Email Service
1. Go to **Email Services** → Click **Add New Service**
2. Choose **Gmail** (easiest)
3. Click **Connect Account** → sign in with your Gmail
4. Name it: `medicare_service`
5. Click **Create Service**
6. Copy your **Service ID** (looks like: `service_abc123`)

---

## Step 3 — Create Reminder Email Template
1. Go to **Email Templates** → **Create New Template**
2. Set **Template Name**: `medicine_reminder`
3. Set **Subject**: `💊 Time for your {{med_name}} dose!`
4. Set **Body**:
```
Hi {{to_name}},

This is a reminder to take your medication:

💊 Medicine: {{med_name}}
📏 Dose: {{dose}}
⏰ Time: {{time}}

{{message}}

Stay healthy!
— MediCare+ Team
```
5. Set **To Email**: `{{to_email}}`
6. Click **Save** → Copy the **Template ID** (like: `template_abc123`)

---

## Step 4 — Create Missed Dose Template
1. Create another template named `missed_dose_alert`
2. Set **Subject**: `⚠️ Missed dose alert — {{med_name}}`
3. Set **Body**:
```
Hi {{to_name}},

A dose has been missed:

💊 Medicine: {{med_name}}
📏 Dose: {{dose}}
⏰ Scheduled: {{time}}

{{message}}

Please take action as soon as possible.

— MediCare+ Team
```
4. Set **To Email**: `{{to_email}}`
5. Click **Save** → Copy the **Template ID**

---

## Step 5 — Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (looks like: `user_abc123xyz`)

---

## Step 6 — Add to Vercel Environment Variables
Go to **vercel.com** → **medicare-app** → **Settings** → **Environment Variables**

Add these 4 new variables:

| Name | Value |
|------|-------|
| `VITE_EMAILJS_SERVICE_ID` | Your Service ID from Step 2 |
| `VITE_EMAILJS_REMINDER_TEMPLATE` | Reminder Template ID from Step 3 |
| `VITE_EMAILJS_MISSED_TEMPLATE` | Missed Dose Template ID from Step 4 |
| `VITE_EMAILJS_PUBLIC_KEY` | Your Public Key from Step 5 |

---

## Step 7 — Redeploy
After adding all 4 variables → go to **Deployments** → **Redeploy**

---

## ✅ Done! How it works:
1. You add a medication with a dose time (e.g. 8:00 AM)
2. At **7:55 AM** → you get a reminder email
3. At **8:05 AM** → if you haven't clicked ✓, the dose is marked as **missed**
4. Your caregiver email also gets notified instantly

---

## Also set in the app:
Go to **Settings** page in MediCare+ → fill in:
- Your **Caregiver Email** (who gets missed dose alerts)
- Toggle ON: Email Reminders, Missed Alerts, Caregiver Alerts
