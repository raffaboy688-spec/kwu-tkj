
/* ==========================================
   DASHBOARD KWU TKJ
   SMK NEGERI 1 TUREN
   JavaScript - Manajemen Pesanan Servis
========================================== */

"use strict";

// ==========================================
// 1. PENGATURAN DAN PENYIMPANAN DATA
// ==========================================

const STORAGE_KEY = "kwu_tkj_pesanan_v1";

const STATUS = [
    "Menunggu Konfirmasi",
    "Sedang Diperiksa",
    "Sedang Dikerjakan",
    "Selesai",
    "Sudah Diambil"
];

let pesanan = muatData();
let kataPencarian = "";

// Mengambil data yang tersimpan di browser
function muatData() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const hasil = data ? JSON.parse(data) : [];
        return Array.isArray(hasil) ? hasil : [];
    } catch (error) {
        console.error("Gagal membaca data:", error);
        return [];
    }
}

// Menyimpan data ke browser
function simpanData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pesanan));
        return true;
    } catch (error) {
        alert("Data gagal disimpan. Periksa penyimpanan browser.");
        console.error(error);
        return false;
    }
}

// Membuat ID pesanan
function buatID() {
    return "KWU-" + Date.now().toString(36).toUpperCase();
}

// ==========================================
// 2. MENGAMBIL ELEMEN HTML
// ==========================================

const form = document.querySelector("#pemesanan form");
const bagianPesanan = document.querySelector("#pesanan");
const bagianDashboard = document.querySelector("#dashboard");

const tabelPesanan = bagianPesanan
    ? bagianPesanan.querySelector("table")
    : null;

const tabelStatistik = bagianDashboard
    ? bagianDashboard.querySelector("table")
    : null;

// ==========================================
// 3. MEMBUAT FITUR PENCARIAN
// ==========================================

let inputCari = null;

function buatPencarian() {
    if (!bagianPesanan || !tabelPesanan) return;

    const wadah = document.createElement("div");
    wadah.style.margin = "15px 0";

    const label = document.createElement("label");
    label.htmlFor = "cari-pesanan";
    label.textContent = "Cari Pesanan Servis";

    inputCari = document.createElement("input");
    inputCari.type = "search";
    inputCari.id = "cari-pesanan";
    inputCari.placeholder = "Cari nama, ID, perangkat, atau keluhan...";
    inputCari.style.width = "100%";

    inputCari.addEventListener("input", function () {
        kataPencarian = this.value.trim().toLowerCase();
        tampilkanPesanan();
    });

    wadah.append(label, inputCari);
    tabelPesanan.before(wadah);
}

// ==========================================
// 4. MEMBUAT KOLOM AKSI PADA TABEL
// ==========================================

function siapkanTabel() {
    if (!tabelPesanan) return;

    const kepala = tabelPesanan.querySelector("thead tr");

    if (kepala && !kepala.querySelector('[data-kolom="aksi"]')) {
        const th = document.createElement("th");
        th.textContent = "Aksi";
        th.dataset.kolom = "aksi";
        kepala.appendChild(th);
    }
}

// ==========================================
// 5. MENGAMBIL NILAI FORMULIR
// ==========================================

function nilaiForm(id) {
    const elemen = document.getElementById(id);
    return elemen ? elemen.value.trim() : "";
}

// ==========================================
// 6. MENAMBAHKAN PESANAN BARU
// ==========================================

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const dataBaru = {
            id: buatID(),
            nama: nilaiForm("nama"),
            telepon: nilaiForm("telepon"),
            perangkat: nilaiForm("perangkat"),
            merek: nilaiForm("merek"),
            layanan: nilaiForm("layanan-pilih"),
            keluhan: nilaiForm("keluhan"),
            tanggal: nilaiForm("tanggal"),
            status: STATUS[0],
            dibuat: new Date().toISOString()
        };

        // Validasi data wajib
        if (
            !dataBaru.nama ||
            !dataBaru.telepon ||
            !dataBaru.perangkat ||
            !dataBaru.layanan ||
            !dataBaru.keluhan ||
            !dataBaru.tanggal
        ) {
            alert("Mohon lengkapi semua kolom wajib.");
            return;
        }

        pesanan.unshift(dataBaru);

        if (!simpanData()) {
            pesanan.shift();
            return;
        }

        tampilkanPesanan();
        perbaruiStatistik();

        alert(
            "Pesanan berhasil dicatat!\n" +
            "ID Pesanan: " + dataBaru.id +
            "\nStatus: " + dataBaru.status
        );

        form.reset();

        if (bagianPesanan) {
            bagianPesanan.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
}

// ==========================================
// 7. MEMBUAT ELEMEN TABEL DENGAN AMAN
// ==========================================

// Menggunakan textContent untuk menghindari
// HTML yang dimasukkan pengguna dieksekusi.

function buatSel(teks) {
    const td = document.createElement("td");
    td.textContent = teks || "-";
    return td;
}

function buatTombol(teks, aksi) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.textContent = teks;
    tombol.style.margin = "3px";
    tombol.style.padding = "7px 10px";
    tombol.addEventListener("click", aksi);
    return tombol;
}

// ==========================================
// 8. MENAMPILKAN DATA PESANAN
// ==========================================

