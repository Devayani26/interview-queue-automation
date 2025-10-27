# Interview Queue Automation (Google Apps Script)

This Google Apps Script automates notifying interview candidates from a Google Form → Sheet workflow.  

## ✨ Features
- Automatically assigns queue numbers on new responses  
- Notifies next candidate by email (Gmail)  
- Tracks "Waiting", "In-progress", "Done", and "Skipped" statuses  
- Allows manual control from the Google Sheets menu  

## 🧩 Setup
1. Create a Google Form → link to a Sheet  
2. Open Extensions → Apps Script  
3. Paste `Code.gs` and `appsscript.json`  
4. Update `SHEET_NAME` and Teams meeting link  
5. Save, authorize, and use menu options:
   - “Notify next candidate”
   - “Mark current as Done”
   - “Rebuild queue numbers”

## 🪪 License
Licensed under the [MIT License](LICENSE). You can freely use, modify, and distribute this code.
