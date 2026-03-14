let formCount = 0;

// Data ODP yang sudah dirapikan
const odpData = [
    "SUKALAKSANA 3","RAFA 3","GG SUKUN DEUI","CISAGA 8","CISAGA 7","CISAGA 6","SISI PRAMUKA",
  "BATANG SUKAMELANG","GG TARUNA 2","CISAGA 13","CISAGA 12","CISAGA 11","CISAGA 10","CISAGA 9",
  "CISAGA 5","CISAGA 4","CISAGA 3","CISAGA 2","CISAGA 1","BONGAS 18","BONGAS 17","BONGAS 16",
  "RANCA 6","RANCA 5","RANCA 4","RANCA 3","RANCA 2","RANCA 1","PASE 10","PASE 9","PASE 8",
  "PASE 7","PASE 6","PASE 5","PASE 4","PASE 3","PASE 2","PASE 1","BONGAS 15","BONGAS 14",
  "BONGAS 13","BONGAS 5","BONGAS 4","BONGAS 3","RANCA 8","RANCA 7","RANCA 16","BONGAS 12",
  "BONGAS 10","BONGAS 11","BONGAS 9","BONGAS 8","AKI LATIF","KAMARUNG 17","KAMARUNG 10",
  "KAMARUNG 9","KAMARUNG 8","KAMARUNG 7","GARAGE","SUSUKAN 4","SUSUKAN 3","SUSUKAN 2",
  "SUSUKAN 1","ZILAL","APANA","BAKTI ASIH","SAVANA","TK AL AMIN","BASUN","MESJID BAITULHADI",
  "QREI","SITU IJAN","SURA","MARGANA","GALURA","KAMARUNG 6","KAMARUNG 5","KAMARUNG 4",
  "KAMARUNG 3","KAMARUNG 2","KAMARUNG 1","MEE","MDKK","BALEBAT","BANGO","RANCABOGO",
  "MUSALA","HJM","SHANKARA","DENJAKA","TK SUKARA","KARYA DUCK","JATI 2","JATI",
  "LANGKAP","CIPACAR","SARADAN","PEKERTI","KAMARUNG 11","KAMARUNG 12","KAMARUNG 13",
  "KAMARUNG 14","KAMARUNG 15","KAMARUNG 16","REMA","BTN GEMBOR 4","BTN GEMBOR 3",
  "BTN GEMBOR 2","BTN GEMBOR 1","CISAMPIH","CISAMPIH 8","CISAMPIH 7","CISAMPIH 6",
  "CISAMPIH 9","BARGEDOS","GG UYUH 3","KELAPA RESIDANCE 2","DANGIANG",
  "PERUM PONDOK GEDE","WADEDE","MARSINU","CISAMPIH 5","CISAMPIH 4","CISAMPIH 3",
  "CISAMPIH 2","CISAMPIH 1","TUGU MARJAN","BAROKAH","PONDOK PESANTREN NURUL HUDA",
  "JL. MARJAN 2","JL. MARJAN 1","CIBODAS 2","CIBODAS 1","BUMI GEMILANG","KURKUR",
  "PERTIGAAN DAWUAN","JOYA","SD DAWUAN","RECIH","ROSEANNE","RA KHOERUNNISA","CITRA",
  "IPUL","KINANTI","BEMO","KUMENDUNG","MINUL","DAWUAN ONCOM","ASSALAM","RAJAB",
  "KOMORO","88","KITKYC","SAGAYA","PAKUAN","AGRO","MESJID AL JIHAD","LEBAK SIUH",
  "LURAH SUHIM","PERIANGAN","MESJID PAJAKARAN","MESJID AL MUKAROMAH","PELANGI 1",
  "AGRITAMA","HSH","KIA","DPI","GOONG","JAJA","PERUM PESONA ALAM DAWUAN 3",
  "PERUM PESONA ALAM DAWUAN 2","PERUM PESONA ALAM DAWUAN 1","TAEKWANG 2","RAFA 2",
  "GG. TAWES","KANTOR DESA SUKAMELANG 2","RIDERS","KIMIN","KANTOR DESA SUKAMELANG",
  "BTN CIERENG 2","KAPIRARAY 3","LAMOKOTS","ALUN-ALUN 2","EFAB","BUBUN","SUGE","TULA",
  "GG CENDERAWASIH","GG.SUKAGALIH 3","GG.SUKAGALIH 2","GG. KALAPA","SILIWANGI",
  "PANGLEJAR 4","PANGLEJAR 3","IDI CAHDI 2","STIE","TJOKRO 2","SISICAI 6","BSR 9",
  "DEPAN PPH","GRIYA PUTRA RESIDENCE","BSR 8","MAHKOTA 5","MAHKOTA 4","AREUY",
  "ETNIK","FAVE","SMPN 6","HERJHON","BOYLER","GG. MAWAR 2","GG. RAMBUTAN",
  "BABAKAN SUBANG","TANGKIL","LOBAK","PDI","KARANG KENDAL 2","BAP 5","BAP 4",
  "PANGLEJAR 6","PEJUANG","NUSA INDAH","BAP 6","JL AYAN","GG. TENGAH","ODP MAKHOTA 6",
  "BCD","MAHKOTA 3","GG SERAM","DEDERUK","CISUGIH 3","CISUGIH 2","SELEDRI",
  "JL.DUKUH RAYA 2","NANAS","MAN 1","SUKALAKSANA 2","NGEBUL","AL MADANI","SYARIAH",
  "ODP PERDANA 2","WATERBOOM","EPUL DEUI","RIMBUN","CONTER 2","DUSUN BABAKAN 3",
  "BAPANG 5","LAPANG SIDODADI","RANGGADIPA","SMJ","DODO","BAS","DT AQIQAH","OMLI",
  "LAPANG CIBAROLA","OKE 2","VOLLY 2","ARAB","ANGGUR XIV","PERDANA","JAKSA 3",
  "BABAKAN SUBANG 2","FLAMBOYAN 2","BLOK SAYUR 3","OFFICE SALES","GG MERAK 3","PUSAKA",
  "GG LASMANA","CENDRAWASIH 3","PHILIPS 2","GG. BUNGUR 2","PANGLEJAR 5","GG ASEM",
  "GG LIKA","SHOLEH","PALABUAN 2","YOSUDARSO","ABU","MAHKOTA 2",
  "POS 2","KOPRI","LETNAN UKI 4","TIKUKUR","MANSU 2","ABIMANYU","	BIMA SAKTI 3",
  "SRIKANDI 2","BTN CIERENG","NERAKO","KAPIRARAY 2","BOMBER","BLOK SAYUR 4","GG TONGKENG 2",
  "GG PISANG","KANJENG MAMIH","RASIDI 2","SAKINA","PESONA REGENCY","NCEP","GG SUNDARSO 5",
  "PAPUA","SISI CAI 3","SUNDARSO 4","GALATAMA 2","GG. ANGGUR 3","PASAR PUJASERA","AN NAJAH",
  "LEMBAH CIMERTA","TOWER","KARTINI 9","DEPAN GREEN SUBANG","DAWEY","NYIMPLUNG","JUSSY 3",
  "COSMOS","KARTINI 8","NENE UUR","CISUGIH","MEYER 2",
  "MAYKHA","GG. HUNI","GG BUNGBULANG 3","ODP BLOK D 2","GG HANJUANG","GG TAWES 2","BLOK E",
  "GG. BUAH 2","JL RA KARTINI 10","SKOTIS","FORTUN","BABAKAN UBAN 2","BABY JN",
  "NEPTUNE","FINPROS","TCC","SIKEMBAR","AMBU","BEIJING",
  "EDAN","BABAKAN CURUG","JL. RAYA TANJUNG WANGI","RENGKOLAN","FIRDAUS",
  "BANG TOYIB","LANDEUH","JL. GIMCHEON","PALASARI KIDUL","PALASARI","CIHERANG 6",
  "CIHERANG 5","CIHERANG 4","CIHERANG 3","SDN GUNUNG TUA","CIHERANG 2", "CIHERANG 1",
  "PUNIK","PIGO","SD GUNUNGSARI","SMP GUNUNG TUA","BABAKAN PUTU","ANUWANI",
  "PAMARIS 3","PAMARIS 2","PAMARIS 1","PITU","CIBAREGBEG 2",
  "CIBAREGBEG 1","NUSANTARA","KUJANG","BABAKAN BAROKAH","DUSUN PANGKALAN 4",
  "DUSUN PANGKALAN 3","DUSUN PANGKALAN 2","DUSUN PANGKALAN 1","SADANG 3","SADANG 2",
  "SADANG 1", "UWA TERE","PONPES PAGELARAN","KARYA","GUNA UTAMA 2","GUNA UTAMA 1",
  "NYINSO","CSN","UP","ATEP","	PARUNG 3","	PARUNG 2","	PARUNG",
  "OKTA","UJUNG PARUNG","AL MUBAROKAH","YOBA","SD PARUNG","SLAY",
  "DAMPIT","QOHAR","CIRANGKONG 1","HOLILUDIN","GONDRONG", "LAUK",
  "SINDANGPALAY","TK PELITA","ODP UP 2","GEWOR","FLASHER 2","AL HUDA 2",
  "INCUBETMEN 2","CARINGIN 2","CIHERANG 7","KHAYAL","ODP SORABI",
  "ODP PARUNG 4","KAMAJAYA","ABAH","ALLULA","SCORPIO","CISUSUH",
  "CIHERANG 12","	BALONG" ,"CIHERANG 11","CIHERANG 10","PONPES AL FAUZAN", "YANUSA",
  "IBTIDAIYAH","BAJAK","CIBAREGBEG 3","SPBU TAMBAK DAHAN","JL RAYA SIMPANG",
  "CITRA","CIHERANG 9","CIHERANG 8","BLOK SAYUR 2","BLOK SAYUR 1",
  "JL.SEROJA 1","JL.SEROJA 2","JL.SEROJA 3","JL.APEL RAYA 2","JL.APEL RAYA 1",
  "GG.KARANG KENDAL 1","PLAMBOYAN","GG. PISANG","JL.APEL RAYA 3","JL.JAKSA 2",
  "JL.SAWO 1","JL.DUKUH RAYA 1","JL.JAKSA 1","OTISTA","TUGU KOTA","GG TJ 1",
  "MASJID NURUL HALIM 1","TARAKAN 1","BUMIAWI 1","SAGARA 1","JL.ASMARANDANA 1","LTK 1",
  "JL.EMO 1","CIHEULEUT INDAH 1","JL.DIPONEGORO 1","	IDI CAHDI 1","GG.BUNGUR 1",
  "GG.TONGKENG 1","GG.PALABUAN 1","JL.PANGLEJAR 1","TANJUNG SIANG 1","UKONG SUTAMADJA 1",
  "PANGLEJAR 2","GG.SEJATI 1","GG.SUKAGALIH 1","JL.PEJUANG 2","MAYJEND SUTOYO 1",
  "JL.PEJUANG 1","PHILIPS 1","GG SUKUN 1","MASJID NURUL HALIM 3","GG SUNDARSO 2",
  "GG SUNDARSO 1","GG. ANGGUR 1","GG MERAK 1","TJOKRO 1","GG BUNGBULANG 1","GANESHA 1",
  "TKIT 1","KANCIL 2","KANCIL 1","JUSSY 1","GG.BAPANG 1","JL.BASKET 1","PERMATA HIJAU 2",
  "PERMATA HIJAU 1","BABAKAN UBAN","BLOK C","TAEKWANG","BLOK D","ABDUL GANI 1","GG.BUAH 1",
  "JL.RADEN AJENG KARTINI 5	","JL.RADEN AJENG KARTINI 4","JL.RADEN AJENG KARTINI 3",
  "JL.RADEN AJENG KARTINI 2","JL.RADEN AJENG KARTINI 1","	KIARA 3","GG.KIARA 2","GG.KIARA 1",
  "POS 1","SAWAH 1","MASJID NURUL HALIM 2","KINTAN 2","BENTENG 1","CIBAROLA 1",
  "KINTAN 1","LETNAN UKI 1","RA KARTINI 6","BAPANG 3","DUSUN BABAKAN 1","KP CONTO 1",
  "BAPANG 2","UNSUB 1","BWI 1","LETNAN UKI 2","KINTAN 3","JL METEOR 1",
  "KASERBA 1","PASIR KAREUMBI 1","JL. BILYAR 1","JL. VOLLY 1","JL. GOLF 1","DISDUKCAPIL",
  "MYGO","SMAN 4 SUBANG","BUMI ABDI PRAJA 3","BUMI ABDI PRAJA 1","BUMI ABDI PRAJA 2",
  "GG. ANGGUR 2","LTK2","GG KARTANINGSIH","CIKAWALI 2","CIKAWALI","MANSU","CIKALAPA",
  "SISI CAI","BSR 5","BSR 3","BSR 4","BSR 2","BSR 1","KARTINI 7",
  "BAROKAH","MEYER","ALUN ALUN","BULANSARI","PURNAMA","MALABAR",
  "GALATAMA","TUJI","KINTAN 5","JAPATI","GG CIUNG","GREEN SUBANG 1",
  "MAHKOTA 1","CONTER","KINTAN 4","BANGBANG KACA","JL. SOMPI","GG. BIDARA","GG PANGRANGO",
  "DARMAKUSUMAH","CANGAK","TANGKUBAN PERAHU","GG. ANGGREK","JL. RAYA SUKAMELANG 2",
  "JL. RAYA SUKAMELANG","GG. SALUYU 2","GG. MAWAR","GG. SALUYU","JL.PEJUANG 3","GG CEREME",
  "JAMBU SBG","RANGGAWULUNG","ANGGUR RAYA","TERMINAL 2","TERMINAL 1","ASAHI",
  "SUKALAKSANA","SUKAMAJU","JAYASENA","GG. CUAN","AL MU'MIN","JL. PANJI",
  "NOTO","SRIKANDI","SUKAWARNA","JETU","GG RASIDI 1","JUSSY 2",
  "DANGDEUR","GG UYUH 2","KELAPA RESIDENCE","GG UYUH","SADEWA","BIMA SAKTI 1","BIMA SAKTI 2",
  "GPS","GELORA","YONKO","QYANDA",
  "KENANGA","OKE","PANGKALAN","DUSUN BABAKAN 2","LETNAN UKI 3",
  "DELTA","BUMI KARTINI 2","BUMI KARTINI","PERMATA HIJAU 3","CIERENG","HENING",
  "DAWUAN","SITU SAEUR","BATANG KAPEH","GG. TARUNA","JL. PRAMUKA 3","JL. PRAMUKA 2",
  "JL. PRAMUKA 1","FLASHER","CARINGIN","AMANAH 2","AL HUDA","WARUNG KADU","GG. INCUBETMEN",
  "AMANAH","GG SUNDARSO 3","GG MERAK 2","SAGARA 2",
  "SISI CAI 2","LASKAR INDONESIA","DJUNG","BAPANG 4","KANCIL 3",
  "KINTAN 6","SAWARGI","ODP GG FILTER","ODP HIJAU","PONDOK INDAH","PALUGADA",
  "LANGENSARI","POLITEKNIK","KAPIRARAY","PARIKESIT","AS SALAM","RAFA",
  "KANAYA","SITRUN","GG. MELATI","CENDERAWASIH 2","KOISIWA","GG SUKUN 2","ATTAARUF",
  "PERUMNAS","GG. KITRI","TERANG","GG LEWO",
  "SUKARAHAYU","POLARIS","JERUK","KAFFA","GG BUNGBULANG 2",
  "BELITUNG","LAPANG SAMPEU","ALFOUR","ATREA","AKIMORA","JACE",
  "KIARA 5","GREEN SUBANG 2","GG.KIARA 4","KHAER","BAPE","PAHER",
  "BSR 7","BSR 6","KABOA","BANG KOMAR","PANGHEGAR","PAGADEN 1","PAGADEN 2",
  "PAGADEN 3","PAGADEN 4","PEJUANG DALAM","POS 3","EPUL",
  "REDOORZ","KENANGA 2","TAMBAKDAHAN 1","TAMBAKDAHAN 2","TAMBAKDAHAN 3",
  "TAMBAKDAHAN 4","TAMBAKDAHAN 5","TAMBAKDAHAN 6","TAMBAKDAHAN 7",
];

