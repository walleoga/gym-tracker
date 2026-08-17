
const exercisesData = {
  push: [
    "Press inclinado con mancuernas",
    "Peck deck",
    "Press militar",
    "Elevaciones laterales",
    "Tricep unilateral en polea baja"
  ],
  pull: [
    "Dominadas neutras", 
    "Scott supino unilateral",
    "Scott martillo unilateral",
    "Curl inclinado brazos por detrás",
    "Jalón unilateral",
    "Remo con agarre cerrado",
    "Peck deck al revés",
    "Chest supported row con mancuernas"
  ],
  legs: [
    "Sentadilla",
    "Extensión de cuádriceps",
    "Curl femoral",
    "Gemelos parado"
  ]
};

let currentTab = 'push';
let chartInstance = null;

let workoutHistory = JSON.parse(localStorage.getItem('gymData')) || [];

function setTab(tab) {
  currentTab = tab;
  
  document.getElementById('tab-push').classList.toggle('active', tab === 'push');
  document.getElementById('tab-pull').classList.toggle('active', tab === 'pull');
  document.getElementById('tab-legs').classList.toggle('active', tab === 'legs');

  const select = document.getElementById('exercise');
  select.innerHTML = '';
  
  exercisesData[tab].forEach(ex => {
    const option = document.createElement('option');
    option.value = ex;
    option.innerText = ex;
    select.appendChild(option);
  });

  updateChart();
}

function saveSet() {
  const exercise = document.getElementById('exercise').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const reps = parseInt(document.getElementById('reps').value);
  
  if (!weight || !reps) {
    alert("Completá el peso y las repeticiones, fiera.");
    return;
  }

  const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

  const newSet = { date, exercise, weight, reps, tab: currentTab };
  workoutHistory.push(newSet);

  localStorage.setItem('gymData', JSON.stringify(workoutHistory));

  // Limpiar inputs
  document.getElementById('weight').value = '';
  document.getElementById('reps').value = '';

  renderHistory();
  updateChart();
}

function renderHistory() {
  const tbody = document.getElementById('history-body');
  tbody.innerHTML = '';

  const recent = [...workoutHistory].reverse().slice(0, 15);

  recent.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td style="color: #38bdf8; font-weight: bold;">${item.exercise}</td>
        <td>${item.weight} kg</td>
        <td>${item.reps}</td>
      </tr>
    `;
  });
}

function updateChart() {
  const selectedExercise = document.getElementById('exercise').value;
  
  const dataForExercise = workoutHistory.filter(item => item.exercise === selectedExercise);

  const prsByDate = {};
  dataForExercise.forEach(item => {
    if (!prsByDate[item.date] || item.weight > prsByDate[item.date]) {
      prsByDate[item.date] = item.weight;
    }
  });

  const labels = Object.keys(prsByDate);
  const dataPoints = Object.values(prsByDate);

  renderPRChart(labels, dataPoints, selectedExercise);
  renderHistory();
}

function renderPRChart(labels, data, exerciseName) {
  const canvas = document.getElementById('prChart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `PR Peso (kg) - ${exerciseName}`,
        data: data,
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#94a3b8', font: { size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: '#64748b', font: { size: 10 } },
          grid: { color: '#1e294f' }
        }
      }
    }
  });
}

function clearHistory() {
  if (confirm("¿Estás seguro que querés borrar todo el historial? Esto no se puede deshacer.")) {
    workoutHistory = [];
    localStorage.removeItem('gymData');
    renderHistory();
    updateChart();
  }
}

window.onload = () => {
  setTab('push');
  renderHistory();
};