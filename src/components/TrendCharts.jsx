import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#94a3b8',
      bodyColor: '#f1f5f9',
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 } },
      border: { color: '#1e293b' },
    },
    y: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 } },
      border: { color: '#1e293b' },
    },
  },
}

export default function TrendCharts({ annualData }) {
  const labels = annualData.map(d => d.year.toString())

  const precipData = {
    labels,
    datasets: [
      {
        label: 'Annual Precipitation (mm)',
        data: annualData.map(d => Math.round(d.precipitation)),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#1e3a5f',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        fill: true,
        tension: 0.3,
      },
    ],
  }

  const precipOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} mm`,
        },
      },
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: 'mm',
          color: '#64748b',
          font: { size: 11 },
        },
      },
    },
  }

  const extremeWindColors = annualData.map(d =>
    d.extremeWindDays >= 20
      ? 'rgba(239, 68, 68, 0.8)'
      : d.extremeWindDays >= 10
      ? 'rgba(249, 115, 22, 0.8)'
      : 'rgba(59, 130, 246, 0.8)'
  )

  const windData = {
    labels,
    datasets: [
      {
        label: 'Extreme Wind Days (>60km/h)',
        data: annualData.map(d => d.extremeWindDays),
        backgroundColor: extremeWindColors,
        borderColor: extremeWindColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const windOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} days`,
        },
      },
    },
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        title: {
          display: true,
          text: 'days',
          color: '#64748b',
          font: { size: 11 },
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3 className="chart-title">
          <span className="chart-dot chart-dot--blue" />
          Annual Precipitation Trend
        </h3>
        <p className="chart-sub">10-year historical precipitation (mm)</p>
        <div className="chart-container">
          <Line data={precipData} options={precipOptions} />
        </div>
      </div>
      <div className="chart-card">
        <h3 className="chart-title">
          <span className="chart-dot chart-dot--orange" />
          Extreme Wind Events
        </h3>
        <p className="chart-sub">Days with wind speed exceeding 60 km/h</p>
        <div className="chart-container">
          <Bar data={windData} options={windOptions} />
        </div>
      </div>
    </div>
  )
}
