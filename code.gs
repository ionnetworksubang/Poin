/**
 * 🚀 ION APP - ULTIMATE BACKEND V7 (ANTI GHOST-ROW & PASSWORD FIX)
 */

const SHEET_ID = "1RTftahI7L8DGKIsnmNGVIG-YsF7mI4zeTsNE3y2-1Qw";
const ss = SpreadsheetApp.openById(SHEET_ID);

const SHEET_HEADERS = {
  member: ["Nama", "Email", "No HP", "Role", "Password"],
  olt: ["Nama OLT", "Lokasi", "Jumlah Card", "Jumlah PON", "PON Terpakai", "PON Kosong"],
  odp: ["Nama ODP", "Kode ODP", "OLT", "PON", "Card", "Tikor", "Link Maps", "Data Core", "Team", "Tanggal Input", "User", "Max Port", "Port Terpakai"],
  Data_Pelanggan: ["Tanggal", "Jenis Laporan", "Nama Pelanggan", "CID", "OLT", "Nama ODP", "Port", "Teknisi", "Keterangan", "Email", "Jenis Perangkat", "SN Perangkat"]
};

// ==========================================
// FUNGSI SAKTI: PENCARI BARIS TERAKHIR ASLI
// Mengabaikan baris kosong / ghost rows
// ==========================================
function getRealLastRow(sh) {
  let data = sh.getDataRange().getValues();
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].join("").trim() !== "") {
      return i + 1; // Ketemu baris terakhir yang benar-benar ada isinya
    }
  }
  return 1; // Jika kosong melompong, kembali ke baris 1 (Header)
}

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
  return respond({ ok: true, message: "API V7 (Anti Ghost-Row) Aktif!" });
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function setupApp() {
  Object.keys(SHEET_HEADERS).forEach(name => ensureSheet(name));
  let shMember = ss.getSheetByName("member");
  if (getRealLastRow(shMember) < 2) shMember.appendRow(["Admin Utama", "admin@ion.com", "08000000000", "Admin", "Ramdan"]);
}

function ensureSheet(name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name); 
  if (getRealLastRow(sh) === 1 && sh.getRange(1,1).getValue() === "") {
      sh.getRange(1, 1, 1, SHEET_HEADERS[name].length).setValues([SHEET_HEADERS[name]]); 
  }
  return sh;
}

function login(email, password) {
  let data = ss.getSheetByName("member").getDataRange().getValues();
  let inputEmail = String(email).trim().toLowerCase();
  let inputPass = String(password).trim();

  for (let i = 1; i < data.length; i++) {
    let dbEmail = String(data[i][1]).trim().toLowerCase();
    let dbPass = String(data[i][4]).trim();
    if (dbEmail === inputEmail && dbPass === inputPass) {
      return { ok: true, user: { nama: data[i][0], email: data[i][1], hp: data[i][2], role: data[i][3] } };
    }
  }
  return { ok: false, message: "Email atau password salah!" };
}

function getAllData() {
  let shOdp = ss.getSheetByName("odp").getDataRange().getValues(); shOdp.shift();
  let shOlt = ss.getSheetByName("olt").getDataRange().getValues(); shOlt.shift();
  let shMember = ss.getSheetByName("member").getDataRange().getValues(); shMember.shift();
  let shPelanggan = ss.getSheetByName("Data_Pelanggan").getDataRange().getValues(); shPelanggan.shift();
  
  // Sembunyikan password agar aman, jangan kirim data kosong
  let safeMember = [];
  shMember.forEach(r => {
      if(String(r[1]).trim() !== "") safeMember.push([r[0], r[1], r[2], r[3], "********"]);
  });

  let validOlts = shOlt.filter(r => String(r[0]).trim() !== "").map(r => String(r[0]).trim()); 
  let cleanOdp = shOdp.filter(r => validOlts.includes(String(r[2]).trim())); 

  let usedPorts = {};
  shPelanggan.forEach(row => {
     let odp = row[5]; 
     let port = parseInt(row[6]); 
     if (odp && port) {
        if (!usedPorts[odp]) usedPorts[odp] = [];
        usedPorts[odp].push(port);
     }
  });

  return { ok: true, data: { odp: cleanOdp, olt: shOlt, member: safeMember, pelanggan: shPelanggan, usedPorts: usedPorts } };
}

