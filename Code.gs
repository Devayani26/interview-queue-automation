// ======= CONFIG =======
const SHEET_NAME = "Form responses 1"; // <-- match your actual tab name
const EXPECTED = {
  status: ["status"],
  queue: ["queue number", "queue", "queue no", "queue no."],
  email: ["email", "email address", "e-mail"],
  name: ["full name", "name"],
  timestamp: ["timestamp", "time", "submitted at"],
  notifiedAt: ["notified at", "notified_at", "notified"]
};
// ======================

// Utility: find a header index (1-based)
function findColIndexByAlternatives(headers, alternatives) {
  const map = {};
  for (let i = 0; i < headers.length; i++) {
    map[headers[i].toString().trim().toLowerCase()] = i + 1;
  }
  for (let alt of alternatives) {
    const key = alt.toString().trim().toLowerCase();
    if (map[key]) return map[key];
  }
  return 0;
}

function detectColumns(headers) {
  return {
    timestampCol: findColIndexByAlternatives(headers, EXPECTED.timestamp),
    nameCol: findColIndexByAlternatives(headers, EXPECTED.name),
    emailCol: findColIndexByAlternatives(headers, EXPECTED.email),
    queueCol: findColIndexByAlternatives(headers, EXPECTED.queue),
    statusCol: findColIndexByAlternatives(headers, EXPECTED.status),
    notifiedAtCol: findColIndexByAlternatives(headers, EXPECTED.notifiedAt)
  };
}

// === MENU ===
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Interview Queue")
    .addItem("Notify next candidate", "notifyNextCandidate")
    .addItem("Mark current as Done", "markCurrentDone")
    .addItem("Skip current candidate", "skipCurrentCandidate")
    .addItem("Rebuild queue numbers", "rebuildQueueNumbers")
    .addSeparator()
    .addItem("Show detected headers & mapping", "showDetectedHeadersAndMapping")
    .addItem("Force Email Authorization", "forceAuth")
    .addToUi();
}

// === Helper to get sheet safely ===
function getSheetAndHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    const available = ss.getSheets().map(s => s.getName()).join("\n");
    SpreadsheetApp.getUi().alert(
      "❌ Sheet not found: '" + SHEET_NAME + "'\n\nAvailable sheets:\n" + available
    );
    return null;
  }
  const lastCol = sheet.getLastColumn();
  if (!lastCol || lastCol < 1) {
    SpreadsheetApp.getUi().alert(
      "❌ Sheet '" + SHEET_NAME + "' appears empty. Ensure the form has created header row."
    );
    return null;
  }
  const headers = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(h => h.toString());
  return { sheet, headers };
}

// === Debug mapping ===
function showDetectedHeadersAndMapping() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { headers } = info;
  const mapping = detectColumns(headers);
  let msg = "Detected headers:\n\n" + headers.map((h, i) => (i + 1) + ". " + h).join("\n");
  msg += "\n\nColumn mapping:\n";
  msg += "Timestamp -> " + (mapping.timestampCol || "NOT FOUND") + "\n";
  msg += "Name -> " + (mapping.nameCol || "NOT FOUND") + "\n";
  msg += "Email -> " + (mapping.emailCol || "NOT FOUND") + "\n";
  msg += "Queue -> " + (mapping.queueCol || "NOT FOUND") + "\n";
  msg += "Status -> " + (mapping.statusCol || "NOT FOUND") + "\n";
  msg += "Notified At -> " + (mapping.notifiedAtCol || "NOT FOUND") + "\n";
  SpreadsheetApp.getUi().alert(msg);
}

// === Trigger on form submit ===
function onFormSubmit(e) {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const missing = [];
  if (!cols.statusCol) missing.push("Status");
  if (!cols.queueCol) missing.push("Queue (Queue Number)");
  if (!cols.emailCol) missing.push("Email");
  if (!cols.nameCol) missing.push("Full Name / Name");

  if (missing.length > 0) {
    SpreadsheetApp.getUi().alert(
      "❌ Missing expected columns:\n" +
        missing.join(", ") +
        "\n\nPlease ensure these columns exist in header row."
    );
    return;
  }

  const row = e.range.getRow();
  if (row < 2) return;

  const currentStatus = sheet.getRange(row, cols.statusCol).getValue();
  if (!currentStatus) sheet.getRange(row, cols.statusCol).setValue("Waiting");

  rebuildQueueNumbers();
}

