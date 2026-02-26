let formCount = 0;

// ⚠️ GANTI DENGAN URL WEB APP V4 ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbw12NOapHRmUvNqSzs4Oj_OTFkX2SSHTNaufp1pGPYNoKlvnxZ9DfjkLjk0RvrF4vTtOQ/exec";

let odpMasterData = {}; 
let odpUsedPorts = {}; 
let pendingLaporanToSave = []; 
let isDataReady = false;

async function fetchODPData() {
    try {
        const response = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "getData" }) });
        const result = await response.json();
        
        if (result.ok) {
            let rawOdp = result.data.odp;
            let usedPorts = result.data.usedPorts; 
            odpUsedPorts = usedPorts; 

            let mapping = {};
            rawOdp.forEach(row => {
                let namaOdp = row[0], namaOlt = row[2]; 
                let maxPort = parseInt(row[11]) || 16;
                let manualPortTerpakai = parseInt(row[12]) || 0; 
                let dynamicUsedCount = (usedPorts[namaOdp] || []).length; 
                
                if (manualPortTerpakai < maxPort && dynamicUsedCount < maxPort) {
                    if (namaOlt && namaOdp && namaOlt !== "-") {
                        if (!mapping[namaOlt]) mapping[namaOlt] = [];
                        if (!mapping[namaOlt].includes(namaOdp)) mapping[namaOlt].push(namaOdp);
                    }
                }
            });

            odpMasterData = mapping; isDataReady = true; updateDate(); 
            const loaderText = document.getElementById('loaderText');
            if(loaderText) loaderText.innerText = "Sistem Siap!";
            setTimeout(() => { document.getElementById('techLoader').classList.add('hidden'); }, 500);
        } else { alert("Gagal memuat database: " + result.message); }
    } catch (error) { document.getElementById('loaderText').innerText = "Gagal Terhubung!"; document.getElementById('loaderText').style.color = "#ef4444"; }
}

function generateOltOptions() {
    if (!isDataReady) return `<option value="">-- Memuat OLT --</option>`;
    let options = `<option value="">-- Pilih OLT --</option>`;
    Object.keys(odpMasterData).sort().forEach(olt => { options += `<option value="${olt}">${olt}</option>`; });
    return options;
}

document.addEventListener('DOMContentLoaded', () => { updateDate(); fetchODPData(); });

function searchODP(inputElement, resultsId, idForm) {
  if (!isDataReady) return;
  const searchTerm = inputElement.value.toLowerCase(), resultsContainer = document.getElementById(resultsId);
  if (searchTerm.length < 1) { resultsContainer.style.display = 'none'; return; }
  
  let availableODPs = [];
  const oltSelect = document.getElementById(`olt${idForm}`);
  if (oltSelect) {
      if (!oltSelect.value) { resultsContainer.innerHTML = `<div class="search-result-item" style="color:#ef4444;">Pilih OLT Induk dulu!</div>`; resultsContainer.style.display = 'block'; return; }
      availableODPs = odpMasterData[oltSelect.value] || [];
  } else {
      Object.values(odpMasterData).forEach(odpList => { availableODPs = availableODPs.concat(odpList); });
      availableODPs = [...new Set(availableODPs)];
  }
  
  const filteredODP = availableODPs.filter(odp => odp.toLowerCase().includes(searchTerm));
  if (filteredODP.length > 0) {
    resultsContainer.innerHTML = filteredODP.map(odp => `<div class="search-result-item" onclick="selectODP('${inputElement.id}', '${odp}')">${odp}</div>`).join('');
  } else {
    resultsContainer.innerHTML = `<div class="search-result-item" style="color:#94a3b8;">ODP Penuh / Tidak Ditemukan</div>`;
  }
  resultsContainer.style.display = 'block';
}

