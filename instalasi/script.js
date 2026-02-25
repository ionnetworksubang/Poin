let formCount = 0;

// ⚠️ GANTI DENGAN URL WEB APP GOOGLE SCRIPT ANDA! (Pastikan ujungnya ?action=getMapping)
const API_URL = "https://script.google.com/macros/s/AKfycbzy5Y4BNEIoHVICsLEaFxPML1bjdlRpWhqkhnBjtPRCG0J5s2sTGkatpav_1tyA3T17Fw/exec?action=getMapping";

let odpMasterData = {}; 
let isDataReady = false;

// 1. SINKRONISASI DATA DAN MATIKAN LOADING SCREEN
async function fetchODPData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        if (result.ok) {
            odpMasterData = result.data;
            isDataReady = true;
            updateDate(); 

            // Ubah teks & sembunyikan loading screen dengan mulus
            document.getElementById('loaderText').innerText = "Database Siap!";
            setTimeout(() => { document.getElementById('techLoader').classList.add('hidden'); }, 500);

        } else {
            alert("Gagal memuat database ODP: " + result.message);
            document.getElementById('loaderText').innerText = "Gagal Memuat Data";
        }
    } catch (error) {
        console.error("Error API:", error);
        document.getElementById('loaderText').innerText = "Koneksi Terputus!";
        document.getElementById('loaderText').style.color = "#ef4444";
    }
}

// 2. MENGISI DROPDOWN OLT
function generateOltOptions() {
    if (!isDataReady) return `<option value="">-- Sedang Memuat OLT --</option>`;
    let options = `<option value="">-- Pilih OLT --</option>`;
    Object.keys(odpMasterData).sort().forEach(olt => {
        options += `<option value="${olt}">${olt}</option>`;
    });
    return options;
}

// 3. FUNGSI PENCARIAN ODP PINTAR
function searchODP(inputElement, resultsId, idForm) {
  if (!isDataReady) return;
  const searchTerm = inputElement.value.toLowerCase();
  const resultsContainer = document.getElementById(resultsId);
  
  if (searchTerm.length < 1) { resultsContainer.style.display = 'none'; return; }

  let availableODPs = [];
  const oltSelect = document.getElementById(`olt${idForm}`);
  
  if (oltSelect) { // Untuk Form Instalasi (Berdasarkan OLT)
      const selectedOlt = oltSelect.value;
      if (!selectedOlt) {
          resultsContainer.innerHTML = `<div class="search-result-item" style="color:red;">Pilih OLT dulu!</div>`;
          resultsContainer.style.display = 'block'; return;
      }
      availableODPs = odpMasterData[selectedOlt] || [];
  } else { // Untuk Maintenance (Cari di semua OLT)
      Object.values(odpMasterData).forEach(list => availableODPs = availableODPs.concat(list));
      availableODPs = [...new Set(availableODPs)];
  }
  
  const filteredODP = availableODPs.filter(odp => odp.toLowerCase().includes(searchTerm));
  if (filteredODP.length > 0) {
    resultsContainer.innerHTML = filteredODP.map(odp => `<div class="search-result-item" onclick="selectODP('${inputElement.id}', '${odp}')">${odp}</div>`).join('');
  } else {
    resultsContainer.innerHTML = `<div class="search-result-item" style="color:#94a3b8;">Tidak ditemukan</div>`;
  }
  resultsContainer.style.display = 'block';
}

function selectODP(inputId, odpValue) {
  const input = document.getElementById(inputId);
  input.value = odpValue;
  // Reset warna border kalau sebelumnya merah karena salah
  input.style.border = "1px solid #cbd5e1";
  input.style.backgroundColor = "";
  
  document.getElementById(inputId.replace('odp', 'odpResults').replace('odplama', 'odplamaResults').replace('odpbaru', 'odpbaruResults')).style.display = 'none';
}

function resetODP(idForm) {
    const odpInput = document.getElementById(`odp${idForm}`);
    if (odpInput) { odpInput.value = ''; odpInput.style.border = "1px solid #cbd5e1"; odpInput.style.backgroundColor = ""; }
}

