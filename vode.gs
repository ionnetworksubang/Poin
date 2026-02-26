const SHEET_ID = "1RTftahI7L8DGKIsnmNGVIG-YsF7mI4zeTsNE3y2-1Qw";
const ss = SpreadsheetApp.openById(SHEET_ID);

const SHEET_HEADERS = {
  member: ["Nama", "Email", "No HP", "Role", "Password"],
  olt: ["Nama OLT", "Lokasi", "Jumlah Card", "Jumlah PON", "PON Terpakai", "PON Kosong"],
  odp: ["Nama ODP", "Kode ODP", "OLT", "PON", "Card", "Tikor", "Link Maps", "Data Core", "Team", "Tanggal Input", "User", "Max Port", "Port Terpakai"],
  Data_Pelanggan: ["Tanggal", "Jenis Laporan", "Nama Pelanggan", "CID", "OLT", "Nama ODP", "Port", "Teknisi", "Keterangan", "Email", "Jenis Perangkat", "SN Perangkat"]
};

function doPost(e) {
  try {
    setupApp(); 
    let req = (e.parameter && e.parameter.data) ? JSON.parse(e.parameter.data) : JSON.parse(e.postData.contents);
    let action = req.action; 
    let p = req.payload || {};

    if (action === "login") return respond(login(p.email, p.password));
    if (action === "getData") return respond(getAllData());
    if (action === "crud") return respond(handleCrud(p.sheetName, p.mode, p.dataRow, p.oldKey));
    if (action === "addOdpBulk") return respond(addOdpBulk(p.olt, p.odpList, p.user));
    if (action === "saveLaporan") return respond(saveLaporan(p.laporanData));
    
    return respond({ ok: false, message: "Aksi tidak dikenali." });
  } catch (err) { return respond({ ok: false, message: err.message }); }
}

function doGet(e) {
  setupApp(); 
  return respond({ ok: true, message: "API V4 (ODP Management) Aktif!" });
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function setupApp() {
  Object.keys(SHEET_HEADERS).forEach(name => ensureSheet(name));
  let shMember = ss.getSheetByName("member");
  if (shMember.getLastRow() < 2) shMember.appendRow(["Admin Utama", "admin@ion.com", "08000000000", "Admin", "Ramdan"]);
}

function ensureSheet(name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name); 
  if (sh.getLastRow() === 0) sh.appendRow(SHEET_HEADERS[name]); 
  return sh;
}

function login(email, password) {
  let data = ss.getSheetByName("member").getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email && String(data[i][4]) === password) 
      return { ok: true, user: { nama: data[i][0], email: data[i][1], hp: data[i][2], role: data[i][3] } };
  }
  return { ok: false, message: "Email atau password salah!" };
}

function getAllData() {
  let shOdp = ss.getSheetByName("odp").getDataRange().getValues(); shOdp.shift();
  let shOlt = ss.getSheetByName("olt").getDataRange().getValues(); shOlt.shift();
  let shMember = ss.getSheetByName("member").getDataRange().getValues(); shMember.shift();
  let shPelanggan = ss.getSheetByName("Data_Pelanggan").getDataRange().getValues(); shPelanggan.shift();
  
  let safeMember = shMember.map(r => [r[0], r[1], r[2], r[3], "********"]); 

  let usedPorts = {};
  shPelanggan.forEach(row => {
     let odp = row[5]; 
     let port = parseInt(row[6]); 
     if (odp && port) {
        if (!usedPorts[odp]) usedPorts[odp] = [];
        usedPorts[odp].push(port);
     }
  });

  return { ok: true, data: { odp: shOdp, olt: shOlt, member: safeMember, pelanggan: shPelanggan, usedPorts: usedPorts } };
}

function saveLaporan(laporanDataArray) {
  let sh = ss.getSheetByName("Data_Pelanggan");
  if (laporanDataArray && laporanDataArray.length > 0) {
    sh.getRange(sh.getLastRow() + 1, 1, laporanDataArray.length, laporanDataArray[0].length).setValues(laporanDataArray);
    return { ok: true, message: "Laporan berhasil disimpan ke Database!" };
  }
  return { ok: false, message: "Data laporan kosong." };
}

function handleCrud(sheetName, mode, dataRow, oldKey) {
  let sh = ss.getSheetByName(sheetName);
  let rows = sh.getDataRange().getValues();
  
  let keyIndex = 0; 
  if (sheetName === 'member') keyIndex = 1; 
  if (sheetName === 'Data_Pelanggan') keyIndex = 3; 

  if (mode === 'add') { sh.appendRow(dataRow); return { ok: true, message: "Data berhasil ditambahkan!" }; }
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][keyIndex] == oldKey) {
      if (mode === 'edit') {
        if (sheetName === 'member' && dataRow[4] === "********") dataRow[4] = rows[i][4]; 
        sh.getRange(i + 1, 1, 1, dataRow.length).setValues([dataRow]);
        return { ok: true, message: "Data berhasil diperbarui!" };
      }
      if (mode === 'delete') { sh.deleteRow(i + 1); return { ok: true, message: "Data berhasil dihapus!" }; }
    }
  }
  return { ok: false, message: "Data lama tidak ditemukan!" };
}

function addOdpBulk(olt, odpArray, user) {
  let sh = ss.getSheetByName("odp");
  let now = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
  let rowsData = odpArray.map(nama => [nama, "-", olt, "-", "-", "-", "-", "-", "-", now, user, 16, 0]);
  if (rowsData.length > 0) sh.getRange(sh.getLastRow() + 1, 1, rowsData.length, rowsData[0].length).setValues(rowsData);
  return { ok: true, message: `${rowsData.length} ODP berhasil ditambahkan ke ${olt}!` };
}