function selectODP(inputId, odpValue) {
  const inputEl = document.getElementById(inputId);
  inputEl.value = odpValue; inputEl.style.borderColor = "#e2e8f0"; inputEl.style.backgroundColor = "#f8fafc";
  
  let idForm = inputId.replace('odp', ''), portSelect = document.getElementById(`port${idForm}`);
  if (portSelect) {
      let kepakai = odpUsedPorts[odpValue] || [], portHTML = '<option value="">-- Pilih Port --</option>';
      for (let i = 1; i <= 16; i++) { if (!kepakai.includes(i)) portHTML += `<option value="${i}">Port ${i}</option>`; }
      portSelect.innerHTML = portHTML;
  }
  document.getElementById(inputId.replace('odp', 'odpResults').replace('odplama', 'odplamaResults').replace('odpbaru', 'odpbaruResults')).style.display = 'none';
}

document.addEventListener('click', function(e) { if (!e.target.matches('.search-container input')) { document.querySelectorAll('.search-results').forEach(r => r.style.display = 'none'); } });

// --- FITUR BARU: BUKA TUTUP FORM ---
function toggleCollapseForm(id) {
    const body = document.getElementById(`formBody${id}`);
    const btn = document.getElementById(`btnCollapse${id}`);
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
        body.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
}
// -----------------------------------

