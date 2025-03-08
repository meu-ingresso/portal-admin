<template>
  <LineChart :chart-data="chartData" :options="chartOptions" />
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// Registrar os componentes do Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

export default {
  components: { LineChart: Line },
  props: {
    orders: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    salesData() {
      // Agrupar pedidos por data (YYYY-MM-DD)
      const groupedByDate = {};
      this.orders.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = 0;
        }
        groupedByDate[date] += order.tickets.length; // Somar ingressos
      });

      // Transformar em array ordenado por data
      const sortedDates = Object.keys(groupedByDate).sort();
      return sortedDates.map(date => ({
        date,
        sold: groupedByDate[date]
      }));
    },
    chartData() {
      return {
        labels: this.salesData.map(d => d.date), // Eixo X: Datas
        datasets: [
          {
            label: 'Ingressos Vendidos',
            data: this.salesData.map(d => d.sold), // Eixo Y: Quantidade
            borderColor: '#7E57C2', // Cor da linha
            backgroundColor: 'rgba(126, 87, 194, 0.2)', // Preenchimento leve
            fill: false // Sem preenchimento abaixo da linha
          }
        ]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Ingressos Vendidos'
            },
            beginAtZero: true // Começar do zero
          }
        },
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: context => `${context.dataset.label}: ${context.raw}`
            }
          }
        }
      };
    }
  }
};
</script>

<style scoped>
/* Ajuste o tamanho do gráfico conforme necessário */
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>