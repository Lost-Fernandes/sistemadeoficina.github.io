// Função para cadastrar veículo
document.getElementById('vehicleForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const model = document.getElementById('model').value;
    const plate = document.getElementById('plate').value;
    const lastService = document.getElementById('lastService').value;

    const vehicle = { model, plate, lastService };
    localStorage.setItem(plate, JSON.stringify(vehicle));
    alert('Veículo cadastrado com sucesso!');

    // Atualiza as listas de serviços
    checkForUpcomingService(vehicle);
    displayUpcomingServices();
});

// Função para verificar serviços futuros
function checkForUpcomingService(vehicle) {
    const currentDate = new Date();
    const serviceDate = new Date(vehicle.lastService);
    const nextServiceDate = new Date(serviceDate);
    nextServiceDate.setMonth(nextServiceDate.getMonth() + 2);

    const timeDiff = nextServiceDate - currentDate;
    const daysUntilService = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysUntilService <= 1) {
        sendWhatsAppNotification(vehicle);
    }
}

// Função para enviar notificação via WhatsApp
function sendWhatsAppNotification(vehicle) {
    console.log(`Notificação enviada para ${vehicle.model} (${vehicle.plate})`);
}

// Função para exibir próximos serviços
function displayUpcomingServices() {
    const upcomingServices = document.getElementById('upcomingServices');
    upcomingServices.innerHTML = '';

    for (let i = 0; i < localStorage.length; i++) {
        const plate = localStorage.key(i);
        if (!plate.endsWith('_history')) {
            const vehicle = JSON.parse(localStorage.getItem(plate));
            
            if (vehicle) {
                const nextServiceDate = new Date(vehicle.lastService);
                nextServiceDate.setMonth(nextServiceDate.getMonth() + 6);

                const listItem = document.createElement('li');
                listItem.textContent = `${vehicle.model} (${vehicle.plate}) - Próxima revisão: ${nextServiceDate.toLocaleDateString()}`;
                
                // Adiciona botão de deletar
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Deletar';
                deleteButton.onclick = function () {
                    localStorage.removeItem(plate);
                    localStorage.removeItem(plate + '_history'); // Deleta o histórico de manutenção também
                    displayUpcomingServices();
                };

                listItem.appendChild(deleteButton);
                upcomingServices.appendChild(listItem);
            }
        }
    }
}

// Função para registrar manutenção
document.getElementById('maintenanceForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const plate = document.getElementById('maintenancePlate').value;
    const date = document.getElementById('maintenanceDate').value;
    const description = document.getElementById('maintenanceDescription').value;

    const maintenanceEntry = { date, description };

    const maintenanceHistory = localStorage.getItem(plate + '_history') || '[]';
    const updatedHistory = JSON.parse(maintenanceHistory);
    updatedHistory.push(maintenanceEntry);
    localStorage.setItem(plate + '_history', JSON.stringify(updatedHistory));

    alert('Manutenção registrada com sucesso!');
    displayMaintenanceHistory(plate);
});

// Função para exibir histórico de manutenção
function displayMaintenanceHistory(plate) {
    const maintenanceHistory = JSON.parse(localStorage.getItem(plate + '_history')) || [];
    const maintenanceHistoryList = document.getElementById('maintenanceHistory');
    maintenanceHistoryList.innerHTML = '';

    maintenanceHistory.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.textContent = `${entry.date} - ${entry.description}`;
        maintenanceHistoryList.appendChild(listItem);
    });
}

// Atualiza o histórico de manutenção ao carregar a página
document.addEventListener('DOMContentLoaded', function () {
    displayUpcomingServices();
    const plates = Object.keys(localStorage).filter(key => !key.endsWith('_history'));
    plates.forEach(plate => displayMaintenanceHistory(plate));
});