const dsData = [

    "FARID CAESAR AMANULLOH", "DENI WAHYUDIN", "LILI WARNALI", "MUHAMMAD JAKA NUGRAHA", 
    "AHMAD BUCHORI", "UCI SANUSI", "GEOVANI DWIKI SUPARLI", "APRLIA SANEZ",
    "RAYS SATRIA PERMADI", "GILANG BAHTIAR", "SHANIA VEGA DESTENY", "YAZID FAUZURROHMAN",
    "MOCHAMAD ALEK LESMANA", "ROMI KANTOMI", "KIKI ARISANDI", 
    "JENAR NURJANI", "IRFAN SUPIAN", 
    "ASEP RAHMAT", "ARI SURATMAN", "RAHMAT HIDAYAT", "TAUFIK RUSDIANA", 
    "CHANDIKA KUSUMA", "ARDEN ZUHDI", "DWI HARI PURNAMA", "MOCH RIZKY RAMADHAN", 
    "GANI MAULAMA", "NAZAR YAHYA", "SOLEH SUANDA", "FIRLI APRILIA KULSUM", 
    "RONI CAHYANI", "MIFTAHUDDIN ALI", "DEFAN KAHFI ADHIGUNA", "BAGAS PERMANA",  
    "NAUFAL AZHAR GUSTIANA TS SUBANG", "ILHAM RAMADHANI","DESTI ROSMALA", "MOCH NUR, SH"
    ,"ARIEF SETIAWAN","R AMBAR SUSANTO","DESTI ROSMALA",
];