document.addEventListener('click', (e) => {
  if (!e.target.matches('.search-container input')) {
    document.querySelectorAll('.search-results').forEach(res => res.style.display = 'none');
  }
});

// 4. TOGGLE PERANGKAT BAWAAN ANDA
function toggleSNForm(id) {
    const snForm = document.getElementById(`snForm${id}`);
    const btn = document.getElementById(`snBtn${id}`);
    if (snForm.style.display === 'none') { snForm.style.display = 'block'; btn.innerHTML = '<i class="fas fa-times"></i> Batal Ganti'; } 
    else { snForm.style.display = 'none'; btn.innerHTML = '<i class="fas fa-exchange-alt"></i> Ganti Perangkat'; }
}

function toggleODPForm(id) {
    const odpForm = document.getElementById(`odpForm${id}`);
    const btn = document.getElementById(`odpBtn${id}`);
    if (odpForm.style.display === 'none') { odpForm.style.display = 'block'; btn.innerHTML = '<i class="fas fa-times"></i> Batal Pindah'; } 
    else { odpForm.style.display = 'none'; btn.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Pindah ODP'; }
}

// 5. TANGGAL OTOMATIS
function updateDate() {
  const n = new Date(); const h = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']; const b = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = `${h[n.getDay()]}, ${n.getDate()} ${b[n.getMonth()]} ${n.getFullYear()}`;
  document.getElementById('currentDate').textContent = d;
  if (!document.getElementById('reportDate').value) document.getElementById('reportDate').value = d;
}
function getDefaultDate() { return document.getElementById('reportDate').value; }
function formatFullDate(input) { if (!input) return ''; const d = new Date(input + 'T00:00:00'); const h = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']; const b = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']; return `${h[d.getDay()]}, ${d.getDate()} ${b[d.getMonth()]} ${d.getFullYear()}`; }
function getValue(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

// 6. TEMPLATE HTML FORM (Dengan Dropdown Dinamis)
const formTemplates = {
  tambahinstalasi: `
    <div class="form-header"><h3>INSTALASI</h3></div>
    <input type="hidden" id="jenis{id}" value="Instalasi">
    
    <label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label>
    <input type="text" id="nama{id}" placeholder="Nama pelanggan">
    
    <div class="form-grid">
        <div><label for="cid{id}">CID <span class="required-label">*</span></label><input type="number" id="cid{id}" placeholder="Nomor CID"></div>
        <div><label for="passwordmemberarea{id}">Password Member <span class="required-label">*</span></label><input type="number" id="passwordmemberarea{id}" placeholder="Angka"></div>
    </div>
    
    <label for="email{id}">Email <span class="optional-label">(tidak wajib)</span></label>
    <input type="email" id="email{id}" placeholder="Email pelanggan">
    
    <label for="olt{id}">OLT Induk <span class="required-label">*</span></label>
    <select id="olt{id}" onchange="resetODP('{id}')">{oltOptions}</select>
    
    <div class="form-grid">
        <div class="search-container">
            <label for="odp{id}">Nama ODP <span class="required-label">*</span></label>
            <input type="text" id="odp{id}" placeholder="Pilih OLT & Cari ODP" oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off">
            <div class="search-results" id="odpResults{id}"></div>
        </div>
        <div><label for="port{id}">Port ODP <span class="required-label">*</span></label>
            <select id="port{id}"><option value="">Pilih Port</option>${Array.from({length: 16}, (_, i) => `<option value="${i + 1}">Port ${i + 1}</option>`).join('')}</select>
        </div>
    </div>
    
    <div class="form-grid">
        <div><label for="jenis_perangkat{id}">Perangkat <span class="required-label">*</span></label>
            <select id="jenis_perangkat{id}" onchange="updateSN('{id}')"><option value="">Pilih...</option><option value="C-DATA XPON ONU">C-DATA XPON ONU</option><option value="C-DATA XPON DUAL-BAND ONU">DUAL-BAND ONU</option><option value="RISECOME">RISECOME</option><option value="RISECOME (DISMANTLE)">RISECOME (DISMANTLE)</option><option value="C-DATA XPON ONU (DISMANTLE)">C-DATA (DISMANTLE)</option></select>
        </div>
        <div><label for="sn_perangkat{id}">Serial Number <span class="required-label">*</span></label><input type="text" id="sn_perangkat{id}" placeholder="SN Perangkat"></div>
    </div>
    
    <div class="form-grid">
        <div><label for="dropcore{id}">Dropcore</label>
            <select id="dropcore{id}"><option value="50 Meter">50 Meter</option><option value="100 Meter">100 Meter</option><option value="150 Meter">150 Meter</option><option value="200 Meter" selected>200 Meter</option><option value="300 Meter">300 Meter</option><option value="Kabel Terminate">Kabel Terminate</option></select>
        </div>
        <div><label for="patchcord{id}">Patchcord</label>
            <select id="patchcord{id}"><option value="1 Pcs" selected>1 Pcs</option><option value="2 Pcs">2 Pcs</option></select>
        </div>
    </div>
    <label for="keterangan{id}">Keterangan Status</label>
    <input type="text" id="keterangan{id}" value="Selesai">
  `,
  jadwalulanginstalasi: `
    <div class="form-header"><h3>Jadwal Ulang Instalasi</h3></div>
    <input type="hidden" id="jenis{id}" value="Jadwal Ulang Instalasi">
    <label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label>
    <input type="text" id="nama{id}" placeholder="Nama pelanggan">
    <label for="alasan{id}">Alasan Reschedule <span class="required-label">*</span></label>
    <select id="alasan{id}">
      <option value="">Pilih Alasan</option>
      <option value="Pelanggan minta di jawalkan ulang">Pelanggan minta di jawalkan ulang</option>
      <option value="Pelanggan minta di jawalkan ulang besok">Pelanggan minta di jadwalkan ulang besok</option>
      <option value="Pelanggan minta di jawalkan ulang minggu depan">Pelanggan minta di jadwalkan ulang minggu depan</option>
      <option value="Pelanggan minta di jawalkan ulang bulan depan">Pelanggan minta di jadwalkan ulang bulan depan</option>
      <option value="Pelanggan tidak ada di rumah">Pelanggan tidak ada di rumah</option>
      <option value="Pelanggan sedang sakit">Pelanggan sedang sakit</option>
      <option value="Pelanggan pindah alamat">Pelanggan pindah alamat</option>
      <option value="Pelanggan tidak bisa dihubungi">Pelanggan tidak bisa dihubungi</option>
      <option value="Pelanggan sedang bepergian">Pelanggan sedang bepergian</option>
      <option value="Instalasi ditunda karena pelanggan belum siap secara biaya">Instalasi ditunda karena pelanggan belum siap secara biaya</option>      
      <option value="Kendala listrik">Kendala listrik</option>
      <option value="Jarak terlalu jauh, menunggu pengembangan ODP">Jarak terlalu jauh, menunggu pengembangan ODP</option>
      <option value="Cuaca buruk">Cuaca buruk</option>
      <option value="Pemasangan malam hari sudah terlalu larut">Pemasangan malam hari sudah terlalu larut</option>
      <option value="Perlu izin RT/RW">Perlu izin RT/RW</option>
      <option value="ODP penuh, menunggu pengembangan ODP">ODP penuh, menunggu pegembagan ODP</option>
      <option value="Pelanggan sedang bekerja atau sibuk,">Pemilik rumah sedang kerja atau sibuk</option>
      <option value="Lainnya">Lainnya</option>
    </select>
    <label for="keterangan{id}">Keterangan Tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label>
    <textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea>
    <label for="jadwal{id}">Tanggal Request <span class="required-label">*</span></label>
    <input type="date" id="jadwal{id}">
  `,
  
  
  tambahmaintenance: `<div class="form-header"><h3>Maintenance</h3></div><input type="hidden" id="jenis{id}" value="Maintenance"><div class="form-grid"><div><label>Nama <span class="required-label">*</span></label><input type="text" id="nama{id}"></div><div><label>CID <span class="required-label">*</span></label><input type="number" id="cid{id}"></div></div><div class="search-container"><label>ODP (Opsional)</label><input type="text" id="odp{id}" oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpResults{id}"></div></div><div class="form-grid"><div><label>Kendala <span class="required-label">*</span></label><input type="text" id="ken{id}"></div><div><label>Tindakan <span class="required-label">*</span></label><input type="text" id="tin{id}"></div></div><div class="form-grid"><div><label>R. Before</label><input type="text" id="rcbefore{id}"></div><div><label>R. After</label><input type="text" id="rcafter{id}"></div></div><button type="button" class="toggle-btn" id="snBtn{id}" onclick="toggleSNForm({id})"><i class="fas fa-exchange-alt"></i> Ganti Perangkat</button><div id="snForm{id}" style="display:none;" class="form-grid mt-2"><div><label>SN Lama</label><input type="text" id="snlama{id}"></div><div><label>SN Baru</label><input type="text" id="snbaru{id}"></div></div><button type="button" class="toggle-btn" id="odpBtn{id}" onclick="toggleODPForm({id})"><i class="fas fa-arrows-alt-h"></i> Pindah ODP</button><div id="odpForm{id}" style="display:none;" class="form-grid mt-2"><div class="search-container"><label>ODP Lama</label><input type="text" id="odplama{id}" oninput="searchODP(this, 'odplamaResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odplamaResults{id}"></div></div><div class="search-container"><label>ODP Baru</label><input type="text" id="odpbaru{id}" oninput="searchODP(this, 'odpbaruResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpbaruResults{id}"></div></div></div><label>Keterangan</label><input type="text" id="ket{id}" value="Selesai">`,
  
  
  jadwalulangmaintenance: `
    <div class="form-header"><h3>Jadwal Ulang Maintenance</h3></div>
    <input type="hidden" id="jenis{id}" value="Jadwal Ulang Maintenance">
    <label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label>
    <input type="text" id="nama{id}" placeholder="Nama pelanggan">
    <label for="alasan{id}">Alasan Jadwal Ulang Maintenance <span class="required-label">*</span></label>
    <select id="alasan{id}">
      <option value="">Pilih Alasan</option>
      <option value="Cuaca Buruk">Cuaca buruk</option>
      <option value="Pelanggan tidak ada di rumah">Pelanggan tidak ada di rumah</option>
      <option value="Pelanggan minta di jawalkan ulang">Pelanggan minta di jawalkan ulang</option>
      <option value="Pelanggan minta di jawalkan ulang besok">Pelanggan minta di jawalkan ulang besok</option>
      <option value="Maintenance malam hari sudah terlalu larut">Maintenance malam hari sudah terlalu larut</option>
      <option value="Lainnya">Lainnya</option>
    </select>
    <label for="keterangan{id}">Keterangan Tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label>
    <textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea>
    <label for="jadwal{id}">Tanggal Request <span class="required-label">*</span></label>
    <input type="date" id="jadwal{id}">
  `,
  
  
  
  cancelinstalasi: `
    <div class="form-header"><h3>Cancel Instalasi</h3></div>
    <input type="hidden" id="jenis{id}" value="Cancel">
    <label for="nama{id}">Nama Pelanggan <span class="required-label">*</span></label>
    <input type="text" id="nama{id}" placeholder="Nama pelanggan">
    <label for="alasan{id}">Alasan cancel pemasangan </label>
    <select id="alasan{id}">
      <option value="">Pilih Alasan</option>
      <option value="Berubah pikiran (tidak jadi pasang)">Berubah pikiran (tidak jadi pasang)</option>
      <option value="Sudah pasang provider lain">Sudah pasang provider lain</option>
      <option value="Tidak siap bayar">Tidak siap bayar</option>
      <option value="Tidak ada orang di rumah saat teknisi datang">Tidak ada orang di rumah saat teknisi datang</option>
      <option value="Gangguan teknis saat survey (akses rumah susah)">Gangguan teknis saat survey (akses rumah susah)</option>
      <option value="Gangguan teknis saat survey (jarak terlalu jauh)">Gangguan teknis saat survey (jarak terlalu jauh)</option>
      <option value="Kabel tidak memungkinkan untuk ditarik ke rumah pelanggan">Kabel tidak memungkinkan untuk ditarik ke rumah pelanggan</option>
      <option value="Jaringan tidak tersedia di lokasi">Jaringan tidak tersedia di lokasi</option>
      <option value="Lainnya">Lainnya</option>
    </select>
    <label for="keterangan{id}">Keterangan tambahan <span class="optional-label"><i class="fas fa-info-circle"></i> tidak wajib</label>
    <textarea id="keterangan{id}" placeholder="Penjelasan detail" rows="2"></textarea>
  `
};

function addForm(type) {
  if (!isDataReady) { alert("Sabar bang, lagi sinkron database OLT nih..."); return; }
  formCount++;
  const div = document.createElement("div"); div.className = "form"; div.id = "form" + formCount;
  let formHTML = formTemplates[type].replace(/{id}/g, formCount);
  formHTML = formHTML.replace(/{oltOptions}/g, generateOltOptions());
  formHTML += `<button class="delete" onclick="deleteForm(${formCount})"><i class="fas fa-trash"></i> Hapus Bagian Ini</button>`;
  div.innerHTML = formHTML; document.getElementById("forms").appendChild(div);
  div.scrollIntoView({behavior: "smooth"});
}

function deleteForm(id) { if (confirm("Hapus form ini?")) document.getElementById("form" + id).remove(); }

function updateSN(id) {
  const j = document.getElementById("jenis_perangkat" + id).value; const s = document.getElementById("sn_perangkat" + id);
  if (j.includes("C-DATA XPON ONU")) s.value = "DF1D-";
  else if (j.includes("DUAL-BAND")) s.value = "DF51-";
  else if (j.includes("RISECOME")) s.value = "RCMG";
  else s.value = "";
  if(s.value) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
}

// 7. GENERATE LAPORAN & VALIDASI MERAH KETAT
function generate() {
  const forms = document.querySelectorAll(".form");
  if (forms.length === 0) { alert("Tambahkan form dulu bang!"); return; }

  let isLaporanValid = true;
  let errorMessages = [];

  forms.forEach((form) => {
      let i = form.id.replace("form", "");
      let jenis = getValue("jenis"+i);
      let namaPel = getValue("nama"+i) || "Tanpa Nama";

      if (jenis === "Instalasi") {
          let olt = getValue("olt"+i);
          let odpInput = document.getElementById("odp"+i);
          let odpVal = odpInput ? odpInput.value.trim() : "";

          if (olt && odpVal) {
              let availableOdps = odpMasterData[olt] || [];
              let isOdpValid = availableOdps.some(v => v.toLowerCase() === odpVal.toLowerCase());
              
              if (!isOdpValid) {
                  isLaporanValid = false;
                  errorMessages.push(`Form Instalasi [${namaPel}]: ODP "${odpVal}" TIDAK DITEMUKAN di OLT "${olt}"!`);
                  if (odpInput) { odpInput.style.border = "2px solid #ef4444"; odpInput.style.backgroundColor = "#fee2e2"; odpInput.scrollIntoView({ behavior: "smooth", block: "center" }); }
              } else {
                  if (odpInput) { odpInput.style.border = "1px solid #cbd5e1"; odpInput.style.backgroundColor = "#ffffff"; }
              }
          } else if (!olt || !odpVal) {
              isLaporanValid = false;
              errorMessages.push(`Form Instalasi [${namaPel}]: OLT dan ODP wajib diisi!`);
          }
      }
  });

  if (!isLaporanValid) {
      alert("⚠️ DATA TIDAK VALID!\n\n" + errorMessages.join("\n") + "\n\nPerbaiki kotak input yang berwarna merah.");
      return; 
  }

  let judul = getValue("reportTitle") || "LAPORAN INSTALASI SUBANG";
  let tanggal = getValue("reportDate") || getDefaultDate();
  let team = getValue("teamName");
  let laporan = `${judul}\n${tanggal}\n\n`;
  if (team) laporan += `Team : ${team}\n\n`;

  let iData = [], juiData = [], mData = [], jumData = [], cData = [];
  forms.forEach((form) => {
    let i = form.id.replace("form", ""); let j = getValue("jenis"+i);
    if (j === "Instalasi") iData.push(i); else if (j === "Jadwal Ulang Instalasi") juiData.push(i); else if (j === "Maintenance") mData.push(i); else if (j === "Jadwal Ulang Maintenance") jumData.push(i); else if (j === "Cancel") cData.push(i);
  });

  let ni = 1, njui = 1, nm = 1, njum = 1, nc = 1;

  if (iData.length > 0) {
    let t = "";
    iData.forEach(i => {
      let cid = getValue("cid"+i); let nama = getValue("nama"+i);
      if (cid && nama) {
        t += `${ni}. A/N : ${nama}\nCID : ${cid}\nPassword Member : ${getValue("passwordmemberarea"+i)}\nOLT : ${getValue("olt"+i)}\nODP : ${getValue("odp"+i)}\nPort : ${getValue("port"+i)}\nPerangkat : ${getValue("jenis_perangkat"+i)}\nSN : ${getValue("sn_perangkat"+i)}\nDropcore : ${getValue("dropcore"+i)}\nPatchcord : ${getValue("patchcord"+i)}\nKeterangan : ${getValue("keterangan"+i) || 'Selesai'}\n\n`; ni++;
      }
    });
    if (t) laporan += `*INSTALASI*\n\n` + t;
  }

  if (juiData.length > 0) {
    let t = "";
    juiData.forEach(i => {
      let nama = getValue("nama"+i); let jadwal = getValue("jadwal"+i);
      if (nama) { t += `${njui}. A/N: ${nama}\nAlasan : ${getValue("alasan"+i)}\nKet : ${getValue("keterangan"+i)}\nTanggal: ${formatFullDate(jadwal)}\n\n`; njui++; }
    });
    if (t) laporan += `*RESCHEDULE INSTALASI*\n\n` + t;
  }

  if (mData.length > 0) {
    let t = "";
    mData.forEach(i => {
      let nama = getValue("nama"+i); let cid = getValue("cid"+i);
      if (nama && cid) {
        t += `${nm}. A/N : ${nama}\nCID : ${cid}\nKendala : ${getValue("ken"+i)}\nTindakan : ${getValue("tin"+i)}\n`;
        let odp = getValue("odp"+i); if(odp) t += `ODP : ${odp}\n`;
        let snL = getValue("snlama"+i); let snB = getValue("snbaru"+i);
        if(snL || snB) t += `Ganti Perangkat:\nSN Lama: ${snL}\nSN Baru: ${snB}\n`;
        let oL = getValue("odplama"+i); let oB = getValue("odpbaru"+i);
        if(oL || oB) t += `Pindah ODP:\nODP Lama: ${oL}\nODP Baru: ${oB}\n`;
        t += `Keterangan : ${getValue("ket"+i) || 'Selesai'}\n\n`; nm++;
      }
    });
    if (t) laporan += `*MAINTENANCE*\n\n` + t;
  }

  if (jumData.length > 0) {
    let t = "";
    jumData.forEach(i => {
      let nama = getValue("nama"+i); let jadwal = getValue("jadwal"+i);
      if (nama) { t += `${njum}. A/N : ${nama}\nAlasan : ${getValue("alasan"+i)}\nTanggal : ${formatFullDate(jadwal)}\n\n`; njum++; }
    });
    if (t) laporan += `*RESCHEDULE MAINTENANCE*\n\n` + t;
  }

  if (cData.length > 0) {
    let t = "";
    cData.forEach(i => {
      let nama = getValue("nama"+i);
      if (nama) { t += `${nc}. A/N : ${nama}\nAlasan : ${getValue("alasan"+i)}\nKet : ${getValue("keterangan"+i)}\n\n`; nc++; }
    });
    if (t) laporan += `*CANCEL INSTALASI*\n\n` + t;
  }
  
  document.getElementById("output").innerText = laporan.trim();
}

function sendWA() {
  let text = document.getElementById("output").innerText;
  if (!text || text.includes("Belum ada data")) { alert("Buat laporan dulu bang!"); return; }
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
}

function resetLaporan() {
  if (confirm("Hapus semua data di form?")) {
    document.getElementById("forms").innerHTML = "";
    document.getElementById("output").innerText = "Belum ada data laporan yang dibuat.";
    document.getElementById("teamName").value = "";
    formCount = 0; updateDate();
  }
}

document.addEventListener('DOMContentLoaded', () => { updateDate(); fetchODPData(); });
