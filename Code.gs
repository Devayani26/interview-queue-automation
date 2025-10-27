// ======= CONFIG =======
const SHEET_NAME = "Form responses 1"; 
const EXPECTED = {
  status: ["status"],
  queue: ["queue number", "queue", "queue no", "queue no."],
  email: ["email", "email address", "e-mail"],
  name: ["full name", "name"],
  timestamp: ["timestamp", "time", "submitted at"],
  notifiedAt: ["notified at", "notified_at", "notified"]
};
// ======================

// Utility functions
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
    .addItem("Mark current as Skipped", "markCurrentSkipped")
    .addItem("Rebuild queue numbers", "rebuildQueueNumbers")
    .addSeparator()
    .addItem("Show detected headers", "showDetectedHeadersAndMapping")
    .addItem("Force Email Authorization", "forceAuth")
    .addToUi();
}

// === Sheet & Header Helpers ===
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
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  return { sheet, headers };
}

// === Debug mapping ===
function showDetectedHeadersAndMapping() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { headers } = info;
  const mapping = detectColumns(headers);
  let msg = "Detected headers:\n\n" + headers.map((h, i) => `${i + 1}. ${h}`).join("\n");
  msg += "\n\nColumn mapping:\n";
  for (let key in mapping) msg += `${key}: ${mapping[key] || "NOT FOUND"}\n`;
  SpreadsheetApp.getUi().alert(msg);
}

// === Rebuild queue ===
function rebuildQueueNumbers() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  let q = 1;
  data.forEach((r, i) => {
    const status = (r[cols.statusCol - 1] || "").toLowerCase();
    if (status === "waiting") sheet.getRange(i + 2, cols.queueCol).setValue(q++);
    else if (status === "in-progress" || status === "done" || status === "skipped") {
      sheet.getRange(i + 2, cols.queueCol).setValue("");
    }
  });
}

// === Notify next candidate ===
function notifyNextCandidate() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  const arr = data.map((r, i) => ({
    rowIndex: i + 2,
    queue: Number(r[cols.queueCol - 1]) || Infinity,
    status: r[cols.statusCol - 1],
    email: r[cols.emailCol - 1],
    name: r[cols.nameCol - 1]
  }));

  arr.sort((a, b) => a.queue - b.queue);
  const next = arr.find(item => String(item.status).toLowerCase() === "waiting");

  if (!next) {
    SpreadsheetApp.getUi().alert("No Waiting candidate found.");
    return;
  }

  const subject = "Your interview: please join now";
  const meetingLink = "https://teams.live.com/meet/example";
  const body = `Hi ${next.name},

It's your turn for the interview now. Please join the meeting immediately:
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

// === Mark current as Done ===
function markCurrentDone() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    const status = String(data[i][cols.statusCol - 1]).toLowerCase();
    if (status === "in-progress") {
      sheet.getRange(i + 2, cols.statusCol).setValue("Done");
      SpreadsheetApp.getUi().alert(`✅ Marked Done for row ${i + 2}`);
      rebuildQueueNumbers();
      return;
    }
  }
  SpreadsheetApp.getUi().alert("No In-progress candidate found.");
}

// === Mark current as Skipped ===
function markCurrentSkipped() {
  const info = getSheetAndHeaders();
  if (!info) return;
  const { sheet, headers } = info;
  const cols = detectColumns(headers);

  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
  for (let i = 0; i < data.length; i++) {
    const status = String(data[i][cols.statusCol - 1]).toLowerCase();
    if (status === "in-progress") {
      sheet.getRange(i + 2, cols.statusCol).setValue("Skipped");
      SpreadsheetApp.getUi().alert(`⚠️ Marked Skipped for row ${i + 2}`);
      rebuildQueueNumbers();
      return;
    }
  }
  SpreadsheetApp.getUi().alert("No In-progress candidate found.");
}

// === Email authorization ===
function forceAuth() {
  const userEmail = Session.getActiveUser().getEmail();
  MailApp.sendEmail(userEmail, "Test Authorization", "If you see this email, permissions work!");
  SpreadsheetApp.getUi().alert(
    "Authorization test triggered. Check your inbox for 'Test Authorization'."
  );
}