const namaData = [
    "NAUFAL AZHAR AGUSTIANA", "ANGGITO ABIMANYU", "ALBDUL LATIF", "ABDUL HAPID", 
    "RICKY ZAKARIA", "HANDIKA RAMADHANI", "MUHAMMAD SYAIFUL NUR RABANI", "TAUFIK",
    "SYAHID YUSUF TALAAT", "HENDRIK PERMANA SOPYAN", "ALVIN ALVINA",
    "GUGUN GUNAEDI", "HENDRYANA SISWANTO", "MUHAMMAD RAMDAN", "RIDHO SEPRIAN",
    "MUHAMMAD ADSA RABANI", "MUHAMAN RIDHO", "FIRMAN TEGAR", "HARYS HAQIM","ADRIAN MAULANA",
    "GELAR RAHIM", "DONI ARIA PURNAMA", "KOMARUDIN", "RAFLY", "REYFAL", 

]
    

// Fungsi untuk update tanggal
function updateDate() {
    const now = new Date();
    const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const hariStr = hari[now.getDay()];
    const tanggal = now.getDate();
    const bulanStr = bulan[now.getMonth()];
    const tahun = now.getFullYear();
    
    const dateString = `${hariStr}, ${tanggal} ${bulanStr} ${tahun}`;
    document.getElementById('currentDate').textContent = dateString;
    
    // Set nilai default untuk tanggal laporan jika kosong
    if (!document.getElementById('reportDate').value) {
        document.getElementById('reportDate').value = dateString;
    }
}