function tampilkanPesanan() {
    if (!tabelPesanan) return;

    const tbody = tabelPesanan.querySelector("tbody");
    if (!tbody) return;

    tbody.replaceChildren();

    const hasilFilter = pesanan.filter(function (item) {
        const teks = [
            item.id,
            item.nama,
            item.telepon,
            item.perangkat,
            item.merek,
            item.layanan,
            item.keluhan,
            item.status
        ].join(" ").toLowerCase();

        return teks.includes(kataPencarian);
    });

    if (hasilFilter.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = 7;
        td.textContent = pesanan.length === 0
            ? "Belum ada pesanan servis."
            : "Pesanan tidak ditemukan.";

        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    hasilFilter.forEach(function (item) {
        const tr = document.createElement("tr");

        // Kolom data pesanan
        tr.appendChild(buatSel(item.nama));
        tr.appendChild(
            buatSel(item.perangkat + (item.merek ? " - " + item.merek : ""))
        );
        tr.appendChild(buatSel(item.keluhan));
        tr.appendChild(buatSel(item.tanggal));

        // Kolom status
        const tdStatus = document.createElement("td");
        const pilihStatus = document.createElement("select");

        STATUS.forEach(function (status) {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            pilihStatus.appendChild(option);
        });

        pilihStatus.value = STATUS.includes(item.status)
            ? item.status
            : STATUS[0];

        pilihStatus.addEventListener("change", function () {
            ubahStatus(item.id, this.value);
        });

        tdStatus.appendChild(pilihStatus);

        // Kolom ID
        const tdID = buatSel(item.id);

        // Kolom aksi
        const tdAksi = document.createElement("td");

        const tombolHapus = buatTombol("Hapus", function () {
            hapusPesanan(item.id);
        });

        const tombolDetail = buatTombol("Detail", function () {
            alert(
                "DETAIL PESANAN\n\n" +
                "ID: " + item.id + "\n" +
                "Nama: " + item.nama + "\n" +
                "WhatsApp: " + item.telepon + "\n" +
                "Perangkat: " + item.perangkat + "\n" +
                "Merek: " + (item.merek || "-") + "\n" +
                "Layanan: " + item.layanan + "\n" +
                "Keluhan: " + item.keluhan + "\n" +
                "Tanggal: " + item.tanggal + "\n" +
                "Status: " + item.status
            );
        });

        tdAksi.append(tombolDetail, tombolHapus);

        // Susunan kolom sesuai tabel HTML:
        // Nama, perangkat, keluhan, tanggal,
        // status, ID, aksi.
        tr.append(
            tdID,
            buatSel(item.nama),
            buatSel(item.perangkat),
            buatSel(item.keluhan),
            buatSel(item.tanggal),
            tdStatus,
            tdAksi
        );

        tbody.appendChild(tr);
    });
}

// ==========================================
// 9. MENGUBAH STATUS PESANAN
// ==========================================

function ubahStatus(id, statusBaru) {
    if (!STATUS.includes(statusBaru)) return;

    const indeks = pesanan.findIndex(function (item) {
        return item.id === id;
    });

    if (indeks === -1) return;

    const statusLama = pesanan[indeks].status;
    pesanan[indeks].status = statusBaru;

    if (!simpanData()) {
        pesanan[indeks].status = statusLama;
        tampilkanPesanan();
        return;
    }

    perbaruiStatistik();
    tampilkanPesanan();
}

// ==========================================
// 10. MENGHAPUS PESANAN
// ==========================================

function hapusPesanan(id) {
    const item = pesanan.find(function (p) {
        return p.id === id;
    });

    if (!item) return;

    const yakin = confirm(
        "Apakah Anda yakin ingin menghapus pesanan " +
        item.id + " milik " + item.nama + "?"
    );

    if (!yakin) return;

    const dataLama = [...pesanan];

    pesanan = pesanan.filter(function (p) {
        return p.id !== id;
    });

    if (!simpanData()) {
        pesanan = dataLama;
        return;
    }

    tampilkanPesanan();
    perbaruiStatistik();
}

// ==========================================
// 11. MEMPERBARUI STATISTIK DASHBOARD
// ==========================================

function perbaruiStatistik() {
    if (!tabelStatistik) return;

    const sel = tabelStatistik.querySelectorAll("tbody td");

    if (sel.length < 4) return;

    const total = pesanan.length;

    const sedangDikerjakan = pesanan.filter(function (item) {
        return item.status === "Sedang Dikerjakan";
    }).length;

    const selesai = pesanan.filter(function (item) {
        return item.status === "Selesai" ||
               item.status === "Sudah Diambil";
    }).length;

    const menunggu = pesanan.filter(function (item) {
        return item.status === "Menunggu Konfirmasi";
    }).length;

    sel[0].textContent = total;
    sel[1].textContent = sedangDikerjakan;
    sel[2].textContent = selesai;
    sel[3].textContent = menunggu;
}

// ==========================================
// 12. MENGATUR TANGGAL DEFAULT
// ==========================================

function aturTanggal() {
    const inputTanggal = document.getElementById("tanggal");

    if (!inputTanggal || inputTanggal.value) return;

    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
    const hari = String(sekarang.getDate()).padStart(2, "0");

    inputTanggal.value = `${tahun}-${bulan}-${hari}`;
}

// ==========================================
// 13. INISIALISASI DASHBOARD
// ==========================================

function jalankanDashboard() {
    buatPencarian();
    siapkanTabel();
    aturTanggal();
    tampilkanPesanan();
    perbaruiStatistik();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", jalankanDashboard);
} else {
    jalankanDashboard();
}
