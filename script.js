// ⚠️ GANTI DENGAN URL WEB APP GOOGLE SCRIPT V2 ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbzy5Y4BNEIoHVICsLEaFxPML1bjdlRpWhqkhnBjtPRCG0J5s2sTGkatpav_1tyA3T17Fw/exec";

let currentUser = null;
let masterData = { odp: [], olt: [], member: [] };

// Status Modal
let activeSheet = ""; // 'odp', 'olt', 'member'
let activeMode = "";  // 'add', 'edit'
let activeOldKey = ""; 

// 1. CEK SESI LOGIN SAAT BUKA WEB
window.onload = () => {
  let savedUser = localStorage.getItem('ionUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    applyRole();
    fetchData(); // Unduh database
  } else {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
  }
};

// 2. PROSES LOGIN (DENGAN ANIMASI)
async function doLogin() {
  let email = document.getElementById('logEmail').value;
  let pass = document.getElementById('logPass').value;
  let btnLogin = document.getElementById('btnLogin');

  if(!email || !pass) return Swal.fire('Error', 'Isi email dan password!', 'error');

  // Animasi Tombol Loading
  btnLogin.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Memeriksa...';
  btnLogin.disabled = true;

  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "login", payload: { email: email, password: pass }}) }).then(r=>r.json());
    
    if (res.ok) {
      // Animasi Sukses (Centang Hijau)
      btnLogin.innerHTML = '<i class="fas fa-check"></i> Berhasil!';
      btnLogin.style.background = '#10b981'; // Ubah warna jadi hijau
      
      currentUser = res.user;
      localStorage.setItem('ionUser', JSON.stringify(currentUser));
      applyRole();
      
      // Kasih jeda 500ms biar usernya lihat centang hijaunya
      setTimeout(() => {
          fetchData(); 
      }, 500);

    } else {
      // Kembalikan tombol jika gagal
      btnLogin.innerHTML = 'Masuk';
      btnLogin.disabled = false;
      Swal.fire('Ditolak', res.message, 'error');
    }
  } catch (e) { 
      btnLogin.innerHTML = 'Masuk';
      btnLogin.disabled = false;
      Swal.fire('Error', 'Koneksi ke server gagal', 'error'); 
  }
}

function doLogout() {
  localStorage.removeItem('ionUser');
  location.reload();
}

function applyRole() {
  document.getElementById('userName').innerText = "Halo, " + currentUser.nama;
  let badge = document.getElementById('userRole');
  badge.innerText = currentUser.role;
  
  if(currentUser.role === 'Admin') {
    badge.classList.add('admin');
    document.body.classList.remove('member-role');
  } else {
    badge.classList.remove('admin');
    document.body.classList.add('member-role'); // CSS otomatis menyembunyikan elemen .admin-only
  }
}

// 3. AMBIL SEMUA DATA
async function fetchData() {
  showLoader("Mengunduh Database...");
  try {
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getData" }) }).then(r=>r.json());
    if (res.ok) {
      masterData = res.data;
      renderOdp(); renderOlt(); renderMember(); populateBulkDropdown();
      
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('appScreen').classList.remove('hidden');
      hideLoader();
    }
  } catch (e) { hideLoader(); Swal.fire('Koneksi Error', 'Gagal sinkron data', 'error'); }
}