// Template form terminate saja
const terminateTemplate = `
    <div class="form-header">
        <h3>TERMINATE</h3>
    </div>
    
    <label for="nama{id}">Nama</label>
    <input type="text" id="nama{id}" placeholder="Nama pelanggan">
    
    <label for="cid{id}">CID</label>
    <input type="number" id="cid{id}" inputmode="numeric" placeholder="Nomor CID">
    
       
        <div class="search-container">
            <label for="odp{id}">ODP</label>
            <input type="text" id="odp{id}" placeholder="Ketik untuk mencari ODP (opsional)" 
            oninput="searchData(this, 'odpResults{id}', odpData)">
            <div class="search-results" id="odpResults{id}"></div>
    </div>
    

    <label for="port{id}">Port</label>
    <select id="port{id}">
        <option value="">-- Pilih Port (opsional) --</option>
        ${Array.from({length: 16}, (_, i) => `<option value="${i + 1}">Port ${i + 1}</option>`).join('')}
    </select>
    
     <label for="jenis_perangkat{id}">Jenis Perangkat</label>
<select id="jenis_perangkat{id}" onchange="updateSN('{id}')">
  <option value="">-- Pilih Jenis Perangkat (opsional) --</option>
  <option value="C-DATA XPON ONU">C-DATA XPON ONU</option>
  <option value="C-DATA XPON DUAL-BAND ONU">C-DATA XPON DUAL-BAND ONU</option>
  <option value="RISECOME">RISECOME</option>
</select>

    <label for="sn_perangkat{id}">SN Perangkat</label>
    <input type="text" id="sn_perangkat{id}" placeholder="Serial number perangkat (opsional)">
    
 
    <div class="search-container">
            <label for="ds{id}">Direct Sales</label>
            <input type="text" id="ds{id}" placeholder="Ketik untuk mencari nama direct sales" oninput="searchData(this, 'dsResults{id}', dsData)">
            <div class="search-results" id="dsResults{id}"></div>
        </div>
      

    <label for="keterangan{id}">Keterangan</label>
    <input type="text" id="keterangan{id}" value="Selesai">
`;


