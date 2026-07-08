let currentData = [];
let editUUID = null;

// Eksekusi saat modul dimuat
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Handle Form Submit
  document.getElementById('crudForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveData();
  });
});

// --- READ: Ambil Data dari API ---
async function loadData() {
  try {
    // API.request didefinisikan di api.js (Tahap 4)
    const data = await API.request('getGuru'); 
    currentData = data;
    renderTable(currentData);
  } catch (error) {
    Swal.fire('Error', 'Gagal memuat data: ' + error.message, 'error');
    document.getElementById('tableBody').innerHTML = `
      <tr><td colspan="5" class="text-center text-danger py-4">Gagal memuat data</td></tr>
    `;
  }
}

// --- RENDER TABEL ---
function renderTable(dataArray) {
  const tbody = document.getElementById('tableBody');
  
  if (!dataArray || dataArray.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Tidak ada data ditemukan</td></tr>`;
    return;
  }

  let html = '';
  dataArray.forEach(item => {
    html += `
      <tr>
        <td class="ps-4">
          <span class="fw-medium text-dark">${item.NIP || '-'}</span><br>
          <small class="text-muted">${item.NUPTK || '-'}</small>
        </td>
        <td class="fw-medium">${item.NamaLengkap}</td>
        <td>${item.JenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
        <td>
          <small><i class="bi bi-telephone text-muted"></i> ${item.NoHP || '-'}</small><br>
          <small><i class="bi bi-envelope text-muted"></i> ${item.Email || '-'}</small>
        </td>
        <td class="text-center pe-4">
          <button class="btn btn-sm btn-light text-primary border-0 rounded-circle" onclick="openModal('edit', '${item.UUID}')" title="Edit">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-sm btn-light text-danger border-0 rounded-circle ms-1" onclick="deleteData('${item.UUID}')" title="Hapus">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
  document.getElementById('paginationInfo').innerText = `Menampilkan ${dataArray.length} data`;
}

// --- PENGATURAN MODAL (TAMBAH / EDIT) ---
function openModal(mode, uuid = null) {
  const modalTitle = document.getElementById('crudModalLabel');
  const modalBody = document.getElementById('crudModalBody');
  
  editUUID = uuid;
  
  // Render Form Input
  modalBody.innerHTML = `
    <div class="mb-3">
      <label class="form-label small fw-semibold">NIP</label>
      <input type="text" class="form-control" id="inputNIP" placeholder="Opsional">
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold text-danger">Nama Lengkap *</label>
      <input type="text" class="form-control" id="inputNama" required>
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold text-danger">Jenis Kelamin *</label>
      <select class="form-select" id="inputJK" required>
        <option value="">Pilih...</option>
        <option value="L">Laki-laki</option>
        <option value="P">Perempuan</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="form-label small fw-semibold">No. HP / WhatsApp</label>
      <input type="text" class="form-control" id="inputHP">
    </div>
  `;

  if (mode === 'edit') {
    modalTitle.textContent = 'Edit Data Guru';
    const item = currentData.find(d => d.UUID === uuid);
    if (item) {
      document.getElementById('inputNIP').value = item.NIP || '';
      document.getElementById('inputNama').value = item.NamaLengkap || '';
      document.getElementById('inputJK').value = item.JenisKelamin || '';
      document.getElementById('inputHP').value = item.NoHP || '';
    }
  } else {
    modalTitle.textContent = 'Tambah Guru Baru';
  }

  const modal = new bootstrap.Modal(document.getElementById('crudModal'));
  modal.show();
}

// --- CREATE & UPDATE: Simpan Data ---
async function saveData() {
  const btnText = document.getElementById('saveText');
  const btnSpinner = document.getElementById('saveSpinner');
  const btnSave = document.getElementById('btnSave');

  // Siapkan Payload JSON
  const payload = {
    uuid: editUUID, // akan null jika mode Tambah
    NIP: document.getElementById('inputNIP').value,
    NamaLengkap: document.getElementById('inputNama').value,
    JenisKelamin: document.getElementById('inputJK').value,
    NoHP: document.getElementById('inputHP').value
  };

  btnText.classList.add('d-none');
  btnSpinner.classList.remove('d-none');
  btnSave.disabled = true;

  try {
    const action = editUUID ? 'updateGuru' : 'addGuru';
    await API.request(action, payload);
    
    // Tutup modal
    bootstrap.Modal.getInstance(document.getElementById('crudModal')).hide();
    
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Data berhasil disimpan!',
      timer: 1500,
      showConfirmButton: false
    });
    
    // Muat ulang tabel
    loadData();
    
  } catch (error) {
    Swal.fire('Error', error.message, 'error');
  } finally {
    btnText.classList.remove('d-none');
    btnSpinner.classList.add('d-none');
    btnSave.disabled = false;
  }
}

// --- DELETE: Hapus Data (Soft Delete) ---
function deleteData(uuid) {
  Swal.fire({
    title: 'Hapus Data?',
    text: "Data ini akan dihapus dari sistem.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#cbd5e1',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await API.request('deleteGuru', { uuid: uuid });
        Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
        loadData(); // Muat ulang data
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus: ' + error.message, 'error');
      }
    }
  });
}

// --- PENCARIAN LOKAL (Search) ---
function filterTable() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filteredData = currentData.filter(item => {
    return (item.NamaLengkap && item.NamaLengkap.toLowerCase().includes(keyword)) ||
           (item.NIP && item.NIP.toLowerCase().includes(keyword));
  });
  renderTable(filteredData);
}