function saveLaporan(laporanDataArray) {
  let sh = ss.getSheetByName("Data_Pelanggan");
  if (laporanDataArray && laporanDataArray.length > 0) {
    let realRow = getRealLastRow(sh);
    sh.getRange(realRow + 1, 1, laporanDataArray.length, laporanDataArray[0].length).setValues(laporanDataArray);
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

  // LOGIKA TAMBAH DATA YANG BENAR MENGHINDARI BARIS HANTU
  if (mode === 'add') { 
      let cleanData = dataRow.map(item => typeof item === 'string' ? item.trim() : item);
      let realRow = getRealLastRow(sh);
      sh.getRange(realRow + 1, 1, 1, cleanData.length).setValues([cleanData]);
      return { ok: true, message: "Data berhasil ditambahkan!" }; 
  }
  
  // LOGIKA EDIT/HAPUS (Bekerja dari bawah agar menimpa duplikat jika ada)
  for (let i = rows.length - 1; i >= 1; i--) {
    let isMatch = false;
    if (sheetName === 'member') {
        isMatch = String(rows[i][keyIndex]).trim().toLowerCase() === String(oldKey).trim().toLowerCase();
    } else {
        isMatch = String(rows[i][keyIndex]).trim() === String(oldKey).trim();
    }

    if (isMatch) {
      if (mode === 'edit') {
        let cleanData = dataRow.map(item => typeof item === 'string' ? item.trim() : item);
        
        // JIKA ADMIN GAK GANTI PASSWORD, PERTAHANKAN PASSWORD LAMA
        if (sheetName === 'member' && String(cleanData[4]).trim() === "********") {
            cleanData[4] = rows[i][4]; 
        }
        
        sh.getRange(i + 1, 1, 1, cleanData.length).setValues([cleanData]);
        return { ok: true, message: "Data berhasil diperbarui!" };
      }
      
      if (mode === 'delete') { 
        sh.deleteRow(i + 1); 
        let deletedOdps = [];

        if (sheetName === 'olt') {
           let odpSh = ss.getSheetByName('odp');
           let odpRows = odpSh.getDataRange().getValues();
           for (let j = odpRows.length - 1; j > 0; j--) {
               if (String(odpRows[j][2]).trim() === String(oldKey).trim()) { 
                   deletedOdps.push(odpRows[j][0]); 
                   odpSh.deleteRow(j + 1); 
               }
           }
        } else if (sheetName === 'odp') {
           deletedOdps.push(oldKey);
        }

        if (sheetName === 'olt' || sheetName === 'odp') {
            let validOlts = ss.getSheetByName('olt').getDataRange().getValues().map(r => String(r[0]).trim());
            validOlts.shift(); 
            let odpSh = ss.getSheetByName('odp');
            let odpRows = odpSh.getDataRange().getValues();
            for (let j = odpRows.length - 1; j > 0; j--) {
                if (!validOlts.includes(String(odpRows[j][2]).trim())) { 
                    deletedOdps.push(odpRows[j][0]);
                    odpSh.deleteRow(j + 1);
                }
            }
        }

        if (deletedOdps.length > 0 || sheetName === 'olt') {
            let pelSh = ss.getSheetByName('Data_Pelanggan');
            let pelRows = pelSh.getDataRange().getValues();
            for (let k = pelRows.length - 1; k > 0; k--) {
                let pelOlt = String(pelRows[k][4]).trim();
                let pelOdp = String(pelRows[k][5]).trim();
                if ((sheetName === 'olt' && pelOlt === String(oldKey).trim()) || deletedOdps.includes(pelOdp)) {
                    pelSh.deleteRow(k + 1); 
                }
            }
        }
        return { ok: true, message: "Data Utama dan Riwayat Terkait Berhasil Dihapus!" }; 
      }
    }
  }
  return { ok: false, message: "Data lama tidak ditemukan!" };
}

function addOdpBulk(olt, odpArray, user) {
  let sh = ss.getSheetByName("odp");
  let now = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
  let rowsData = odpArray.map(nama => [String(nama).trim(), "-", String(olt).trim(), "-", "-", "-", "-", "-", "-", now, user, 16, 0]);
  
  if (rowsData.length > 0) {
      let realRow = getRealLastRow(sh);
      sh.getRange(realRow + 1, 1, rowsData.length, rowsData[0].length).setValues(rowsData);
  }
  return { ok: true, message: `${rowsData.length} ODP berhasil ditambahkan ke ${olt}!` };
}