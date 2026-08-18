const exercisesData = {
  push: [
    "Press banca",
    "Press inclinado con mancuernas",
    "Peck deck",
    "Press militar con mancuernas",
    "Elevaciones laterales",
    "Tricep unilateral en polea alta",
    "Tricep unilateral en polea baja",
    "Flexiones",
    "Fondos"
  ],
  pull: [
    "Dominadas neutras",
    "Dominadas supinas",
    "Scott supino unilateral",
    "Scott martillo unilateral",
    "Bayesian sentado con mancuernas",
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
  const weightInput = document.getElementById('weight').value;
  const reps = parseInt(document.getElementById('reps').value);
  const notes = document.getElementById('notes').value.trim();
  
  const weight = weightInput === '' ? 0 : parseFloat(weightInput);

  if (isNaN(reps) || reps <= 0) {
    alert("Anotá las repeticiones, fiera.");
    return;
  }

  const date = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

  const newSet = { date, exercise, weight, reps, notes, tab: currentTab };
  workoutHistory.push(newSet);
  localStorage.setItem('gymData', JSON.stringify(workoutHistory));

  document.getElementById('weight').value = '';
  document.getElementById('reps').value = '';
  document.getElementById('notes').value = '';

  renderHistory();
  updateChart();
}

function renderHistory() {
  const tbody = document.getElementById('history-body');
  tbody.innerHTML = '';

  const historyWithIndex = workoutHistory.map((item, index) => ({
    ...item,
    originalIndex: index
  }));

  const filteredByTab = historyWithIndex.filter(item => item.tab === currentTab);

  const recent = [...filteredByTab].reverse().slice(0, 20);

  recent.forEach(item => {
    const weightDisplay = item.weight === 0 ? '<span style="color:#fbbf24">Corp.</span>' : `${item.weight} kg`;
    const noteDisplay = item.notes ? `<div style="font-size: 10px; color: #94a3b8; margin-top: 3px;">💬 ${item.notes}</div>` : '';

    tbody.innerHTML += `
      <tr>
        <td>${item.date}</td>
        <td>
          <div style="color: #38bdf8; font-weight: bold;">${item.exercise}</div>
          ${noteDisplay}
        </td>
        <td>${weightDisplay}</td>
        <td>${item.reps}</td>
        <td style="text-align: center;">
          <button class="btn-delete" onclick="deleteEntry(${item.originalIndex})" title="Borrar serie">✕</button>
        </td>
      </tr>
    `;
  });
}

function deleteEntry(index) {
  if (confirm("¿Estás seguro de borrar esta serie?")) {
    workoutHistory.splice(index, 1);
    localStorage.setItem('gymData', JSON.stringify(workoutHistory));
    renderHistory();
    updateChart();
  }
}

function updateChart() {
  const selectedExercise = document.getElementById('exercise').value;
  const dataForExercise = workoutHistory.filter(item => item.exercise === selectedExercise);

  if (dataForExercise.length === 0) {
    renderPRChart([], [], selectedExercise, "PR");
    return;
  }

  const isBodyweightOnly = dataForExercise.every(item => item.weight === 0);

  const prsByDate = {};
  dataForExercise.forEach(item => {
    const metric = isBodyweightOnly ? item.reps : item.weight;
    if (!prsByDate[item.date] || metric > prsByDate[item.date]) {
      prsByDate[item.date] = metric;
    }
  });

  const labels = Object.keys(prsByDate);
  const dataPoints = Object.values(prsByDate);
  const chartLabel = isBodyweightOnly ? `PR Repeticiones` : `PR Peso (kg)`;

  renderPRChart(labels, dataPoints, selectedExercise, chartLabel);
  renderHistory();
}

function renderPRChart(labels, data, exerciseName, yLabel) {
  const canvas = document.getElementById('prChart');
  const ctx = canvas.getContext('2d');

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${yLabel} - ${exerciseName}`,
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
      plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#1e294f' } }
      }
    }
  });
}

function clearHistory() {
  if (confirm("¿Seguro que querés borrar tu progreso entero?")) {
    workoutHistory = [];
    localStorage.removeItem('gymData');
    renderHistory();
    updateChart();
  }
}

window.onload = () => {
  setTab('push');
};