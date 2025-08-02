const form = document.getElementById("forecast-form");
const ctx = document.getElementById("forecastChart").getContext("2d");
let chart;

function generateForecast(numUsers, avgTime, stdDev, startDate) {
  const daysToSimulate = 60;
  const dailyConversions = new Array(daysToSimulate).fill(0);

  for (let i = 0; i < numUsers; i++) {
    let delay = Math.round(
      stdDev
        ? avgTime + randNormal(stdDev)
        : avgTime
    );
    if (delay >= 0 && delay < daysToSimulate) {
      dailyConversions[delay]++;
    }
  }

  const weeklyData = [];
  for (let i = 0; i < daysToSimulate; i += 7) {
    weeklyData.push(
      dailyConversions.slice(i, i + 7).reduce((a, b) => a + b, 0)
    );
  }

  return weeklyData.map((val, i, arr) =>
    arr.slice(0, i + 1).reduce((a, b) => a + b, 0)
  );
}

function randNormal(stdDev) {
  return (
    stdDev *
    Math.sqrt(-2 * Math.log(Math.random())) *
    Math.cos(2 * Math.PI * Math.random())
  );
}

function renderChart(data, startDate) {
  const labels = Array.from({ length: data.length }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i * 7);
    return `Week ${i + 1} (${d.toLocaleDateString()})`;
  });

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Cumulative Conversions",
          data,
          borderColor: "blue",
          fill: false,
        },
      ],
    },
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const numUsers = parseInt(document.getElementById("numUsers").value);
  const avgTime = parseInt(document.getElementById("avgTime").value);
  const stdDev = parseInt(document.getElementById("stdDev").value || "0");
  const startDate = new Date(document.getElementById("startDate").value);

  const forecast = generateForecast(numUsers, avgTime, stdDev, startDate);
  renderChart(forecast, startDate);
});

document.getElementById("downloadCsv").addEventListener("click", () => {
  if (!chart) return;

  const rows = [["Week", "Cumulative Conversions"]];
  chart.data.labels.forEach((label, i) => {
    rows.push([label, chart.data.datasets[0].data[i]]);
  });

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "conversion_forecast.csv";
  a.click();
  URL.revokeObjectURL(url);
});
