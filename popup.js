document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    const processCount = document.getElementById('processCount');
    const processListDiv = document.getElementById('processList');
    const reportModal = document.getElementById('reportModal');
    const ctx = document.getElementById('processChart').getContext('2d');

    let processosEnviados = JSON.parse(localStorage.getItem('processosEnviados')) || [];
    let dataUltimoReset = localStorage.getItem('dataUltimoReset');

    function verificarData() {
        const hoje = new Date().toLocaleDateString();

        if (dataUltimoReset !== hoje) {
            localStorage.setItem('dataUltimoReset', hoje);
            localStorage.setItem('processosHoje', JSON.stringify([]));
            processCount.textContent = 0;
            updateProgress();
        }
    }

    function updateProgress() {
        const processosHoje = JSON.parse(localStorage.getItem('processosHoje')) || [];
        const progress = (processosHoje.length / 100) * 100;
        progressBar.style.width = `${progress}%`;
    }

    document.getElementById('submitProcess').addEventListener('click', () => {
        const processNumber = document.getElementById('processNumber').value;

        if (processNumber) {
            const hoje = new Date().toLocaleDateString();
            processosEnviados.push({ processNumber, date: hoje });
            localStorage.setItem('processosEnviados', JSON.stringify(processosEnviados));

            const processosHoje = JSON.parse(localStorage.getItem('processosHoje')) || [];
            processosHoje.push({ processNumber, date: hoje });
            localStorage.setItem('processosHoje', JSON.stringify(processosHoje));

            updateProgress();
            processCount.textContent = processosHoje.length;
            document.getElementById('processNumber').value = "";
        } else {
            alert('Por favor, insira um número de processo.');
        }
    });

    document.getElementById('resetProgress').addEventListener('click', () => {
        const resetCode = document.getElementById('resetCode').value;
        if (resetCode === "RESETTRF6") {
            localStorage.setItem('processosHoje', JSON.stringify([]));
            processCount.textContent = 0;
            updateProgress();
            alert('Progresso resetado com sucesso!');
        } else {
            alert('Código incorreto! Digite "RESETTRF6" para resetar.');
        }
    });

    document.getElementById('showProcessList').addEventListener('click', () => {
        if (processosEnviados.length > 0) {
            const list = processosEnviados.map(process => `<li>${process.processNumber}</li>`).join('');
            processListDiv.innerHTML = `<h3>Processos Enviados:</h3><ul>${list}</ul>`;
        } else {
            processListDiv.innerHTML = "<p>Nenhum processo enviado ainda.</p>";
        }
    });

    document.getElementById('showMonthlyReport').addEventListener('click', () => {
        const monthlyData = getMonthlyData();
        const labels = Object.keys(monthlyData);
        const data = Object.values(monthlyData);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Processos Enviados',
                    data: data,
                    backgroundColor: 'rgba(98, 0, 234, 0.6)',
                    borderColor: 'rgba(98, 0, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, /* Faz o gráfico ser responsivo */
                maintainAspectRatio: false, /* Permite ajustar a altura e largura */
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                onClick: function(e) {
                    const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (activePoints.length) {
                        const index = activePoints[0].index;
                        const selectedMonth = labels[index];
                        showProcessListForMonth(selectedMonth);
                    }
                }
            }
        });

        reportModal.style.display = 'flex';
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        reportModal.style.display = 'none';
    });

    function getMonthlyData() {
        const monthlyData = {};
        processosEnviados.forEach(item => {
            const date = new Date(item.date);
            const month = getMonthName(date.getMonth()) + '/' + date.getFullYear();
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month]++;
        });
        return monthlyData;
    }

    function getMonthName(monthIndex) {
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        return months[monthIndex];
    }

    function showProcessListForMonth(month) {
        const processesForMonth = processosEnviados.filter(process => {
            const processMonth = new Date(process.date);
            const processMonthName = getMonthName(processMonth.getMonth()) + '/' + processMonth.getFullYear();
            return processMonthName === month;
        });

        const list = processesForMonth.map(process => `<li>${process.processNumber}</li>`).join('');
        document.getElementById('monthProcessList').innerHTML = `<h3>Processos Enviados em ${month}:</h3><ul>${list}</ul>`;
    }

    verificarData();
    processCount.textContent = JSON.parse(localStorage.getItem('processosHoje'))?.length || 0;
    updateProgress();
});

document.getElementById('showMonthlyReport').addEventListener('click', () => {
    console.log("Botão Relatório Mensal clicado"); // Verifique se esta mensagem aparece no console
    const monthlyData = getMonthlyData();
    const labels = Object.keys(monthlyData);
    const data = Object.values(monthlyData);

    // Exibe o modal
    reportModal.style.display = 'flex';

    // Renderiza o gráfico
    renderChart(labels, data);
});