/**
 * Code for Google Apps Script to serve Materi and Quiz data as JSON.
 * How to use:
 * 1. Open your Google Sheet.
 * 2. Extensions > Apps Script.
 * 3. Paste this code.
 * 4. Deploy > New Deployment > Type: Web App > Who has access: Anyone.
 * 5. Copy the URL and paste it into the Amsilati App config.
 */

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  
  // Get Metadata/Version if available (optional sheet named 'Config')
  const configSheet = sheet.getSheetByName('Config');
  if (configSheet) {
    const data = configSheet.getDataRange().getValues();
    // Simple key-value pair parsing
    data.forEach(row => {
      if(row[0]) result[row[0]] = row[1];
    });
  } else {
    result.version = new Date().toISOString(); // Default version if not set
  }

  // Handle 'Materi' Sheet
  const materiSheet = sheet.getSheetByName('Materi');
  if (materiSheet) {
    result.materi = getSheetData(materiSheet);
  }

  // Handle 'Quiz' Sheet
  const quizSheet = sheet.getSheetByName('Quiz');
  if (quizSheet) {
    result.quiz = getSheetData(quizSheet);
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  return data.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      // Convert header to snake_case or camelCase if needed, here we keep it simple
      if(header) obj[header.toString().toLowerCase().trim().replace(/\s+/g, '_')] = row[index];
    });
    return obj;
  });
}

/**
 * Expected Sheet Structure:
 * 
 * Sheet Name: 'Materi'
 * Headers (Row 1): id, jilid, judul, urutan, konten_md, status
 * 
 * Sheet Name: 'Quiz'
 * Headers (Row 1): question_id, jilid, nomor, pertanyaan, opsi_a, opsi_b, opsi_c, opsi_d, jawaban_benar, pembahasan, status
 * 
 * Sheet Name: 'Config' (Optional)
 * Row 1: version, 1.0.0
 */