// 4. NAVIGASI TAB
function switchTab(tabId, el) {
  document.querySelectorAll('.content-area').forEach(tab => tab.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
  el.classList.add('active');
}

// 5. RENDER LIST DATA
function renderOdp() {
  let q = document.getElementById('searchOdp').value.toLowerCase();
  let html = "";
  masterData.odp.forEach(row => {
    if(row[0].toLowerCase().includes(q) || row[1].toLowerCase().includes(q)) {
      html += `<div class="data-card" onclick="openModal('odp', 'edit', '${row[0]}')">
                 <div class="data-info">
                   <h4>${row[0]}</h4>
                   <p><i class="fas fa-server"></i> ${row[2]} | Max: ${row[11]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });
  document.getElementById('listOdp').innerHTML = html || "<p style='text-align:center; color:#94a3b8; margin-top:20px;'>ODP tidak ditemukan</p>";
}

function renderOlt() {
  let q = document.getElementById('searchOlt').value.toLowerCase();
  let html = "";
  
  masterData.olt.forEach(row => {
    let oltName = row[0];
    
    // Pencarian Text
    if(oltName.toLowerCase().includes(q)) {
      
      // MENGHITUNG JUMLAH ODP DI DALAM OLT INI
      let jumlahODP = masterData.odp.filter(odp => odp[2] === oltName).length;

      html += `<div class="data-card" onclick="openModal('olt', 'edit', '${oltName}')">
                 <div class="data-info">
                   <h4>${oltName}</h4>
                   <p><i class="fas fa-box" style="color:#0ea5e9;"></i> ${jumlahODP} Titik ODP | PON: ${row[3]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });
  
  document.getElementById('listOlt').innerHTML = html || "<p style='text-align:center; color:#94a3b8; margin-top:20px;'>OLT tidak ditemukan</p>";
}

function renderMember() {
  let q = document.getElementById('searchMember').value.toLowerCase();
  let html = "";
  masterData.member.forEach(row => {
    if(row[0].toLowerCase().includes(q)) {
      html += `<div class="data-card" onclick="openModal('member', 'edit', '${row[1]}')">
                 <div class="data-info">
                    <h4>${row[0]}</h4>
                    <p><i class="fas fa-user-tag"></i> ${row[3]} | ${row[1]}</p>
                 </div>
                 <i class="fas fa-chevron-right" style="color:#cbd5e1;"></i>
               </div>`;
    }
  });
  document.getElementById('listMember').innerHTML = html;
}

// 6. MANAJEMEN MODAL (FORM LENGKAP)
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
  
  // Cari data lama jika Edit
  if (mode === 'edit') {
    let keyIndex = sheet === 'member' ? 1 : 0;
    rowData = masterData[sheet].find(r => r[keyIndex] == key) || [];
    document.getElementById('btnDelete').style.display = 'block';
  } else {
    document.getElementById('btnDelete').style.display = 'none';
  }

  // Buat HTML Input secara dinamis
  let html = "";
  fields.forEach((fName, idx) => {
    let val = rowData[idx] !== undefined ? rowData[idx] : (fName === "User" ? currentUser.nama : "");
    let readonly = (currentUser.role !== 'Admin') ? "readonly" : ""; // Member tidak bisa ketik
    let disabled = (currentUser.role !== 'Admin') ? "disabled" : "";
    
    // Disable edit kunci utama (Misal email tidak boleh diedit kalau sudah disave)
    if(mode === 'edit' && currentUser.role === 'Admin' && idx === (sheet==='member'?1:0)) {
        readonly = "readonly";
        disabled = "disabled";
    }

    // 💡 PERUBAHAN BARU: JIKA FIELD ADALAH 'Role', BUAT JADI DROPDOWN
    if (sheet === 'member' && fName === 'Role') {
        let isMember = (val === 'Member' || val === '') ? 'selected' : '';
        let isAdmin = (val === 'Admin') ? 'selected' : '';

        html += `<div class="form-group">
                    <label>${fName}</label>
                    <select id="inp_${idx}" ${disabled} style="width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; background: #f8fafc; outline: none;">
                        <option value="Member" ${isMember}>Member</option>
                        <option value="Admin" ${isAdmin}>Admin</option>
                    </select>
                 </div>`;
    } 
    // Jika bukan Role, tetap pakai input text biasa
    else {
        html += `<div class="form-group">
                    <label>${fName}</label>
                    <input type="text" id="inp_${idx}" value="${val}" ${readonly}>
                 </div>`;
    }
  });

  document.getElementById('modalFormBody').innerHTML = html;
  document.getElementById('crudModal').classList.add('open');
}

function closeModal() {
  document.getElementById('crudModal').classList.remove('open');
  document.getElementById('bulkModal').classList.remove('open');
}

// 7. SIMPAN ATAU HAPUS DATA
async function saveData(actionType) {
  if(currentUser.role !== 'Admin') return Swal.fire('Akses Ditolak', 'Hanya Admin yang bisa mengubah data', 'error');

  let mode = actionType === 'delete' ? 'delete' : activeMode; // add, edit, delete
  let dataRow = [];
  
  if(mode !== 'delete') {
    formFields[activeSheet].forEach((_, idx) => {
      dataRow.push(document.getElementById(`inp_${idx}`).value);
    });
  }

  let textConfirm = mode === 'delete' ? "Hapus permanen data ini?" : "Simpan data ini ke database?";
  let iconC = mode === 'delete' ? 'warning' : 'question';
  
  if(!await Swal.fire({ title: 'Konfirmasi', text: textConfirm, icon: iconC, showCancelButton: true }).then(r=>r.isConfirmed)) return;

  closeModal();
  showLoader("Menyimpan ke Server...");

  try {
    let payload = { sheetName: activeSheet, mode: mode, dataRow: dataRow, oldKey: activeOldKey };
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "crud", payload: payload }) }).then(r=>r.json());
    
    if(res.ok) {
      Swal.fire('Sukses', res.message, 'success');
      fetchData(); // Reload data dari server setelah simpan
    } else { 
      Swal.fire('Gagal', res.message, 'error'); 
    }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); }
  
  hideLoader();
}

// 8. KHUSUS UPLOAD MASSAL ODP
function populateBulkDropdown() {
  let opts = "";
  masterData.olt.forEach(r => opts += `<option value="${r[0]}">${r[0]}</option>`);
  document.getElementById('bulkOltSelect').innerHTML = opts;
}

function openBulkOdp() {
  document.getElementById('bulkOdpText').value = "";
  document.getElementById('bulkModal').classList.add('open');
}

async function saveBulkOdp() {
  let olt = document.getElementById('bulkOltSelect').value;
  let text = document.getElementById('bulkOdpText').value;
  let list = text.split('\n').map(x => x.trim().toUpperCase()).filter(x => x !== "");

  if(list.length === 0) return Swal.fire('Kosong', 'Masukkan minimal 1 ODP', 'warning');
  closeModal();
  showLoader("Mengupload " + list.length + " ODP...");

  try {
    let payload = { olt: olt, odpList: list, user: currentUser.nama };
    let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "addOdpBulk", payload: payload }) }).then(r=>r.json());
    
    if(res.ok) { 
        Swal.fire('Sukses', res.message, 'success'); 
        fetchData(); 
    } else { 
        Swal.fire('Gagal', res.message, 'error'); 
    }
  } catch(e) { Swal.fire('Error', 'Koneksi bermasalah', 'error'); }
  
  hideLoader();
}

// UTILITIES LOADER
function showLoader(text) { 
    document.getElementById('loaderText').innerText = text; 
    document.getElementById('loader').classList.remove('hidden'); 
}
function hideLoader() { 
    document.getElementById('loader').classList.add('hidden'); 
                                                      }
