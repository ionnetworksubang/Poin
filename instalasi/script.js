let formCount = 0;

// ⚠️ GANTI DENGAN URL WEB APP GOOGLE SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbwoy3IE5ve-oSqDZucuprr-zV_4hhWZrAoAFY-xe5RSdMxhUmA7Xh_JPkQFwibJPNEz/exec?action=getMapping";

let odpMasterData = {}; 
let isDataReady = false;

// SINKRONISASI DATA DARI GOOGLE SHEETS
async function fetchODPData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.ok) {
            odpMasterData = result.data;
            isDataReady = true;
            updateDate(); 

            // Matikan loading screen jika sukses
            const loaderText = document.getElementById('loaderText');
            if(loaderText) loaderText.innerText = "Database Siap!";
            setTimeout(() => {
                const loader = document.getElementById('techLoader');
                if(loader) loader.classList.add('hidden');
            }, 500);

        } else {
            alert("Gagal memuat database: " + result.message);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('loaderText').innerText = "Gagal Terhubung ke Server!";
        document.getElementById('loaderText').style.color = "red";
    }
}

// DROPDOWN OLT
function generateOltOptions() {
    if (!isDataReady) return `<option value="">-- Sedang Memuat OLT --</option>`;
    let options = `<option value="">-- Pilih OLT --</option>`;
    Object.keys(odpMasterData).sort().forEach(olt => {
        options += `<option value="${olt}">${olt}</option>`;
    });
    return options;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    fetchODPData();
});

// FUNGSI PENCARIAN ODP PINTAR
function searchODP(inputElement, resultsId, idForm) {
  if (!isDataReady) return;
  const searchTerm = inputElement.value.toLowerCase();
  const resultsContainer = document.getElementById(resultsId);
  
  if (searchTerm.length < 1) { resultsContainer.style.display = 'none'; return; }

  let availableODPs = [];
  const oltSelect = document.getElementById(`olt${idForm}`);
  
  if (oltSelect) {
      const selectedOlt = oltSelect.value;
      if (!selectedOlt) {
          resultsContainer.innerHTML = `<div class="search-result-item" style="color:#e74c3c;">Silakan pilih OLT terlebih dahulu!</div>`;
          resultsContainer.style.display = 'block'; return;
      }
      availableODPs = odpMasterData[selectedOlt] || [];
  } else {
      Object.values(odpMasterData).forEach(odpList => { availableODPs = availableODPs.concat(odpList); });
      availableODPs = [...new Set(availableODPs)];
  }
  
  const filteredODP = availableODPs.filter(odp => odp.toLowerCase().includes(searchTerm));
  if (filteredODP.length > 0) {
    resultsContainer.innerHTML = filteredODP.map(odp => `<div class="search-result-item" onclick="selectODP('${inputElement.id}', '${odp}')">${odp}</div>`).join('');
  } else {
    resultsContainer.innerHTML = `<div class="search-result-item" style="color:#7f8c8d;">ODP tidak ditemukan</div>`;
  }
  resultsContainer.style.display = 'block';
}

function selectODP(inputId, odpValue) {
  const inputEl = document.getElementById(inputId);
  inputEl.value = odpValue;
  // Reset warna jika sebelumnya merah
  inputEl.style.border = "1px solid #ccc"; 
  inputEl.style.backgroundColor = "";
  document.getElementById(inputId.replace('odp', 'odpResults').replace('odplama', 'odplamaResults').replace('odpbaru', 'odpbaruResults')).style.display = 'none';
}

function resetODP(idForm) {
    const odpInput = document.getElementById(`odp${idForm}`);
    if (odpInput) { 
        odpInput.value = ''; 
        odpInput.style.border = "1px solid #ccc"; 
        odpInput.style.backgroundColor = ""; 
    }
}

document.addEventListener('click', function(e) {
  if (!e.target.matches('.search-container input')) {
    document.querySelectorAll('.search-results').forEach(r => r.style.display = 'none');
  }
});