// === Rebuild queue ===
function rebuildQueueNumbers() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  if (!cols.timestampCol || !cols.statusCol || !cols.queueCol) {
    SpreadsheetApp.getUi().alert(
      "❌ Missing required columns for rebuilding queue. Need: Timestamp, Status, Queue Number."
    );
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const arr = data.map((r, i) => ({
    rowIndex: i + 2,
    timestamp: r[cols.timestampCol - 1],
    status: r[cols.statusCol - 1]
  }));

  arr.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  let q = 1;
  arr.forEach(item => {
    const status = String(item.status).toLowerCase();
    if (status === "done" || status === "skipped") {
      sheet.getRange(item.rowIndex, cols.queueCol).setValue(""); // leave blank for skipped/done
    } else {
      sheet.getRange(item.rowIndex, cols.queueCol).setValue(q++);
    }
  });
}

// === Notify next candidate ===
function notifyNextCandidate() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const missing = [];
  if (!cols.statusCol) missing.push("Status");
  if (!cols.queueCol) missing.push("Queue");
  if (!cols.emailCol) missing.push("Email");
  if (!cols.nameCol) missing.push("Name");
  if (!cols.notifiedAtCol) missing.push("Notified At");
  if (missing.length > 0) {
    SpreadsheetApp.getUi().alert("❌ Missing expected columns: " + missing.join(", "));
    return;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No candidates found.");
    return;
  }

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const arr = data.map((r, i) => ({
    rowIndex: i + 2,
    queue: Number(r[cols.queueCol - 1]) || Infinity,
    status: String(r[cols.statusCol - 1] || "").toLowerCase(),
    email: r[cols.emailCol - 1],
    name: r[cols.nameCol - 1]
  }));

  arr.sort((a, b) => a.queue - b.queue);
  const next = arr.find(item => item.status === "waiting"); // ignore skipped/done

  if (!next) {
    SpreadsheetApp.getUi().alert("No Waiting candidate found.");
    return;
  }

  const subject = "Your interview: please join now";
  const meetingLink = "https://teams.live.com/meet/example"; // <-- replace with your real Teams link
  const body = `Hi ${next.name},

It's your turn for the interview now. Please join the meeting immediately 
using this link:
${meetingLink}

You were #${next.queue} in the queue. If you cannot join, reply to this email 
immediately so we can move to the next candidate.

Thanks,
Interview Team`;

  try {
    MailApp.sendEmail(next.email, subject, body);
    sheet.getRange(next.rowIndex, cols.statusCol).setValue("In-progress");
    sheet.getRange(next.rowIndex, cols.notifiedAtCol).setValue(new Date());
    SpreadsheetApp.getUi().alert(`✅ Notified: ${next.name} (${next.email})`);
  } catch (err) {
    SpreadsheetApp.getUi().alert("❌ Failed to send email: " + err);
  }
}

// === Mark current as done ===
function markCurrentDone() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][cols.statusCol - 1]).toLowerCase() === "in-progress") {
      sheet.getRange(i + 2, cols.statusCol).setValue("Done");
      SpreadsheetApp.getUi().alert(`✅ Marked Done for row ${i + 2}`);
      rebuildQueueNumbers();
      return;
    }
  }
  SpreadsheetApp.getUi().alert("No In-progress candidate found.");
}

// === Skip current candidate ===
function skipCurrentCandidate() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][cols.statusCol - 1]).toLowerCase() === "in-progress") {
      sheet.getRange(i + 2, cols.statusCol).setValue("Skipped");
      SpreadsheetApp.getUi().alert(`⚠️ Skipped candidate at row ${i + 2}`);
      rebuildQueueNumbers();
      return;
    }
  }
  SpreadsheetApp.getUi().alert("No In-progress candidate found to skip.");
}

// === Test authorization for MailApp ===
function forceAuth() {
  const userEmail = Session.getActiveUser().getEmail();
  Logger.log("Active user email: " + userEmail);
  MailApp.sendEmail(userEmail, "Test Authorization", "If you see this email, permissions work!");
  SpreadsheetApp.getUi().alert(
    "Authorization test triggered. Check your inbox for 'Test Authorization'."
  );
}