// Fungsi pencarian universal untuk ODP dan DS
function searchData(inputElement, resultsId, dataArray) {
    const searchTerm = inputElement.value.toLowerCase();
    const resultsContainer = document.getElementById(resultsId);
    
    if (searchTerm.length < 1) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    const filteredData = dataArray.filter(item => 
        item.toLowerCase().includes(searchTerm)
    );
    
    if (filteredData.length > 0) {
        resultsContainer.innerHTML = filteredData.map(item => 
            `<div class="search-result-item" onclick="selectData('${inputElement.id}', '${item}')">${item}</div>`
        ).join('');
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.style.display = 'none';
    }
}

// Fungsi untuk memilih data dari hasil pencarian
function selectData(inputId, value) {
    document.getElementById(inputId).value = value;
    
    // Sembunyikan hasil pencarian
    if (inputId.includes('odp')) {
        document.getElementById(inputId.replace('odp', 'odpResults')).style.display = 'none';
    } else if (inputId.includes('ds')) {
        document.getElementById(inputId.replace('ds', 'dsResults')).style.display = 'none';
    }
}

// Tutup hasil pencarian ketika klik di luar
document.addEventListener('click', function(e) {
    if (!e.target.matches('.search-container input')) {
        const allResults = document.querySelectorAll('.search-results');
        allResults.forEach(result => {
            result.style.display = 'none';
        });
    }
});

