// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

// Earnings Line Chart
function initEarningsChart(monthlyData) {
  

  var ctx = document.getElementById("earningsChart");
  if (!ctx) return;

  // Extract labels and data from monthlyData
  var labels = monthlyData.map(row => row.month);
  var earnings = monthlyData.map(row => Number(row.earnings));

  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "Earnings",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: earnings,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7
          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            callback: function(value, index, values) {
              return 'Rp ' + number_format(value);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + ': Rp ' + number_format(tooltipItem.yLabel);
          }
        }
      }
    }
  });
}

// Revenue Pie Chart
function initRevenueChart(directRevenue, customerRevenue) {
  var ctx = document.getElementById("revenueChart");
  if (!ctx) return;

  var myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Direct", "Customer"],
      datasets: [{
        data: [directRevenue, customerRevenue],
        backgroundColor: ['#4e73df', '#1cc88a'],
        hoverBackgroundColor: ['#2e59d9', '#17a673'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
        callbacks: {
          label: function(tooltipItem, chart) {
            var datasetLabel = chart.labels[tooltipItem.index] || '';
            var value = chart.datasets[0].data[tooltipItem.index];
            return datasetLabel + ': Rp ' + number_format(value);
          }
        }
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
    },
  });
}

// Initialize charts when document is ready
$(document).ready(function() {
  // Get data from server-side variables (passed from EJS)
  if (typeof monthlyData !== 'undefined') {
    initEarningsChart(monthlyData);
  }
  
  if (typeof directRevenue !== 'undefined' && typeof customerRevenue !== 'undefined') {
    initRevenueChart(directRevenue, customerRevenue);
  }
});

$(document).ready(function(){
 let totalExpense = 0 , totalRevenue = 0 , totalEarnings = 0;

  $('#dashboardTable tbody tr').each(function(){
    const cells = $(this).find('td');
    if(cells.length >= 4){
      const expense = parseFloat($(cells[1]).text().replace(/[^\d.-]/g,'')) || 0;
      const revenue = parseFloat($(cells[2]).text().replace(/[^\d.-]/g,'')) || 0;
      const earnings = parseFloat($(cells[3]).text().replace(/[^\d.-]/g,'')) || 0;

     totalExpense += expense;
     totalRevenue += revenue;
     totalEarnings += earnings;
 
    }
  })

  $('#totalExpense').text('Rp '+ totalExpense.toLocaleString('id-ID'));
  $('#totalRevenue').text('Rp '+ totalRevenue.toLocaleString('id-ID'));
  $('#totalEarnings').text('Rp '+ totalEarnings.toLocaleString('id-ID'));
})