function toggleSNForm(id) {
    const snForm = document.getElementById(`snForm${id}`), toggleBtn = document.getElementById(`btnToggleSN${id}`);
    if (snForm.style.display === 'none') { snForm.style.display = 'block'; toggleBtn.innerHTML = '<i class="fas fa-times"></i> Batal Ganti'; toggleBtn.style.background = '#fee2e2'; toggleBtn.style.color = '#ef4444';} 
    else { snForm.style.display = 'none'; toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Ganti Perangkat'; toggleBtn.style.background = '#e2e8f0'; toggleBtn.style.color = '#1e293b';}
}

function toggleODPForm(id) {
    const odpForm = document.getElementById(`odpForm${id}`), toggleBtn = document.getElementById(`btnToggleODP${id}`);
    if (odpForm.style.display === 'none') { odpForm.style.display = 'block'; toggleBtn.innerHTML = '<i class="fas fa-times"></i> Batal Pindah'; toggleBtn.style.background = '#fee2e2'; toggleBtn.style.color = '#ef4444'; } 
    else { odpForm.style.display = 'none'; toggleBtn.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Pindah ODP'; toggleBtn.style.background = '#e2e8f0'; toggleBtn.style.color = '#1e293b'; }
}

function updateDate() {
  const now = new Date(), hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dateString = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('currentDate').textContent = dateString;
  if (!document.getElementById('reportDate').value) document.getElementById('reportDate').value = dateString;
}
function getDefaultDate() {
  const now = new Date(), hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
}
function formatFullDate(inputDate) {
    if (!inputDate) return ''; const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'], date = new Date(inputDate + 'T00:00:00'); return `${hari[date.getDay()]}, ${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}
function getValue(id) { const element = document.getElementById(id); return element ? element.value.trim() : ''; }

// UPDATE TEMPLATE HTML BISA DITUTUP-BUKA (COLLAPSE)
const formTemplates = {
  tambahinstalasi: `<div class="card form" id="form{id}">
      <div class="form-header-container">
        <div class="form-header-title" onclick="toggleCollapseForm({id})">🚀 INSTALASI BARU</div>
        <div class="form-header-actions">
          <button class="btn-collapse-form" id="btnCollapse{id}" onclick="toggleCollapseForm({id})"><i class="fas fa-chevron-up"></i></button>
          <button class="btn-delete-form" onclick="deleteForm({id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-body" id="formBody{id}">
        <input type="hidden" id="jenis{id}" value="Instalasi"><div class="input-group"><label>Nama Pelanggan <span class="req">*</span></label><input type="text" id="nama{id}" placeholder="Nama lengkap pelanggan"></div><div class="form-grid"><div class="input-group"><label>CID <span class="req">*</span></label><input type="number" id="cid{id}" placeholder="No CID"></div><div class="input-group"><label>Password <span class="req">*</span></label><input type="number" id="passwordmemberarea{id}" placeholder="Angka member"></div></div><div class="input-group"><label>Email <span class="opt">(Opsional)</span></label><input type="email" id="email{id}" placeholder="Email aktif"></div><div class="input-group"><label>OLT Induk <span class="req">*</span></label><select id="olt{id}" onchange="resetODP('{id}')">{oltOptions}</select></div><div class="form-grid"><div class="input-group search-container"><label>Pilih ODP <span class="req">*</span></label><input type="text" id="odp{id}" placeholder="Ketik cari ODP..." oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpResults{id}"></div></div><div class="input-group"><label>Pilih Port <span class="req">*</span></label><select id="port{id}"><option value="">-- Port --</option></select></div></div><div class="input-group"><label>Jenis Perangkat <span class="req">*</span></label><select id="jenis_perangkat{id}" onchange="updateSN('{id}')"><option value="">-- Pilih --</option><option value="C-DATA XPON ONU">C-DATA XPON ONU</option><option value="C-DATA XPON DUAL-BAND ONU">C-DATA XPON DUAL-BAND ONU</option><option value="RISECOME">RISECOME</option><option value="RISECOME (DISMANTLE)">RISECOME (DISMANTLE)</option><option value="C-DATA XPON ONU (DISMANTLE)">C-DATA XPON ONU (DISMANTLE)</option></select></div><div class="input-group"><label>SN Perangkat <span class="req">*</span></label><input type="text" id="sn_perangkat{id}" placeholder="Serial Number"></div><div class="form-grid"><div class="input-group"><label>Dropcore</label><select id="dropcore{id}"><option value="50 Meter">50 M</option><option value="100 Meter">100 M</option><option value="150 Meter">150 M</option><option value="200 Meter" selected>200 M</option><option value="250 Meter">250 M</option><option value="300 Meter">300 M</option><option value="Kabel Terminate">Kabel Terminate</option></select></div><div class="input-group"><label>Patchcord</label><select id="patchcord{id}"><option value="1 Pcs" selected>1 Pcs</option><option value="2 Pcs">2 Pcs</option></select></div></div><div class="input-group"><label>Keterangan <span class="req">*</span></label><input type="text" id="keterangan{id}" value="Selesai"></div>
      </div>
  </div>`,
  jadwalulanginstalasi: `<div class="card form" id="form{id}">
      <div class="form-header-container">
        <div class="form-header-title" style="color:#ea580c;" onclick="toggleCollapseForm({id})">📅 RESCHEDULE INSTALASI</div>
        <div class="form-header-actions">
          <button class="btn-collapse-form" id="btnCollapse{id}" onclick="toggleCollapseForm({id})"><i class="fas fa-chevron-up"></i></button>
          <button class="btn-delete-form" onclick="deleteForm({id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-body" id="formBody{id}">
        <input type="hidden" id="jenis{id}" value="Jadwal Ulang Instalasi"><div class="input-group"><label>Nama Pelanggan <span class="req">*</span></label><input type="text" id="nama{id}" placeholder="Nama pelanggan"></div><div class="input-group"><label>Alasan <span class="req">*</span></label><select id="alasan{id}"><option value="">-- Pilih Alasan --</option><option value="Pelanggan tidak ada di rumah">Tidak ada di rumah</option><option value="Cuaca buruk">Cuaca buruk</option><option value="Minta jadwal ulang">Minta jadwal ulang</option><option value="Kendala teknis/listrik">Kendala teknis/listrik</option><option value="Lainnya">Lainnya...</option></select></div><div class="input-group"><label>Catatan Tambahan</label><input type="text" id="keterangan{id}" placeholder="Penjelasan detail"></div><div class="input-group"><label>Tanggal Request Baru <span class="req">*</span></label><input type="date" id="jadwal{id}"></div>
      </div>
  </div>`,
  tambahmaintenance: `<div class="card form" id="form{id}">
      <div class="form-header-container">
        <div class="form-header-title" style="color:#9333ea;" onclick="toggleCollapseForm({id})">🔧 MAINTENANCE</div>
        <div class="form-header-actions">
          <button class="btn-collapse-form" id="btnCollapse{id}" onclick="toggleCollapseForm({id})"><i class="fas fa-chevron-up"></i></button>
          <button class="btn-delete-form" onclick="deleteForm({id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-body" id="formBody{id}">
        <input type="hidden" id="jenis{id}" value="Maintenance"><div class="input-group"><label>Nama Pelanggan <span class="req">*</span></label><input type="text" id="nama{id}" placeholder="Nama lengkap"></div><div class="input-group"><label>CID <span class="req">*</span></label><input type="number" id="cid{id}" placeholder="Nomor CID"></div><div class="input-group search-container"><label>Nama ODP <span class="opt">(Opsional)</span></label><input type="text" id="odp{id}" placeholder="Ketik cari ODP..." oninput="searchODP(this, 'odpResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpResults{id}"></div></div><div class="input-group"><label>Redaman ODP</label><input type="text" id="rodp{id}" placeholder="R. ODP"></div><div class="form-grid"><div class="input-group"><label>R. Before</label><input type="text" id="rcbefore{id}" placeholder="Sebelum"></div><div class="input-group"><label>R. After</label><input type="text" id="rcafter{id}" placeholder="Sesudah"></div></div><div class="input-group"><label>Kendala <span class="req">*</span></label><input type="text" id="ken{id}" placeholder="Masalah pelanggan"></div><div class="input-group"><label>Tindakan <span class="req">*</span></label><input type="text" id="tin{id}" placeholder="Solusi yang dilakukan"></div><button type="button" class="toggle-btn" id="btnToggleSN{id}" onclick="toggleSNForm({id})"><i class="fas fa-exchange-alt"></i> Ganti Perangkat</button><div id="snForm{id}" style="display:none;"><div class="form-grid"><div class="input-group"><label>SN Lama</label><input type="text" id="snlama{id}" placeholder="SN rusak"></div><div class="input-group"><label>SN Baru</label><input type="text" id="snbaru{id}" placeholder="SN pengganti"></div></div></div><button type="button" class="toggle-btn" id="btnToggleODP{id}" onclick="toggleODPForm({id})"><i class="fas fa-arrows-alt-h"></i> Pindah ODP</button><div id="odpForm{id}" style="display:none;"><div class="input-group search-container"><label>ODP Lama</label><input type="text" id="odplama{id}" placeholder="Ketik ODP lama" oninput="searchODP(this, 'odplamaResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odplamaResults{id}"></div></div><div class="input-group search-container"><label>ODP Baru</label><input type="text" id="odpbaru{id}" placeholder="Ketik ODP baru" oninput="searchODP(this, 'odpbaruResults{id}', '{id}')" autocomplete="off"><div class="search-results" id="odpbaruResults{id}"></div></div></div><div class="form-grid"><div class="input-group"><label>Dropcore</label><select id="dropcore{id}"><option value="">-- Pilih --</option><option value="50 Meter">50 M</option><option value="100 Meter">100 M</option></select></div><div class="input-group"><label>Patchcord</label><select id="patchcord{id}"><option value="">-- Pilih --</option><option value="1 Pcs">1 Pcs</option><option value="2 Pcs">2 Pcs</option></select></div></div><div class="input-group"><label>Keterangan Status <span class="req">*</span></label><input type="text" id="ket{id}" value="Selesai"></div>
      </div>
  </div>`,
  jadwalulangmaintenance: `<div class="card form" id="form{id}">
      <div class="form-header-container">
        <div class="form-header-title" style="color:#0d9488;" onclick="toggleCollapseForm({id})">🔄 RES. MAINTENANCE</div>
        <div class="form-header-actions">
          <button class="btn-collapse-form" id="btnCollapse{id}" onclick="toggleCollapseForm({id})"><i class="fas fa-chevron-up"></i></button>
          <button class="btn-delete-form" onclick="deleteForm({id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-body" id="formBody{id}">
        <input type="hidden" id="jenis{id}" value="Jadwal Ulang Maintenance"><div class="input-group"><label>Nama Pelanggan <span class="req">*</span></label><input type="text" id="nama{id}" placeholder="Nama"></div><div class="input-group"><label>Alasan <span class="req">*</span></label><select id="alasan{id}"><option value="">-- Pilih --</option><option value="Rumah kosong">Rumah kosong</option><option value="Cuaca buruk">Cuaca buruk</option><option value="Terlalu malam">Terlalu malam</option><option value="Minta jadwal ulang">Minta jadwal ulang</option></select></div><div class="input-group"><label>Catatan</label><input type="text" id="keterangan{id}"></div><div class="input-group"><label>Tanggal Request <span class="req">*</span></label><input type="date" id="jadwal{id}"></div>
      </div>
  </div>`,
  cancelinstalasi: `<div class="card form" id="form{id}">
      <div class="form-header-container">
        <div class="form-header-title" style="color:#e11d48;" onclick="toggleCollapseForm({id})">🚫 CANCEL INSTALASI</div>
        <div class="form-header-actions">
          <button class="btn-collapse-form" id="btnCollapse{id}" onclick="toggleCollapseForm({id})"><i class="fas fa-chevron-up"></i></button>
          <button class="btn-delete-form" onclick="deleteForm({id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="form-body" id="formBody{id}">
        <input type="hidden" id="jenis{id}" value="Cancel"><div class="input-group"><label>Nama Pelanggan <span class="req">*</span></label><input type="text" id="nama{id}" placeholder="Nama"></div><div class="input-group"><label>Alasan Cancel <span class="req">*</span></label><select id="alasan{id}"><option value="">-- Pilih --</option><option value="Batal pasang">Batal pasang</option><option value="Tidak siap biaya">Tidak siap biaya</option><option value="Jaringan penuh">Jaringan penuh / tidak cover</option></select></div><div class="input-group"><label>Catatan Detail</label><input type="text" id="keterangan{id}"></div>
      </div>
  </div>`
};

function addForm(type) {
  if (!isDataReady) { alert("Tunggu sistem sinkronisasi selesai ya..."); return; }
  formCount++;
  const div = document.createElement("div"); 
  div.innerHTML = formTemplates[type].replace(/{id}/g, formCount).replace(/{oltOptions}/g, generateOltOptions());
  document.getElementById("forms").appendChild(div.firstChild); 
  document.getElementById(`form${formCount}`).scrollIntoView({behavior: "smooth", block: "center"});
}

function deleteForm(id) { 
    let el = document.getElementById("form" + id);
    el.style.transform = "scale(0.9)"; el.style.opacity = "0";
    setTimeout(() => { el.remove(); }, 200);
}

function updateSN(id) {
  const jenis = document.getElementById("jenis_perangkat" + id).value; const snField = document.getElementById("sn_perangkat" + id);
  if (jenis === "C-DATA XPON ONU" || jenis === "C-DATA XPON ONU (DISMANTLE)") { snField.value = "DF1D-"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else if (jenis === "C-DATA XPON DUAL-BAND ONU") { snField.value = "DF51-"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else if (jenis === "RISECOME" || jenis === "RISECOME (DISMANTLE)") { snField.value = "RCMG"; snField.focus(); snField.setSelectionRange(snField.value.length, snField.value.length); } 
  else { snField.value = ""; }
}

function generate() {
  const forms = document.querySelectorAll(".form");
  if (forms.length === 0) { alert("Tambahkan minimal 1 pekerjaan dulu!"); return; }

  let isLaporanValid = true; let errorMessages = [];
  pendingLaporanToSave = []; 

  let judul = getValue("reportTitle") || "LAPORAN INSTALASI SUBANG";
  let tanggal = getValue("reportDate") || getDefaultDate();
  let team = getValue("teamName") || "Tanpa Nama Teknisi";
  let laporan = `${judul}\n${tanggal}\nTeam : ${team}\n\n`;
  let instalasiData = [], jadwalulanginstalasiData = [], maintenanceData = [], jadwalulangmaintenanceData = [], cancelinstalasiData = [];
  let isFormLengkap = true; 

  forms.forEach((form) => {
      let i = form.id.replace("form", ""); let jenis = getValue("jenis"+i); let namaPelanggan = getValue("nama"+i) || "Tanpa Nama";
      let cid = getValue("cid"+i) || "-"; let olt = getValue("olt"+i) || "-"; let odp = getValue("odp"+i) || "-"; let port = getValue("port"+i) || "-"; let keterangan = getValue("keterangan"+i) || "Selesai";
      let email = getValue("email"+i) || "-"; let jenis_perangkat = getValue("jenis_perangkat"+i) || "-"; let sn_perangkat = getValue("sn_perangkat"+i) || "-";

      if (jenis === "Instalasi") {
          let odpInput = document.getElementById("odp"+i); let odpVal = odpInput ? odpInput.value.trim() : "";
          if (olt && odpVal) {
              let availableOdps = odpMasterData[olt] || []; let isOdpValid = availableOdps.some(v => v.toLowerCase() === odpVal.toLowerCase());
              if (!isOdpValid) {
                  isLaporanValid = false; errorMessages.push(`Instalasi (${namaPelanggan}): ODP "${odpVal}" SALAH / PENUH.`);
                  if (odpInput) { odpInput.style.borderColor = "#ef4444"; odpInput.style.backgroundColor = "#fee2e2"; odpInput.scrollIntoView({ behavior: "smooth", block: "center" }); }
              } else {
                  if (odpInput) { odpInput.style.borderColor = "#e2e8f0"; odpInput.style.backgroundColor = "#f8fafc"; }
                  let nowStr = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
                  pendingLaporanToSave.push([nowStr, jenis, namaPelanggan, cid, olt, odp, port, team, keterangan, email, jenis_perangkat, sn_perangkat]);
                  instalasiData.push({ id: i });
              }
          } else { isLaporanValid = false; errorMessages.push(`Instalasi (${namaPelanggan}): OLT dan ODP wajib diisi!`); }
      }
      else if (jenis === "Jadwal Ulang Instalasi") jadwalulanginstalasiData.push({ id: i });
      else if (jenis === "Maintenance") {
          let nowStr = new Date().toLocaleString("id-ID", {timeZone: "Asia/Jakarta"});
          pendingLaporanToSave.push([nowStr, jenis, namaPelanggan, cid, olt, odp, port, team, keterangan, email, jenis_perangkat, sn_perangkat]);
          maintenanceData.push({ id: i });
      }
      else if (jenis === "Jadwal Ulang Maintenance") jadwalulangmaintenanceData.push({ id: i});
      else if (jenis === "Cancel") cancelinstalasiData.push({ id: i });
  });

  if (!isLaporanValid) { alert("⚠️ PERIKSA KEMBALI!\n\n" + errorMessages.join("\n")); return; }

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
    let t = "";
    for (const d of jadwalulanginstalasiData) { let i=d.id, n=getValue("nama"+i); if(n){ t+=`${nomorJadwalUlangInstalasi}. A/N: ${n}\nAlasan: ${getValue("alasan"+i)}\nKet: ${getValue("keterangan"+i)}\nTgl Request: ${formatFullDate(getValue("jadwal"+i))}\n\n`; nomorJadwalUlangInstalasi++; } }
    if(t) laporan += `*RESCHEDULE INSTALASI*\n\n` + t;
  }

  if (maintenanceData.length > 0) {
    let t = "";
    for (const d of maintenanceData) { let i=d.id, n=getValue("nama"+i), cid=getValue("cid"+i); if(n && cid){ t+=`${nomorMaintenance}. A/N : ${n}\nCID : ${cid}\n`; let odp=getValue("odp"+i); if(odp)t+=`ODP : ${odp}\n`; let ro=getValue("rodp"+i); if(ro)t+=`R. ODP : ${ro}\n`; let rb=getValue("rcbefore"+i); if(rb)t+=`R.C Before : ${rb}\n`; let ra=getValue("rcafter"+i); if(ra)t+=`R.C After : ${ra}\n`; t+=`Kendala : ${getValue("ken"+i)}\nTindakan : ${getValue("tin"+i)}\n`; let sl=getValue("snlama"+i), sb=getValue("snbaru"+i); if(sl||sb)t+=`Ganti Perangkat:\nSN Lama: ${sl}\nSN Baru: ${sb}\n\n`; let ol=getValue("odplama"+i), ob=getValue("odpbaru"+i); if(ol||ob)t+=`Pindah ODP:\nODP Lama: ${ol}\nODP Baru: ${ob}\n\n`; let dc=getValue("dropcore"+i); if(dc)t+=`Dropcore: ${dc}\n`; let pc=getValue("patchcord"+i); if(pc)t+=`Patchcord: ${pc}\n`; t+=`Keterangan : ${getValue("ket"+i)||'Selesai'}\n\n`; nomorMaintenance++; } }
    if(t) laporan += `*MAINTENANCE*\n\n` + t;
  }

  if (jadwalulangmaintenanceData.length > 0) {
    let t = "";
    for (const d of jadwalulangmaintenanceData) { let i=d.id, n=getValue("nama"+i); if(n){ t+=`${nomorJadwalUlangMaintenance}. A/N: ${n}\nAlasan: ${getValue("alasan"+i)}\nKet: ${getValue("keterangan"+i)}\nTgl Request: ${formatFullDate(getValue("jadwal"+i))}\n\n`; nomorJadwalUlangMaintenance++; } }
    if(t) laporan += `*RESCHEDULE MAINTENANCE*\n\n` + t;
  }

  if (cancelinstalasiData.length > 0) {
    let t = "";
    for (const d of cancelinstalasiData) { let i=d.id, n=getValue("nama"+i); if(n){ t+=`${nomorCancelInstalasi}. A/N: ${n}\nAlasan: ${getValue("alasan"+i)}\nKet: ${getValue("keterangan"+i)}\n\n`; nomorCancelInstalasi++; } }
    if(t) laporan += `*CANCEL INSTALASI*\n\n` + t;
  }

  document.getElementById("output").innerText = laporan.trim();
  document.getElementById("output").scrollIntoView({behavior: "smooth", block: "start"});
}

async function sendWA() {
  let text = document.getElementById("output").innerText;
  if (!text || text.includes("belum dibuat")) { alert("Klik tombol 'Generate' dulu ya!"); return; }

  const loaderText = document.getElementById('loaderText');
  const loader = document.getElementById('techLoader');
  
  if (pendingLaporanToSave.length > 0) {
      loaderText.innerText = "Mengirim ke Database..."; loader.classList.remove('hidden');
      try {
          let res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: "saveLaporan", payload: { laporanData: pendingLaporanToSave } }) }).then(r=>r.json());
          if(!res.ok) { loader.classList.add('hidden'); alert("Gagal menyimpan data: " + res.message); return; }
          pendingLaporanToSave = []; 
      } catch(e) { loader.classList.add('hidden'); alert("Error jaringan."); return; }
  }
  
  loader.classList.add('hidden');
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
}

function resetLaporan() {
  if (confirm("Reset halaman? Semua form akan dihapus.")) {
    document.getElementById("forms").innerHTML = ""; document.getElementById("output").innerText = "Laporan belum dibuat. Silakan isi form dan klik 'Generate Laporan' di bawah.";
    document.getElementById("teamName").value = ""; formCount = 0; updateDate();
  }
}