// Tambahkan event listener untuk menutup dropdown ketika menekan Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const allResults = document.querySelectorAll('.search-results');
        allResults.forEach(result => {
            result.style.display = 'none';
        });
    }
});

// Fungsi XPON ONU dan RISECOME
function updateSN(id) {
  const jenis = document.getElementById("jenis_perangkat" + id).value;
  const snField = document.getElementById("sn_perangkat" + id);

  if (jenis === "C-DATA XPON ONU") {
    // hanya kasih prefix, user bisa lanjut ngetik
    snField.value = "DF1D-";
    snField.focus();
    snField.setSelectionRange(snField.value.length, snField.value.length);
  } else if (jenis === "C-DATA DUAL-BAND XPON ONU") {
    snField.value = "DF51";
    snField.focus();
    snField.setSelectionRange(snField.value.length, snField.value.length);
     } else if (jenis === "RISECOME") {
    snField.value = "RCMG";
    snField.focus();
    snField.setSelectionRange(snField.value.length, snField.value.length);
  } else {
    snField.value = ""; // reset kalau pilih kosong
  }
}

// Tambah form terminate
function addForm() {
    formCount++;
    const div = document.createElement("div");
    div.className = "form";
    div.id = "form" + formCount;

    let formHTML = terminateTemplate.replace(/{id}/g, formCount);
    formHTML += `<button class="delete" onclick="deleteForm(${formCount})">Hapus Form</button>`;
    
    div.innerHTML = formHTML;
    document.getElementById("forms").appendChild(div);

    // Scroll ke form baru
    div.scrollIntoView({behavior: "smooth"});
}