// FUNGSI TOGGLE ASLI ANDA
function toggleSNForm(id) {
    const snForm = document.getElementById(`snForm${id}`);
    const toggleBtn = document.querySelector(`[onclick="toggleSNForm(${id})"]`);
    if (snForm.style.display === 'none') { snForm.style.display = 'block'; toggleBtn.innerHTML = '<i class="fas fa-times"></i> Sembunyikan Form SN'; toggleBtn.style.background = '#e0e0e0'; } 
    else { snForm.style.display = 'none'; toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Ganti Perangkat'; toggleBtn.style.background = '#f0f0f0'; }
}

function toggleODPForm(id) {
    const odpForm = document.getElementById(`odpForm${id}`);
    const toggleBtn = document.querySelector(`[onclick="toggleODPForm(${id})"]`);
    if (odpForm.style.display === 'none') { odpForm.style.display = 'block'; toggleBtn.innerHTML = '<i class="fas fa-times"></i> Sembunyikan Form ODP'; toggleBtn.style.background = '#e0e0e0'; } 
    else { odpForm.style.display = 'none'; toggleBtn.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Pindah ODP'; toggleBtn.style.background = '#f0f0f0'; }
}

// FORMAT TANGGAL ASLI ANDA
function updateDate() {
  const now = new Date(); const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateString = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('currentDate').textContent = dateString;
  if (!document.getElementById('reportDate').value) document.getElementById('reportDate').value = dateString;
}
function getDefaultDate() {
  const now = new Date(); const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
}
function formatFullDate(inputDate) {
    if (!inputDate) return ''; const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']; const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const date = new Date(inputDate + 'T00:00:00'); return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}
function getValue(id) { const element = document.getElementById(id); return element ? element.value.trim() : ''; }


// TEMPLATE HTML ASLI GITHUB ANDA (Hanya disisipkan {oltOptions})
const formTemplates = {
  tambahinstalasi: `
    <div class="instalasi-form">
        <div class="form-header"><h3>INSTALASI</h3></div>
        <input type="hidden" id="jenis{id}" value="Instalasi">
        
        <label for="nama{id}">Nama <span class="required-label">*</span></label>
        <input type="text" id="nama{id}" placeholder="Nama pelanggan">
        
        <label for="cid{id}">CID <span class="required-label">*</span></label>
        <input type="number" id="cid{id}" inputmode="numeric" placeholder="Nomor CID">

        <label for="passwordmemberarea{id}">Password Member Area <span class="required-label">*</span></label>
       <input type="number" id="passwordmemberarea{id}" inputmode="numeric" pattern="[0-9]*" placeholder="Password Member Area">

        <label for="email{id}">Email <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label>
        <input type="email" id="email{id}" placeholder="Email pelanggan">
        
        <label for="olt{id}">OLT <span class="required-label">*</span></label>
        <select id="olt{id}" onchange="resetODP('{id}')">{oltOptions}</select>
        
        <div class="form-grid">
            <div class="search-container">
                <label for="odp{id}">ODP <span class="required-label">*</span></label>
                <input type="text" id="odp{id}" placeholder="Ketik mencari ODP" oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off">
                <div class="search-results" id="odpResults{id}"></div>
            </div>
            <div>
                <label for="port{id}">Port <span class="required-label">*</span></label>
                <select id="port{id}"><option value="">-- Pilih Port --</option>${Array.from({length: 16}, (_, i) => `<option value="${i + 1}">Port ${i + 1}</option>`).join('')}</select>
            </div>
        </div>
        
        <label for="jenis_perangkat{id}">Jenis Perangkat <span class="required-label">*</span></label>
        <select id="jenis_perangkat{id}" onchange="updateSN('{id}')">
            <option value="">-- Pilih jenis perangkat --</option><option value="C-DATA XPON ONU">C-DATA XPON ONU</option><option value="C-DATA XPON DUAL-BAND ONU">C-DATA XPON DUAL-BAND ONU</option><option value="RISECOME">RISECOME</option><option value="RISECOME (DISMANTLE)">RISECOME (DISMANTLE)</option><option value="C-DATA XPON ONU (DISMANTLE)">C-DATA XPON ONU (DISMANTLE)</option>
        </select>
        
        <label for="sn_perangkat{id}">SN Perangkat <span class="required-label">*</span></label>
        <input type="text" id="sn_perangkat{id}" placeholder="Serial number perangkat">
        
        <div class="form-grid">
            <div>
                <label for="dropcore{id}">Dropcore <span class="required-label">*</span></label>
                <select id="dropcore{id}"><option value="">Pilih panjang</option><option value="50 Meter">50 Meter</option><option value="100 Meter">100 Meter</option><option value="150 Meter">150 Meter</option><option value="200 Meter" selected>200 Meter</option><option value="225 Meter">225 Meter</option><option value="250 Meter">250 Meter</option><option value="275 Meter">275 Meter</option><option value="300 Meter">300 Meter</option><option value="Kabel Terminate">Kabel Terminate</option></select>
            </div>
            <div>
                <label for="patchcord{id}">Patchcord <span class="required-label">*</span></label>
                <select id="patchcord{id}"><option value="">Pilih jumlah</option><option value="1 Pcs" selected>1 Pcs</option><option value="2 Pcs">2 Pcs</option><option value="3 Pcs">3 Pcs</option></select>
            </div>
        </div>
        <label for="keterangan{id}">Keterangan <span class="required-label">*</span></label>
        <input type="text" id="keterangan{id}" value="Selesai">
    </div>
  `,
  jadwalulanginstalasi: `<div class="form-header"><h3>Jadwal Ulang Instalasi</h3></div><input type="hidden" id="jenis{id}" value="Jadwal Ulang Instalasi"><label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label><input type="text" id="nama{id}" placeholder="Nama pelanggan"><label for="alasan{id}">Alasan Reschedule <span class="required-label">*</span></label><select id="alasan{id}"><option value="">Pilih Alasan</option><option value="Pelanggan minta di jawalkan ulang">Pelanggan minta di jawalkan ulang</option><option value="Pelanggan minta di jawalkan ulang besok">Pelanggan minta di jadwalkan ulang besok</option><option value="Pelanggan minta di jawalkan ulang minggu depan">Pelanggan minta di jadwalkan ulang minggu depan</option><option value="Pelanggan minta di jawalkan ulang bulan depan">Pelanggan minta di jadwalkan ulang bulan depan</option><option value="Pelanggan tidak ada di rumah">Pelanggan tidak ada di rumah</option><option value="Pelanggan sedang sakit">Pelanggan sedang sakit</option><option value="Pelanggan pindah alamat">Pelanggan pindah alamat</option><option value="Pelanggan tidak bisa dihubungi">Pelanggan tidak bisa dihubungi</option><option value="Pelanggan sedang bepergian">Pelanggan sedang bepergian</option><option value="Instalasi ditunda karena pelanggan belum siap secara biaya">Instalasi ditunda karena pelanggan belum siap secara biaya</option><option value="Kendala listrik">Kendala listrik</option><option value="Jarak terlalu jauh, menunggu pengembangan ODP">Jarak terlalu jauh, menunggu pengembangan ODP</option><option value="Cuaca buruk">Cuaca buruk</option><option value="Pemasangan malam hari sudah terlalu larut">Pemasangan malam hari sudah terlalu larut</option><option value="Perlu izin RT/RW">Perlu izin RT/RW</option><option value="ODP penuh, menunggu pengembangan ODP">ODP penuh, menunggu pegembagan ODP</option><option value="Pelanggan sedang bekerja atau sibuk,">Pemilik rumah sedang kerja atau sibuk</option><option value="Lainnya">Lainnya</option></select><label for="keterangan{id}">Keterangan Tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label><textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea><label for="jadwal{id}">Tanggal Request <span class="required-label">*</span></label><input type="date" id="jadwal{id}">`,
  tambahmaintenance: `<div class="maintenance-form"><div class="form-header"><h3>Maintenance</h3></div><input type="hidden" id="jenis{id}" value="Maintenance"><div class="form-group"><label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label><input type="text" id="nama{id}" class="form-control required" placeholder="Nama pelanggan"></div><div class="form-group"><label for="cid{id}">CID <span class="required-label">*</span></label><input type="number" id="cid{id}" class="form-control required" placeholder="Nomor CID"></div><div class="search-container"><label for="odp{id}">ODP <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><input type="text" id="odp{id}" placeholder="Ketik untuk mencari ODP" oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpResults{id}"></div></div><div class="form-group"><label for="rodp{id}">R. ODP <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><input type="text" id="rodp{id}" placeholder="Redaman ODP"></div><div class="form-grid"><div class="form-group"><label for="rcbefore{id}">R.C Before <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><input type="text" id="rcbefore{id}" placeholder="Redaman odp sebelum"></div><div class="form-group"><label for="rcafter{id}">R.C After <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><input type="text" id="rcafter{id}" placeholder="Redaman odp sesudah"></div></div><div class="form-group"><label for="ken{id}">Kendala <span class="required-label">*</span></label><input type="text" id="ken{id}" class="form-control required" placeholder="Masalah yang ditemukan"></div><div class="form-group"><label for="tin{id}">Tindakan <span class="required-label">*</span></label><input type="text" id="tin{id}" class="form-control required" placeholder="Tindakan perbaikan"></div><div class="form-group"><label>Ganti Perangkat <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><button type="button" class="toggle-btn" onclick="toggleSNForm({id})" id="snBtn{id}"><i class="fas fa-exchange-alt"></i> Ganti Perangkat</button></div><div id="snForm{id}" class="toggle-form" style="display: none;"><div class="form-grid"><div class="form-group"><label for="snlama{id}">SN Lama</label><input type="text" id="snlama{id}" placeholder="Serial number lama"></div><div class="form-group"><label for="snbaru{id}">SN Baru</label><input type="text" id="snbaru{id}" placeholder="Serial number baru"></div></div></div><div class="form-group"><label>Pindah ODP <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><button type="button" class="toggle-btn" onclick="toggleODPForm({id})" id="odpBtn{id}"><i class="fas fa-arrows-alt-h"></i> Pindah ODP</button></div><div id="odpForm{id}" class="toggle-form" style="display: none;"><div class="search-container"><label for="odplama{id}">ODP Lama</label><input type="text" id="odplama{id}" placeholder="Ketik mencari ODP lama" oninput="searchODP(this, 'odplamaResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odplamaResults{id}"></div></div><div class="search-container"><label for="odpbaru{id}">ODP Baru</label><input type="text" id="odpbaru{id}" placeholder="Ketik mencari ODP baru" oninput="searchODP(this, 'odpbaruResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpbaruResults{id}"></div></div></div><div class="form-grid"><div class="form-group"><label for="dropcore{id}">Dropcore <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><select id="dropcore{id}" class="optional-field"><option value="">Pilih panjang</option><option value="10 Meter">10 Meter</option><option value="20 Meter">20 Meter</option><option value="30 Meter">30 Meter</option><option value="50 Meter">50 Meter</option><option value="100 Meter">100 Meter</option><option value="150 Meter">150 Meter</option><option value="200 Meter">200 Meter</option></select></div><div class="form-group"><label for="patchcord{id}">Patchcord <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</span></label><select id="patchcord{id}" class="optional-field"><option value="">Pilih jumlah</option><option value="1 Pcs">1 Pcs</option><option value="2 Pcs">2 Pcs</option><option value="3 Pcs">3 Pcs</option></select></div></div><div class="form-group"><label for="ket{id}">Keterangan <span class="required-label">*</span></label><input type="text" id="ket{id}" value="Selesai"></div></div>`,
  jadwalulangmaintenance: `<div class="form-header"><h3>Jadwal Ulang Maintenance</h3></div><input type="hidden" id="jenis{id}" value="Jadwal Ulang Maintenance"><label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label><input type="text" id="nama{id}" placeholder="Nama pelanggan"><label for="alasan{id}">Alasan Jadwal Ulang Maintenance <span class="required-label">*</span></label><select id="alasan{id}"><option value="">Pilih Alasan</option><option value="Cuaca Buruk">Cuaca buruk</option><option value="Pelanggan tidak ada di rumah">Pelanggan tidak ada di rumah</option><option value="Pelanggan minta di jawalkan ulang">Pelanggan minta di jawalkan ulang</option><option value="Pelanggan minta di jawalkan ulang besok">Pelanggan minta di jawalkan ulang besok</option><option value="Maintenance malam hari sudah terlalu larut">Maintenance malam hari sudah terlalu larut</option><option value="Lainnya">Lainnya</option></select><label for="keterangan{id}">Keterangan Tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label><textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea><label for="jadwal{id}">Tanggal Request <span class="required-label">*</span></label><input type="date" id="jadwal{id}">`,
  cancelinstalasi: `<div class="form-header"><h3>Cancel Instalasi</h3></div><input type="hidden" id="jenis{id}" value="Cancel"><label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label><input type="text" id="nama{id}" placeholder="Nama pelanggan"><label for="alasan{id}">Alasan cancel pemasangan </label><select id="alasan{id}"><option value="">Pilih Alasan</option><option value="Berubah pikiran (tidak jadi pasang)">Berubah pikiran (tidak jadi pasang)</option><option value="Sudah pasang provider lain">Sudah pasang provider lain</option><option value="Tidak siap bayar">Tidak siap bayar</option><option value="Tidak ada orang di rumah saat teknisi datang">Tidak ada orang di rumah saat teknisi datang</option><option value="Gangguan teknis saat survey (akses rumah susah)">Gangguan teknis saat survey (akses rumah susah)</option><option value="Gangguan teknis saat survey (jarak terlalu jauh)">Gangguan teknis saat survey (jarak terlalu jauh)</option><option value="Kabel tidak memungkinkan untuk ditarik ke rumah pelanggan">Kabel tidak memungkinkan untuk ditarik ke rumah pelanggan</option><option value="Jaringan tidak tersedia di lokasi">Jaringan tidak tersedia di lokasi</option><option value="Lainnya">Lainnya</option></select><label for="keterangan{id}">Keterangan tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label><textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea>`
};

function addForm(type) {
  if (!isDataReady) { alert("Harap tunggu, sedang mensinkronisasi data dari server..."); return; }
  formCount++;
  const div = document.createElement("div"); div.className = "form"; div.id = "form" + formCount;
  let formHTML = formTemplates[type].replace(/{id}/g, formCount);
  formHTML = formHTML.replace(/{oltOptions}/g, generateOltOptions());
  formHTML += `<button class="delete" onclick="deleteForm(${formCount})">Hapus Form</button>`;
  div.innerHTML = formHTML; document.getElementById("forms").appendChild(div);
  div.scrollIntoView({behavior: "smooth"});
}

function deleteForm(id) { if (confirm("Yakin ingin menghapus form ini?")) document.getElementById("form" + id).remove(); }

function updateSN(id) {
  const jenis = document.getElementById("jenis_perangkat" + id).value; const snField = document.getElementById("sn_perangkat" + id);
  if (jenis === "C-DATA XPON ONU") { snField.value = "DF1D-"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else if (jenis === "C-DATA XPON DUAL-BAND ONU") { snField.value = "DF51-"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else if (jenis === "RISECOME" || jenis === "RISECOME (DISMANTLE)") { snField.value = "RCMG"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else if (jenis === "C-DATA XPON ONU (DISMANTLE)") { snField.value = "DF1D-"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else { snField.value = ""; }
}

// 🛡️ FUNGSI GENERATE (DENGAN VALIDASI KOTAK MERAH)
function generate() {
  const forms = document.querySelectorAll(".form");
  if (forms.length === 0) { alert("Tidak ada data untuk dilaporkan! Tambahkan form terlebih dahulu."); return; }

  let isLaporanValid = true;
  let errorMessages = [];

  // Looping untuk Cek Kesalahan Input ODP
  forms.forEach((form) => {
      let i = form.id.replace("form", "");
      let jenis = getValue("jenis"+i);
      let namaPelanggan = getValue("nama"+i) || "Tanpa Nama";

      if (jenis === "Instalasi") {
          let olt = getValue("olt"+i);
          let odpInput = document.getElementById("odp"+i);
          let odpVal = odpInput ? odpInput.value.trim() : "";

          if (olt && odpVal) {
              let availableOdps = odpMasterData[olt] || [];
              let isOdpValid = availableOdps.some(validOdp => validOdp.toLowerCase() === odpVal.toLowerCase());
              
              if (!isOdpValid) {
                  isLaporanValid = false;
                  errorMessages.push(`Form Instalasi (${namaPelanggan}): ODP "${odpVal}" TIDAK DITEMUKAN di OLT "${olt}".`);
                  
                  if (odpInput) {
                      odpInput.style.border = "2px solid #ef4444";
                      odpInput.style.backgroundColor = "#fee2e2";
                      odpInput.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
              } else {
                  if (odpInput) {
                      odpInput.style.border = "1px solid #ccc"; 
                      odpInput.style.backgroundColor = "";
                  }
              }
          } else if (!olt || !odpVal) {
              isLaporanValid = false;
              errorMessages.push(`Form Instalasi (${namaPelanggan}): OLT dan ODP wajib diisi!`);
          }
      }
  });

  // Hentikan jika ada error
  if (!isLaporanValid) {
      alert("⚠️ GAGAL MEMBUAT LAPORAN!\n\n" + errorMessages.join("\n") + "\n\nSilakan periksa kotak input yang berwarna merah.");
      return; 
  }

  // Jika Valid, Susun Teks Asli Anda
  let judul = getValue("reportTitle") || "LAPORAN INSTALASI SUBANG";
  let tanggal = getValue("reportDate") || getDefaultDate();
  let team = getValue("teamName");
  
  let laporan = `${judul}\n${tanggal}\n\n`;
  if (team) { laporan += `Team : ${team}\n\n`; } else { laporan += `\n`; }

  let instalasiData = [], jadwalulanginstalasiData = [], maintenanceData = [], jadwalulangmaintenanceData = [], cancelinstalasiData = [];
  let isFormLengkap = true; 

  forms.forEach((form) => {
    let i = form.id.replace("form", "");
    let jenis = getValue("jenis"+i);
    if (jenis === "Instalasi") instalasiData.push({ id: i });
    else if (jenis === "Jadwal Ulang Instalasi") jadwalulanginstalasiData.push({ id: i });
    else if (jenis === "Maintenance") maintenanceData.push({ id: i });
    else if (jenis === "Jadwal Ulang Maintenance") jadwalulangmaintenanceData.push({ id: i});
    else if (jenis === "Cancel") cancelinstalasiData.push({ id: i });
  });

  let nomorInstalasi = 1, nomorJadwalUlangInstalasi = 1, nomorMaintenance = 1, nomorJadwalUlangMaintenance = 1, nomorCancelInstalasi = 1;

  if (instalasiData.length > 0) {
    let instalasiLaporan = "";
    instalasiData.forEach(data => {
      let i = data.id; let cid = getValue("cid"+i); let nama = getValue("nama"+i);
      if (cid && nama) {
        instalasiLaporan += `${nomorInstalasi}. A/N : ${nama}\nCID : ${cid}\nPassword Member Area : ${getValue("passwordmemberarea"+i)}\nEmail : ${getValue("email"+i)}\nOLT : ${getValue("olt"+i)}\nODP : ${getValue("odp"+i)}\nPort : ${getValue("port"+i)}\nJenis Perangkat : ${getValue("jenis_perangkat"+i)}\nSN Perangkat : ${getValue("sn_perangkat"+i)}\nDropcore : ${getValue("dropcore"+i)}\nPatchcord : ${getValue("patchcord"+i)}\nKeterangan : ${getValue("keterangan"+i) || 'Selesai'}\n\n`;
        nomorInstalasi++;
      }
    });
    if (instalasiLaporan) { laporan += `*INSTALASI*\n\n` + instalasiLaporan; }
  }

  if (jadwalulanginstalasiData.length > 0) {
    let jadwalulanginstalasiLaporan = "";
    for (const data of jadwalulanginstalasiData) {
      let i = data.id; let nama = getValue("nama"+i);
      if (nama) {
        const jadwal = document.getElementById("jadwal"+i)?.value;
        if (!jadwal) { alert(`Tanggal request wajib diisi`); isFormLengkap = false; break; }
        jadwalulanginstalasiLaporan += `${nomorJadwalUlangInstalasi}. A/N: ${nama}\nAlasan : ${getValue("alasan"+i)}\nKeterangan : ${getValue("keterangan"+i)}\nTanggal request: ${formatFullDate(jadwal)}\n\n`;
        nomorJadwalUlangInstalasi++;
      }
    }
    if (!isFormLengkap) return; 
    if (jadwalulanginstalasiLaporan) { laporan += `*RESCHEDULE INSTALASI*\n\n` + jadwalulanginstalasiLaporan; }
  }

  if (maintenanceData.length > 0) {
    let maintenanceLaporan = "";
    maintenanceData.forEach(data => {
      let i = data.id; let cid = getValue("cid"+i); let nama = getValue("nama"+i); let ken = getValue("ken"+i); let tin = getValue("tin"+i);
      if (!(cid || nama || ken || tin)) { return; }

      maintenanceLaporan += `${nomorMaintenance}. A/N : ${nama}\nCID : ${cid}\n`;
      const odp = getValue("odp"+i); if (odp) maintenanceLaporan += `ODP : ${odp}\n`;
      const rodp = getValue("rodp"+i); if (rodp) maintenanceLaporan += `R. ODP : ${rodp}\n`;
      const rcbefore = getValue("rcbefore"+i); if (rcbefore) maintenanceLaporan += `R.C Before : ${rcbefore}\n`;
      const rcafter = getValue("rcafter"+i); if (rcafter) maintenanceLaporan += `R.C After : ${rcafter}\n`;

      maintenanceLaporan += `Kendala : ${ken}\nTindakan : ${tin}\n`;
      const snLama = getValue("snlama"+i); const snBaru = getValue("snbaru"+i); const odplama = getValue("odplama"+i); const odpbaru = getValue("odpbaru"+i);

      if (snLama || snBaru) { maintenanceLaporan += `Ganti Perangkat :\nSN Lama : ${snLama}\nSN Baru : ${snBaru}\n\n`; }
      if (odplama || odpbaru) { maintenanceLaporan += `Pindah ODP :\nODP Lama : ${odplama}\nODP Baru : ${odpbaru}\n\n`; }
      
      const dropcore = getValue("dropcore"+i); if (dropcore) maintenanceLaporan += `Dropcore : ${dropcore}\n`;
      const patchcord = getValue("patchcord"+i); if (patchcord) maintenanceLaporan += `Patchcord : ${patchcord}\n`;
      maintenanceLaporan += `Keterangan : ${getValue("ket"+i) || 'Selesai'}\n\n`;
      nomorMaintenance++;
    });
    if (maintenanceLaporan) { laporan += `*MAINTENANCE*\n\n` + maintenanceLaporan; }
  }

   if (jadwalulangmaintenanceData.length > 0) {
    let jadwalulangmaintenanceLaporan = "";
    for (const data of jadwalulangmaintenanceData) {
      let i = data.id; let nama = getValue("nama"+i);
      if (nama) {
        const jadwal = document.getElementById("jadwal"+i)?.value;
        if (!jadwal) { alert(`Tanggal request wajib diisi`); isFormLengkap = false; break; }
        jadwalulangmaintenanceLaporan += `${nomorJadwalUlangMaintenance} .A/N : ${nama}\nAlasan : ${getValue("alasan"+i)}\nKeterangan : ${getValue("keterangan"+i)}\nTanggal request : ${formatFullDate(jadwal)}\n\n`;
        nomorJadwalUlangMaintenance++;
      }
    }
    if (!isFormLengkap) return; 
    if (jadwalulangmaintenanceLaporan) { laporan += `*RESCHEDULE MAINTENANCE*\n\n` + jadwalulangmaintenanceLaporan; }
  }

   if (cancelinstalasiData.length > 0) {
    let cancelinstalasiLaporan = "";
    for (const data of cancelinstalasiData) {
      let i = data.id; let nama = getValue("nama"+i);
      if (nama) {
         cancelinstalasiLaporan += `${nomorCancelInstalasi}. A/N : ${nama}\nAlasan : ${getValue("alasan"+i)}\nKeterangan : ${getValue("keterangan"+i)}\n\n`;
         nomorCancelInstalasi++;
      }
    }
    if (!isFormLengkap) return; 
    if (cancelinstalasiLaporan) { laporan += `*CANCEL INSTALASI*\n\n` + cancelinstalasiLaporan; }
  }
  document.getElementById("output").innerText = laporan.trim();
}

function sendWA() {
  let text = document.getElementById("output").innerText;
  if (!text) { alert("Buat laporan dulu sebelum kirim ke WhatsApp!"); return; }
  let url = "https://wa.me/?text=" + encodeURIComponent(text);
  window.open(url, "_blank");
}

function resetLaporan() {
  if (confirm("Yakin ingin menghapus semua data?")) {
    document.getElementById("forms").innerHTML = "";
    document.getElementById("output").innerText = "";
    document.getElementById("teamName").value = "";
    document.getElementById("reportTitle").value = "*LAPORAN INSTALASI SUBANG*";
    document.getElementById("reportDate").value = "";
    formCount = 0;
    updateDate();
  }
}