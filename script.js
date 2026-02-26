// ⚠️ GANTI DENGAN URL WEB APP GOOGLE SCRIPT V2 ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbzy5Y4BNEIoHVICsLEaFxPML1bjdlRpWhqkhnBjtPRCG0J5s2sTGkatpav_1tyA3T17Fw/exec";

let currentUser = null;
let masterData = { odp: [], olt: [], member: [] };

let activeSheet = ""; 
let activeMode = "";  
let activeOldKey = ""; 

window.onload = () => {
  let savedUser = localStorage.getItem('ionUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    applyRole();
    fetchData(); 
  } else {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
  }
};

async function doLogin() {
  let email = document.getElementById('logEmail').value;
  let pass = document.getElementById('logPass').value;
  let btnLogin = document.getElementById('btnLogin');

  if(!email || !pass) return Swal.fire('Oops!', 'Isi email dan password dulu ya.', 'warning');

  btnLogin.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memeriksa...';
  btnLogin.disabled = true;

  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "login", payload: { email: email, password: pass }}) }).then(r=>r.json());
    
    if (res.ok) {
      btnLogin.innerHTML = '<i class="fas fa-check"></i> Berhasil Masuk!';
      btnLogin.style.background = '#10b981'; 
      
      currentUser = res.user;
      localStorage.setItem('ionUser', JSON.stringify(currentUser));
      applyRole();
      
      setTimeout(() => { fetchData(); }, 500);
    } else {
      btnLogin.innerHTML = 'Masuk Akses';
      btnLogin.disabled = false;
      Swal.fire('Akses Ditolak', res.message, 'error');
    }
  } catch (e) { 
      btnLogin.innerHTML = 'Masuk Akses';
      btnLogin.disabled = false;
      Swal.fire('Koneksi Gagal', 'Pastikan internet stabil dan coba lagi.', 'error'); 
  }
}

function doLogout() {
  localStorage.removeItem('ionUser');
  location.reload();
}

function applyRole() {
  document.getElementById('userName').innerText = "Halo, " + currentUser.nama.split(' ')[0];
  let badge = document.getElementById('userRole');
  badge.innerText = currentUser.role;
  
  if(currentUser.role === 'Admin') {
    badge.classList.add('admin');
    document.body.classList.remove('member-role');
  } else {
    badge.classList.remove('admin');
    document.body.classList.add('member-role');
  }
}

async function fetchData() {
  showLoader("Mengunduh Database...");
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getData" }) }).then(r=>r.json());
    if (res.ok) {
      masterData = res.data;
      populateOltDropdowns(); // Isi opsi filter & modal
      renderOdp(); 
      renderOlt(); 
      renderMember();
      
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('appScreen').classList.remove('hidden');
      hideLoader();
    }
  } catch (e) { hideLoader(); Swal.fire('Koneksi Error', 'Gagal sinkron data', 'error'); }
}

// MENGISI DROPDOWN FILTER & BULK OLT
function populateOltDropdowns() {
  let filterOpts = '<option value="">Semua OLT Induk</option>';
  let bulkOpts = '';
  
  masterData.olt.forEach(r => {
      filterOpts += `<option value="${r[0]}">${r[0]}</option>`;
      bulkOpts += `<option value="${r[0]}">${r[0]}</option>`;
  });
  
  document.getElementById('filterOdpOlt').innerHTML = filterOpts;
  document.getElementById('bulkOltSelect').innerHTML = bulkOpts;
}

