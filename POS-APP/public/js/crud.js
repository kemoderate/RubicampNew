let entity = null;

$(document).ready(function () {
  // Initialize myTable (for purchases, goods, users, etc.)
  const $table = $('#myTable');
  if ($table.length) {
    const hasImage = $table.data('has-image');
    const dataTableOptions = {
      paging: true,
      searching: true,
      ordering: true, // enable sort
      columnDefs: [{ orderable: false, targets: -1 }], // actions column tidak sortable
      pageLength: 10,
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    };

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
    entity = $table.data('entity');
    if (!entity) {
      console.error('Table belum memiliki data-entity');
    }else if(entity === 'sales' || entity === 'purchases'){
    dataTableOptions.order = [[0, 'desc']];
    }
    $table.DataTable(dataTableOptions);
  }

  // Keep dashboardTable for backward compatibility
  const $dashboardTable = $('#dashboardTable');
  if ($dashboardTable.length) {
    $dashboardTable.DataTable({
      paging: true,
      searching: true,
      ordering: true,             
      order: [[0, 'desc']], 
      pageLength: 10,
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
       columnDefs: [{
            targets: 0,
            type: 'string',
            orderDataType: 'dom-data-sort'
        }]
    });
  }

  // Save button handler
  $('#btnSave').click(function (e) {
    e.preventDefault();
    $('form').submit();
  });
});

// Edit button handler
$(document).on('click', '.btn-edit', function () {
  const id = $(this).data('id');
  if (!id || !entity) return alert('Data edit tidak lengkap');
  window.location.href = `/${entity}/edit/${encodeURIComponent(id)}`;
});

// Delete button handler
$(function () {
  let deleteId = null;

  // Pakai event delegation biar jalan walau DataTables re-render
  $('#myTable').on('click', '.btn-delete', function (e) {
    e.preventDefault();

     if ($(this).hasClass('disabled')) {
        return;
    }

    deleteId = $(this).data('id');
    const entityFromButton = $(this).data('entity');
    
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

$.fn.dataTable.ext.order['dom-data-sort'] = function (settings, col) {
    return this.api().column(col, {order:'index'}).nodes().map(function (td, i) {
        return $(td).parent().attr('data-sort');
    });
};