// Hapus form
function deleteForm(id) {
    const form = document.getElementById("form" + id);
    if (form && confirm("Yakin ingin menghapus form ini?")) {
        form.remove();
    }
}

// Helper function untuk mendapatkan value
function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

// Generate laporan terminate
function generate() {
    const forms = document.querySelectorAll(".form");
    if (forms.length === 0) {
        alert("Tidak ada data terminate untuk dilaporkan! Tambahkan form terlebih dahulu.");
        return;
    }

    let judul = getValue("ket{id}") || "LAPORAN TERMINATE SUBANG";
    let tanggal = getValue("reportDate");
    let team = getValue("teamName");
    
    let laporan = `${judul}\n${tanggal}\n\n`;
    if (team) {
        laporan += `Team: ${team}\n\n`;
    } else {
        laporan += `\n`;
    }

    let terminateData = [];
    let nomor = 1;

    forms.forEach((form) => {
        let i = form.id.replace("form", "");
        
        let cid = getValue("cid" + i);
        let nama = getValue("nama" + i);
        
        // Hanya tambahkan jika ada CID dan Nama
        if (cid && nama) {
            terminateData.push({
                id: i,
                nomor: nomor++,
                nama: nama,
                cid: cid,
                odp: getValue("odp" + i),
                port: getValue("port" + i),
                jenisperangkat: getValue("jenis_perangkat" + i),
                sn: getValue("sn_perangkat" + i),
                ds: getValue("ds" + i),
                keterangan: getValue("keterangan" + i) || 'Selesai'
            });
        }
    });

    if (terminateData.length === 0) {
        alert("Data terminate tidak lengkap! Pastikan CID dan Nama sudah diisi.");
        return;
    }

    // Format laporan terminate
    terminateData.forEach(data => {
        laporan += `${data.nomor}. A/N : ${data.nama}\n`;
        laporan += `CID : ${data.cid}\n`;
        if (data.odp) laporan += `ODP : ${data.odp}\n`;
        if (data.port) laporan += `Port : ${data.port}\n`;
        if (data.jenisperangkat) laporan += `Jenis Perangat : ${data.jenisperangkat}\n`;
        if (data.sn) laporan += `SN : ${data.sn}\n`;
        if (data.ds) laporan += `DS : ${data.ds}\n`;
        laporan += `Keterangan : ${data.keterangan}\n\n`;
    });

    document.getElementById("output").innerText = laporan.trim();
}

// Kirim via WhatsApp
function sendWA() {
    let text = document.getElementById("output").innerText;
    if (!text) {
        alert("Buat laporan terminate dulu sebelum kirim ke WhatsApp!");
        return;
    }
    let url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
}

// Reset laporan
function resetLaporan() {
    if (confirm("Yakin ingin menghapus semua data terminate?")) {
        document.getElementById("forms").innerHTML = "";
        document.getElementById("output").innerText = "";
        document.getElementById("teamName").value = "";
        document.getElementById("reportDate").value = "";
        formCount = 0;
        updateDate(); // Reset date to current date
    }
}

// Initialize saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    
    // Set judul default
    document.getElementById("ket{id}").value = "LAPORAN TERMINATE SUBANG";
});