// PERBAIKAN: TAB SWITCH DENGAN CSS ANIMATION SLIDE
function switchTab(tabId, el) {
  // Matikan semua tab
  document.querySelectorAll('.content-area').forEach(tab => {
      tab.classList.remove('active');
  });
  
  // Nyalakan tab yang dipilih (CSS Keyframe 'slideIn' otomatis jalan)
  document.getElementById('tab-' + tabId).classList.add('active');

  // Update menu bawah
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// PERBAIKAN: RENDER ODP SEKARANG MENGENALI FILTER OLT
function renderOdp() {
  let q = document.getElementById('searchOdp').value.toLowerCase();
  let filterOlt = document.getElementById('filterOdpOlt').value; // Ambil nilai dropdown filter
  
  let html = "";
  let totalData = 0;

  masterData.odp.forEach(row => {
    let namaOdp = row[0].toLowerCase();
    let kodeOdp = row[1].toLowerCase();
    let oltInduk = row[2]; // Nama OLT di ODP
    
    // Logika Pencarian: Cek kata kunci DAN cek kecocokan OLT
    let matchQuery = namaOdp.includes(q) || kodeOdp.includes(q);
    let matchFilter = filterOlt === "" || oltInduk === filterOlt;

    if(matchQuery && matchFilter) {
      totalData++;
      html += `<div class="data-card" onclick="openModal('odp', 'edit', '${row[0]}')">
                 <div class="data-info">
                   <h4>${row[0]}</h4>
                   <p><i class="fas fa-server data-icon"></i> ${oltInduk} | Max: ${row[11]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });

  if(totalData === 0) {
      html = `<div style='text-align:center; color:#94a3b8; margin-top:40px;'>
                <i class='fas fa-search' style='font-size:2.5rem; margin-bottom:15px; display:block; color:#cbd5e1;'></i>
                <p>Data tidak ditemukan</p>
              </div>`;
  }

  document.getElementById('listOdp').innerHTML = html;
}

function renderOlt() {
  let q = document.getElementById('searchOlt').value.toLowerCase();
  let html = "";
  masterData.olt.forEach(row => {
    let oltName = row[0];
    if(oltName.toLowerCase().includes(q)) {
      let jumlahODP = masterData.odp.filter(odp => odp[2] === oltName).length;
      html += `<div class="data-card" onclick="openModal('olt', 'edit', '${oltName}')">
                 <div class="data-info">
                   <h4>${oltName}</h4>
                   <p><i class="fas fa-box data-icon"></i> ${jumlahODP} Titik ODP | PON: ${row[3]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });
  document.getElementById('listOlt').innerHTML = html || "<p style='text-align:center; color:#94a3b8; margin-top:40px;'><i class='fas fa-server' style='font-size:2.5rem; margin-bottom:15px; display:block; color:#cbd5e1;'></i>OLT tidak ditemukan</p>";
}

function renderMember() {
  let q = document.getElementById('searchMember').value.toLowerCase();
  let html = "";
  masterData.member.forEach(row => {
    if(row[0].toLowerCase().includes(q)) {
      html += `<div class="data-card" onclick="openModal('member', 'edit', '${row[1]}')">
                 <div class="data-info">
                    <h4>${row[0]}</h4>
                    <p><i class="fas fa-user-tag data-icon"></i> ${row[3]} | ${row[1]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });
  document.getElementById('listMember').innerHTML = html;
}

const formFields = {
  odp: [ "Nama ODP", "Kode ODP", "OLT", "PON", "Card", "Tikor", "Link Maps", "Data Core", "Team", "Tanggal Input", "User", "Max Port", "Port Terpakai" ],
  olt: [ "Nama OLT", "Lokasi", "Jumlah Card", "Jumlah PON", "PON Terpakai", "PON Kosong" ],
  member: [ "Nama", "Email", "No HP", "Role", "Password" ]
};

function openModal(sheet, mode, key = "") {
  activeSheet = sheet; activeMode = mode; activeOldKey = key;
  let title = mode === 'add' ? `Tambah ${sheet.toUpperCase()}` : `Detail ${sheet.toUpperCase()}`;
  document.getElementById('modalTitle').innerText = title;

  let fields = formFields[sheet];
  let rowData = [];
  
  if (mode === 'edit') {
    let keyIndex = sheet === 'member' ? 1 : 0;
    rowData = masterData[sheet].find(r => r[keyIndex] == key) || [];
    document.getElementById('btnDelete').style.display = 'flex';
  } else {
    document.getElementById('btnDelete').style.display = 'none';
  }

  let html = "";
  fields.forEach((fName, idx) => {
    let val = rowData[idx] !== undefined ? rowData[idx] : (fName === "User" ? currentUser.nama : "");
    let readonly = (currentUser.role !== 'Admin') ? "readonly" : ""; 
    let disabled = (currentUser.role !== 'Admin') ? "disabled" : "";
    
    if(mode === 'edit' && currentUser.role === 'Admin' && idx === (sheet==='member'?1:0)) {
        readonly = "readonly"; disabled = "disabled";
    }

    if (sheet === 'member' && fName === 'Role') {
        let isMember = (val === 'Member' || val === '') ? 'selected' : '';
        let isAdmin = (val === 'Admin') ? 'selected' : '';
        html += `<div class="form-group"><label>${fName}</label><select id="inp_${idx}" ${disabled}><option value="Member" ${isMember}>Member</option><option value="Admin" ${isAdmin}>Admin</option></select></div>`;
    } 
    // DROPDOWN UNTUK OLT SAAT TAMBAH/EDIT ODP
    else if (sheet === 'odp' && fName === 'OLT') {
        let oltOptions = '<option value="">Pilih OLT Induk</option>';
        masterData.olt.forEach(r => {
            let sel = (val === r[0]) ? 'selected' : '';
            oltOptions += `<option value="${r[0]}" ${sel}>${r[0]}</option>`;
        });
        html += `<div class="form-group"><label>${fName}</label><select id="inp_${idx}" ${disabled}>${oltOptions}</select></div>`;
    }
    else {
        html += `<div class="form-group"><label>${fName}</label><input type="text" id="inp_${idx}" value="${val}" ${readonly}></div>`;
    }
  });

  document.getElementById('modalFormBody').innerHTML = html;
  
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('crudModal').classList.add('open');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('crudModal').classList.remove('open');
  document.getElementById('bulkModal').classList.remove('open');
}

async function saveData(actionType) {
  if(currentUser.role !== 'Admin') return Swal.fire('Akses Ditolak', 'Hanya Admin yang dapat mengubah data.', 'error');

  let mode = actionType === 'delete' ? 'delete' : activeMode; 
  let dataRow = [];
  
  if(mode !== 'delete') {
    formFields[activeSheet].forEach((_, idx) => {
      dataRow.push(document.getElementById(`inp_${idx}`).value);
    });
  }

  let textConfirm = mode === 'delete' ? "Yakin ingin menghapus data ini secara permanen?" : "Pastikan data sudah benar. Simpan sekarang?";
  let iconC = mode === 'delete' ? 'warning' : 'question';
  
  if(!await Swal.fire({ title: 'Konfirmasi', text: textConfirm, icon: iconC, showCancelButton: true, confirmButtonText: 'Ya, Lanjutkan' }).then(r=>r.isConfirmed)) return;

  closeModal();
  showLoader("Menyimpan ke Server...");

  try {
    let payload = { sheetName: activeSheet, mode: mode, dataRow: dataRow, oldKey: activeOldKey };
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "crud", payload: payload }) }).then(r=>r.json());
    
    if(res.ok) {
      Swal.fire('Berhasil!', res.message, 'success');
      fetchData(); 
    } else { 
      Swal.fire('Gagal', res.message, 'error'); 
    }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); }
  hideLoader();
}

function openBulkOdp() {
  document.getElementById('bulkOdpText').value = "";
  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('bulkModal').classList.add('open');
}

async function saveBulkOdp() {
  let olt = document.getElementById('bulkOltSelect').value;
  let text = document.getElementById('bulkOdpText').value;
  let list = text.split('\n').map(x => x.trim().toUpperCase()).filter(x => x !== "");

  if(list.length === 0) return Swal.fire('Ups!', 'Daftar ODP tidak boleh kosong.', 'warning');
  closeModal();
  showLoader(`Mengupload ${list.length} ODP...`);

  try {
    let payload = { olt: olt, odpList: list, user: currentUser.nama };
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "addOdpBulk", payload: payload }) }).then(r=>r.json());
    
    if(res.ok) { Swal.fire('Berhasil!', res.message, 'success'); fetchData(); } 
    else { Swal.fire('Gagal', res.message, 'error'); }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); }
  hideLoader();
}

function showLoader(text) { 
    document.getElementById('loaderText').innerText = text; 
    document.getElementById('loader').classList.remove('hidden'); 
}
function hideLoader() { 
    document.getElementById('loader').classList.add('hidden'); 
                          }
