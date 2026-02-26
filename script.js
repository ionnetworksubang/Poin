const API_URL = "https://script.google.com/macros/s/AKfycbzvuGEkdfJoSQPAGQRGSkVTd-4FIM4FEaIPQKcK6J8Gzae5ox6ASq7rM_TSnxdLBp35/exec";

let currentUser = null;
let masterData = { odp: [], olt: [], member: [] };
let activeSheet = "", activeMode = "", activeOldKey = ""; 

window.onload = () => {
  let savedUser = localStorage.getItem('ionUser');
  if (savedUser) { currentUser = JSON.parse(savedUser); applyRole(); fetchData(); } 
  else { document.getElementById('loader').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); }
};

async function doLogin() {
  let email = document.getElementById('logEmail').value; let pass = document.getElementById('logPass').value; let btn = document.getElementById('btnLogin');
  if(!email || !pass) return Swal.fire('Oops!', 'Isi email dan password.', 'warning');
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memeriksa...'; btn.disabled = true;
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "login", payload: { email: email, password: pass }}) }).then(r=>r.json());
    if (res.ok) {
      btn.innerHTML = '<i class="fas fa-check"></i> Berhasil!'; btn.style.background = '#10b981'; 
      currentUser = res.user; localStorage.setItem('ionUser', JSON.stringify(currentUser)); applyRole();
      setTimeout(() => { fetchData(); }, 500);
    } else { btn.innerHTML = 'Masuk Akses'; btn.disabled = false; Swal.fire('Ditolak', res.message, 'error'); }
  } catch (e) { btn.innerHTML = 'Masuk Akses'; btn.disabled = false; Swal.fire('Error', 'Koneksi gagal.', 'error'); }
}

function doLogout() { localStorage.removeItem('ionUser'); location.reload(); }
function applyRole() {
  document.getElementById('userName').innerText = "Halo, " + currentUser.nama.split(' ')[0];
  let badge = document.getElementById('userRole'); badge.innerText = currentUser.role;
  if(currentUser.role === 'Admin') { badge.classList.add('admin'); document.body.classList.remove('member-role'); } 
  else { badge.classList.remove('admin'); document.body.classList.add('member-role'); }
}

async function fetchData() {
  showLoader("Mengunduh Database...");
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getData" }) }).then(r=>r.json());
    if (res.ok) {
      masterData = res.data; populateOltDropdowns(); renderOdp(); renderOlt(); renderMember();
      document.getElementById('loginScreen').classList.add('hidden'); document.getElementById('appScreen').classList.remove('hidden'); hideLoader();
    }
  } catch (e) { hideLoader(); Swal.fire('Error', 'Gagal sinkron data', 'error'); }
}

function populateOltDropdowns() {
  let filterOpts = '<option value="">Semua OLT Induk</option>', bulkOpts = '';
  masterData.olt.forEach(r => { filterOpts += `<option value="${r[0]}">${r[0]}</option>`; bulkOpts += `<option value="${r[0]}">${r[0]}</option>`; });
  document.getElementById('filterOdpOlt').innerHTML = filterOpts; document.getElementById('bulkOltSelect').innerHTML = bulkOpts;
}

