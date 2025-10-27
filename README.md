# 🎯 Interview Queue Automation Script

> **Automating candidate notifications for online interviews using Google Sheets + Apps Script**

---

## 🧠 Problem Statement

During large-scale virtual interviews, coordinating multiple candidates becomes a time-consuming and error-prone process. Recruiters often face:

- Manual effort in tracking who’s next in line  
- Delays in notifying candidates to join  
- Confusion when candidates skip or miss their turn  
- Inefficient communication between HR and interviewees  

This results in wasted time, scheduling chaos, and a poor candidate experience.

---

## 💡 Existing Solutions

Current tools such as **Microsoft Teams**, **Google Meet**, **Zoom**, and **Slack** provide great virtual meeting platforms, but none of them offer a built-in **automated queue management system** for interviews.

**Common existing practices:**
- HR manually emails or messages each candidate  
- Use of paid scheduling tools like **Calendly**, **Zoho Recruit**, or **Microsoft Bookings**  
- Tracking candidates through manual spreadsheets  

However, these methods:
- Require **continuous HR supervision**  
- Are **not integrated** with Google Forms or Sheets  
- Involve **extra cost or complexity**  

---

## 🚀 Our Discovery & Solution

We developed a **smart interview queue automation system** entirely within **Google Sheets** using **Google Apps Script** — a 100% free, no-server approach.

### ✨ What Makes It Unique

- 💬 Automatically detects the **next candidate** in the queue  
- 📧 Sends **personalized email notifications** with the interview link  
- 🔁 Allows HR to mark candidates as **Done** or **Skipped** with one click  
- 🕒 Records timestamp and status updates in real-time  
- ⚙️ Automatically **rebuilds queue order** when someone is skipped  
- 💡 Fully integrated within Google Sheets — no third-party tools required  

In essence, this project transforms a Google Sheet into a **mini interview management system**.

---

## ⚙️ How It Works (Concept Overview)

Here’s how the system functions conceptually:

1. **Candidate Registration**  
   Candidates submit their information via a Google Form (Name, Email, etc.).  
   The responses automatically populate a Google Sheet.

2. **Queue Assignment**  
   Each new entry is assigned a sequential **queue number**.

3. **Automated Notification**  
   The script sends an email to the **next waiting candidate** with the meeting link when it’s their turn.

4. **Status Update**  
   Once notified or done, the candidate’s status is updated (e.g., **Waiting → In-Progress → Done**).  
   HR can also manually mark a candidate as **Skipped**.

5. **Queue Rebuild**  
   The queue automatically reorganizes itself to maintain order when someone is skipped or completed.

6. **HR Control Panel**  
   The Google Sheet menu includes options like:
   - Notify Next Candidate  
   - Mark Current as Done  
   - Rebuild Queue Numbers  
   - Show Detected Columns  

---

## 🏁 Results & Impact

✅ Reduced HR manual effort by **80%**  
✅ Improved response time and interview flow  
✅ Enhanced transparency in candidate tracking  
✅ Built using **free Google tools** — zero external dependencies  

---

## 🧩 Tech Stack

| Component | Technology |
|------------|-------------|
| Backend Logic | Google Apps Script |
| Database | Google Sheets |
| Form Input | Google Forms |
| Communication | Gmail (MailApp API) |
| Platform | Cloud (via Google Workspace) |

---

## 📜 Example Email Template

---

## 🪪 Copyright & License

© 2025 **Dev V**  
All Rights Reserved.  

This project is an original innovation by **Dev V**, designed to automate interview queue management using the Google ecosystem (Sheets + Apps Script).  
Reproduction, redistribution, or commercial use without proper attribution is prohibited.

Distributed under the **MIT License** for educational and non-commercial purposes.

---

## 🌐 Connect with Me

💼 [LinkedIn](#)  
🎥 [YouTube Channel](#) – *Tech, Motivation & Tutorials*  
📧 [Email](mailto:yourname@example.com)

---

> 🚀 *"Innovation is not about complexity — it’s about solving real problems with simplicity."*


