let entity = null;

$(document).ready(function () {
    const $table = $('#myTable')

    const hasImage = $table.data('has-image')

    const dataTableOptions = {
        // Opsi tambahan bisa ditambahkan di sini
        // misal: paging, searching, order, dll
        paging: true,
        searching: true,
        ordering: true, // ini untuk enable sort
        columnDefs: [{ orderable: false, targets: -1 }], // actions column tidak sortable
        pageLength: 3,
        // 🔹 Dropdown pilihan entries
        lengthMenu: [[3, 5, 10, 25, 50, -1], [3, 5, 10, 25, 50, "All"]],
    }
    let imageColumnIndex = null;
    if (hasImage) {
        imageColumnIndex = $table.find('thead th').length - 2;
        dataTableOptions.columnDefs.push({
            targets: imageColumnIndex,
            render: function (data, type, row) {
                if (!data) return '<span class="text-muted">No image</span>';
                return `<img src="/uploads/${data}" width="60" height="60" style="object-fit:cover;">`;
            }

        });
    }


    $table.DataTable(dataTableOptions)
    entity = $table.data('entity');
    if (!entity) {
        console.error('Table belum memiliki data-entity')
        return
    }

});
// edit
$(document).on('click', '.btn-edit', function () {
    const id = $(this).data('id')
    if (!id || !entity) return alert('Data edit tidak lengkap');
    window.location.href = `/${entity}/edit/${encodeURIComponent(id)}`;
})

// delete 
$(function () {

    let deleteId = null;

    // Pakai event delegation biar jalan walau DataTables re-render
    $('#myTable').on('click', '.btn-delete', function (e) {
        e.preventDefault();

        deleteId = $(this).data('id');
        const entity = $(this).data('entity')
        console.log('btn-delete clicked, id =', deleteId);

        if (!deleteId) {
            alert('ID user tidak ditemukan!');
            return;
        }

        // Show modal pakai Bootstrap 4 (jQuery)
        $('#deleteModal').modal('show');
    });
    // Tombol confirm delete
    $('#confirmDelete').off('click').on('click', function (e) {
        e.preventDefault();
        console.log('confirmDelete clicked, deleteId =', deleteId);

        if (!deleteId) {
            alert('Tidak ada user yang dipilih untuk dihapus');
            return;
        }
        // Redirect ke route delete
        window.location.href = `/${entity}/delete/${encodeURIComponent(deleteId)}`;
    });

    // Reset id saat modal ditutup
    $('#deleteModal').on('hidden.bs.modal', function () {
        console.log('deleteModal hidden - reset deleteId');
        deleteId = null;
    });
});

// submit (save)
$(document).ready(function () {
    $('#btnSave').click(function (e) {
        e.preventDefault()
        $('form').submit()
    })
})


$(document).ready(() => {
    $('#dashboardTable').DataTable();
});