function switchTab(tabId, el) {
  document.querySelectorAll('.content-area').forEach(tab => tab.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  el.classList.add('active'); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderOdp() {
  let q = document.getElementById('searchOdp').value.toLowerCase(), filterOlt = document.getElementById('filterOdpOlt').value, html = "", totalData = 0;
  masterData.odp.forEach(row => {
    let namaOdp = row[0].toLowerCase(), kodeOdp = row[1].toLowerCase(), oltInduk = row[2];
    if((namaOdp.includes(q) || kodeOdp.includes(q)) && (filterOlt === "" || oltInduk === filterOlt)) {
      totalData++;
      html += `<div class="data-card" onclick="openModal('odp', 'edit', '${row[0]}')"><div><h4 style="font-size:1rem; margin-bottom:5px;">${row[0]}</h4><p style="font-size:0.8rem; color:#64748b;"><i class="fas fa-server" style="color:#2563eb;"></i> ${oltInduk} | Max: ${row[11]}</p></div><i class="fas fa-chevron-right" style="color:#cbd5e1;"></i></div>`;
    }
  });
  document.getElementById('listOdp').innerHTML = totalData === 0 ? "<p style='text-align:center; color:#94a3b8; margin-top:20px;'>Data tidak ditemukan</p>" : html;
}

function renderOlt() {
  let q = document.getElementById('searchOlt').value.toLowerCase(), html = "";
  masterData.olt.forEach(row => {
    if(row[0].toLowerCase().includes(q)) {
      let jumlahODP = masterData.odp.filter(odp => odp[2] === row[0]).length;
      html += `<div class="data-card" onclick="openModal('olt', 'edit', '${row[0]}')"><div><h4 style="font-size:1rem; margin-bottom:5px;">${row[0]}</h4><p style="font-size:0.8rem; color:#64748b;"><i class="fas fa-box" style="color:#2563eb;"></i> ${jumlahODP} Titik ODP | PON: ${row[3]}</p></div><i class="fas fa-chevron-right" style="color:#cbd5e1;"></i></div>`;
    }
  });
  document.getElementById('listOlt').innerHTML = html || "<p style='text-align:center; color:#94a3b8; margin-top:20px;'>OLT tidak ditemukan</p>";
}

function renderMember() {
  let q = document.getElementById('searchMember').value.toLowerCase(), html = "";
  masterData.member.forEach(row => {
    if(row[0].toLowerCase().includes(q)) {
      html += `<div class="data-card" onclick="openModal('member', 'edit', '${row[1]}')"><div><h4 style="font-size:1rem; margin-bottom:5px;">${row[0]}</h4><p style="font-size:0.8rem; color:#64748b;"><i class="fas fa-user-tag" style="color:#2563eb;"></i> ${row[3]} | ${row[1]}</p></div><i class="fas fa-chevron-right" style="color:#cbd5e1;"></i></div>`;
    }
  });
  document.getElementById('listMember').innerHTML = html;
}

const formFields = { odp: [ "Nama ODP", "Kode ODP", "OLT", "PON", "Card", "Tikor", "Link Maps", "Data Core", "Team", "Tanggal Input", "User", "Max Port", "Port Terpakai" ], olt: [ "Nama OLT", "Lokasi", "Jumlah Card", "Jumlah PON", "PON Terpakai", "PON Kosong" ], member: [ "Nama", "Email", "No HP", "Role", "Password" ] };

function openModal(sheet, mode, key = "") {
  activeSheet = sheet; activeMode = mode; activeOldKey = key;
  document.getElementById('modalTitle').innerText = mode === 'add' ? `Tambah ${sheet.toUpperCase()}` : `Detail ${sheet.toUpperCase()}`;
  let rowData = mode === 'edit' ? (masterData[sheet].find(r => r[sheet === 'member' ? 1 : 0] == key) || []) : [];
  document.getElementById('btnDelete').style.display = mode === 'edit' ? 'flex' : 'none';

  let html = "";
  formFields[sheet].forEach((fName, idx) => {
    let val = rowData[idx] !== undefined ? rowData[idx] : (fName === "User" ? currentUser.nama : "");
    let readonly = (currentUser.role !== 'Admin') ? "readonly" : ""; 
    let disabled = (currentUser.role !== 'Admin') ? "disabled" : "";
    if(mode === 'edit' && currentUser.role === 'Admin' && idx === (sheet==='member'?1:0)) { readonly = "readonly"; disabled = "disabled"; }

    if (sheet === 'member' && fName === 'Role') {
        html += `<div class="form-group"><label>${fName}</label><select id="inp_${idx}" ${disabled}><option value="Member" ${val==='Member'?'selected':''}>Member</option><option value="Admin" ${val==='Admin'?'selected':''}>Admin</option></select></div>`;
    } else if (sheet === 'odp' && fName === 'OLT') {
        let opts = '<option value="">Pilih OLT Induk</option>';
        masterData.olt.forEach(r => opts += `<option value="${r[0]}" ${val===r[0]?'selected':''}>${r[0]}</option>`);
        html += `<div class="form-group"><label>${fName}</label><select id="inp_${idx}" ${disabled}>${opts}</select></div>`;
    } else {
        html += `<div class="form-group"><label>${fName}</label><input type="text" id="inp_${idx}" value="${val}" ${readonly}></div>`;
    }
  });
  document.getElementById('modalFormBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open'); document.getElementById('crudModal').classList.add('open');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); document.getElementById('crudModal').classList.remove('open'); document.getElementById('bulkModal').classList.remove('open'); }

async function saveData(actionType) {
  if(currentUser.role !== 'Admin') return Swal.fire('Akses Ditolak', 'Hanya Admin.', 'error');
  let mode = actionType === 'delete' ? 'delete' : activeMode, dataRow = [];
  if(mode !== 'delete') formFields[activeSheet].forEach((_, idx) => dataRow.push(document.getElementById(`inp_${idx}`).value));
  
  if(!await Swal.fire({ title: 'Konfirmasi', text: 'Lanjutkan?', icon: 'question', showCancelButton: true }).then(r=>r.isConfirmed)) return;
  closeModal(); showLoader("Menyimpan...");
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "crud", payload: { sheetName: activeSheet, mode: mode, dataRow: dataRow, oldKey: activeOldKey } }) }).then(r=>r.json());
    if(res.ok) { Swal.fire('Berhasil!', res.message, 'success'); fetchData(); } else { Swal.fire('Gagal', res.message, 'error'); }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); } hideLoader();
}

function openBulkOdp() { document.getElementById('bulkOdpText').value = ""; document.getElementById('modalOverlay').classList.add('open'); document.getElementById('bulkModal').classList.add('open'); }
async function saveBulkOdp() {
  let olt = document.getElementById('bulkOltSelect').value, text = document.getElementById('bulkOdpText').value;
  let list = text.split('\n').map(x => x.trim().toUpperCase()).filter(x => x !== "");
  if(list.length === 0) return Swal.fire('Ups!', 'Kosong.', 'warning');
  closeModal(); showLoader(`Mengupload ${list.length} ODP...`);
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "addOdpBulk", payload: { olt: olt, odpList: list, user: currentUser.nama } }) }).then(r=>r.json());
    if(res.ok) { Swal.fire('Berhasil!', res.message, 'success'); fetchData(); } else { Swal.fire('Gagal', res.message, 'error'); }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); } hideLoader();
}

function showLoader(text) { document.getElementById('loaderText').innerText = text; document.getElementById('loader').classList.remove('hidden'); }
function hideLoader() { document.getElementById('loader').classList.add('hidden'); }