import { barberData, fetchSettings, fetchAppointments, fetchServices, fetchPlans } from '../api/barberData.js';
import { activeBarber, activeClient } from '../api/auth.js';
import { API_URL } from '../api/config.js';
import { socket } from '../components/socket.js';
import { openModal, modal } from '../components/modal.js';
import { applyVisualChanges } from '../components/visualChanges.js';
import { formatCurrency, formatDate, formatPhoneInput } from '../utils/formatting.js';

// ----------------------------------------
// VIEW PRINCIPAL DO CLIENTE
// ----------------------------------------

export function renderCustomerView() {
    document.getElementById('customer-view').innerHTML = `
        <header class="bg-white shadow-md sticky top-0 z-20">
            <div class="container mx-auto px-4 py-3 flex justify-between items-center">
                <div class="flex items-center space-x-4 overflow-hidden">
                    <img src="${activeBarber?.logo_url}" 
                        class="app-logo w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm flex-shrink-0">
                    
                    <div class="flex flex-col min-w-0">
                        <h1 class="text-lg md:text-2xl font-bold text-gray-800 truncate leading-tight">
                            ${activeBarber?.name}
                        </h1>
                        <span class="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest font-medium">
                            Barbearia Profissional
                        </span>
                    </div>
                </div>
                
                <div class="relative ml-2">
                    <button id="customer-menu-btn" class="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-all flex items-center justify-center">
                        <i class="fas fa-cog text-2xl md:text-3xl"></i>
                    </button>

                    <div id="customer-dropdown" class="hidden absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <p class="text-sm text-gray-600">Olá,</p>
                            <p class="text-sm font-bold text-gray-800 truncate">${activeClient.name}</p>
                        </div>
                        <button id="open-client-settings" class="w-full flex items-center px-4 py-4 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                            <i class="fas fa-user-edit mr-3 text-blue-600 text-lg"></i> Editar Perfil
                        </button>
                        <button class="logout-btn w-full flex items-center px-4 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <i class="fas fa-sign-out-alt mr-3 text-lg"></i> Sair da Conta
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <main class="container mx-auto p-4 md:p-8">
            <div class="bg-white bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <div class="border-b border-gray-200 mb-6">
                    <nav class="-mb-px flex justify-between gap-2 md:gap-8" id="customer-tabs">
                        <a href="#" data-tab="schedule"
                        class="flex-1 md:flex-none py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600 text-center md:text-left leading-tight md:leading-normal">
                        Agendar <span class="md:inline"><br class="md:hidden"></span>Serviço
                        </a>
                        <a href="#" data-tab="my-appointments"
                        class="flex-1 md:flex-none py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 text-center md:text-left leading-tight md:leading-normal">
                        Meus <span class="md:inline"><br class="md:hidden"></span>Agendamentos
                        </a>
                        <a href="#" data-tab="plans"
                        class="flex-1 md:flex-none py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 text-center md:text-left leading-tight md:leading-normal">
                        Planos <span class="md:inline"><br class="md:hidden"></span>Mensais
                        </a>
                    </nav>
                </div>
                <div id="customer-tab-content">
                    <div id="schedule-content"></div>
                    <div id="my-appointments-content" class="hidden"></div>
                    <div id="plans-content" class="hidden"></div>
                </div>
            </div>
        </main>`;

    applyVisualChanges(activeBarber);
    renderCustomerTab('schedule');
}

// ----------------------------------------
// ABAS
// ----------------------------------------

export function renderCustomerTab(tabName) {

    document.querySelectorAll('#customer-tab-content > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(`${tabName}-content`).classList.remove('hidden');

    switch (tabName) {
        case 'schedule':        renderScheduleTab(); break;
        case 'my-appointments': renderMyAppointmentsTab(); break;
        case 'plans':           renderPlansTab(); break;
    }

    applyVisualChanges(activeBarber);
}

export function showClientSettingsModal() {
    openModal(
        'Cadastro',
        `<div class="space-y-4 p-2">
            <div>
                <label class="block text-sm font-medium text-gray-700">Seu Nome</label>
                <input type="text" id="edit-client-name" value="${activeClient.name}" 
                       class="w-full border border-gray-300 rounded-md p-2 mt-1">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">Telefone/WhatsApp</label>
                <input type="text" id="edit-client-phone" value="${activeClient.phone || ''}" 
                       class="w-full border border-gray-300 rounded-md p-2 mt-1" placeholder="(00) 00000-0000">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700">E-mail (Login)</label>
                <input type="email" id="edit-client-email" value="${activeClient.email}" 
                       class="w-full border border-gray-200 rounded-md p-2 mt-1 bg-gray-50 text-gray-500" disabled>
                <p class="text-xs text-gray-400 mt-1">* O e-mail não pode ser alterado por segurança.</p>
            </div>
            <button id="save-client-settings" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all mt-4">
                Atualizar Dados
            </button>
            <div class="mt-8 pt-4 border-t border-gray-100 text-center">
                <p class="text-xs text-gray-400 mb-2">Deseja encerrar sua conta permanentemente?</p>
                <button id="delete-client-account-btn" class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                    Excluir minha conta
                </button>
            </div>
        </div>`,
        'max-w-md'
    );

    // Aplica a máscara de telefone que criamos ontem
    document.getElementById('edit-client-phone').addEventListener('input', (e) => {
        e.target.value = formatPhoneInput(e.target.value);
    });
}

function renderScheduleTab() {

    socket.off('servicos_atualizados');
    socket.on('servicos_atualizados', async () => {
        await fetchServices(activeBarber.id);
        renderScheduleTab();
        console.log("Entrou aqui !!!");
    });

    const cards = barberData.services.map(s => `
        <div class="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img src="${s.image_url}" alt="${s.name}" class="w-full h-32 md:h-48 object-cover"
                 onerror="this.src='https://placehold.co/300x300/cccccc/ffffff?text=Img'">
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="font-bold text-md md:text-lg mb-1">${s.name}</h3>
                <p class="text-gray-500 text-sm mb-2">${formatCurrency(parseFloat(s.price))} · ${s.duration} min</p>
                <div class="mt-auto">
                    <button data-id="${s.id}" class="schedule-service-btn w-full text-white font-semibold py-2 rounded-lg hover:opacity-90 bg-blue-600">
                        Agendar
                    </button>
                </div>
            </div>
        </div>`).join('');

    document.getElementById('schedule-content').innerHTML = `
        <h2 class="text-2xl md:text-3xl font-bold mb-6 text-center">Nossos Serviços</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">${cards}</div>`;
}

function renderMyAppointmentsTab() {
    
    socket.off('agendamentos_atualizados');
    socket.on('agendamentos_atualizados', async () => {
        await fetchAppointments(activeBarber.id);
        renderMyAppointmentsTab();
    });

    // Filtra por ID do cliente E garante que o status não seja Concluído
    const myAppointments = barberData.appointments.filter(a => 
        a.client_id === activeClient?.id && a.status !== 'Concluido'
    );

    if (myAppointments.length === 0) {
        document.getElementById('my-appointments-content').innerHTML = `
            <h2 class="text-2xl font-bold mb-4">Meus Agendamentos</h2>
            <p class="text-center text-gray-500 italic" >Você ainda não possui horários marcados.</p>`;
        return;
    }

    const cards = myAppointments.map(a => {
        const service = barberData.services.find(s => s.id === a.service_id);
        const serviceName = service?.name ?? 'Serviço removido';

        return `
            <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-lg text-gray-800">${serviceName}</p>
                    <p class="text-sm text-gray-600 flex items-center mt-1">
                        <i class="fas fa-calendar-alt mr-2 text-blue-500"></i>
                        ${formatDate(a.date)} às <span class="font-semibold ml-1">${a.time}</span>
                    </p>
                </div>
                </div>

            <div class="flex items-center gap-3">
                <button data-id="${a.id}" 
                    class="edit-appointment-btn flex-1 text-sm md:text-base font-bold text-white px-4 py-3 rounded-lg hover:opacity-90 bg-blue-600 transition-all shadow-sm">
                    Alterar Horário
                </button>
                
                <button data-id="${a.id}" 
                    class="cancel-appointment-btn flex-1 text-sm md:text-base font-bold bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all shadow-sm">
                    Cancelar
                </button>
            </div>
        </div>`;
    }).join('');

    document.getElementById('my-appointments-content').innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Meus Agendamentos</h2>
        <div class="space-y-4">${cards}</div>`;
}

function renderPlansTab() {

    // --- SOCKET NO TOPO (BOA PRÁTICA) ---
    socket.off('planos_atualizados');
    socket.on('planos_atualizados', async () => {
        await fetchPlans(activeBarber.id);
        renderPlansTab();
    });

    const cards = barberData.plans.map(p => `
        <div class="bg-white rounded-lg shadow-sm p-6 flex flex-col text-center">
            <h3 class="text-xl font-bold text-slate-800 mb-2">${p.name}</h3>
            <p class="text-gray-600 mb-4 flex-grow">${p.description}</p>
            <p class="text-3xl font-bold mb-4">
                ${formatCurrency(parseFloat(p.price))}<span class="text-lg font-normal">/mês</span>
            </p>
            <button class="w-full text-white font-semibold py-2 rounded-lg hover:opacity-90 bg-blue-600">
                Assinar Plano
            </button>
        </div>`).join('');

    document.getElementById('plans-content').innerHTML = `
        <h2 class="text-2xl md:text-3xl font-bold mb-6 text-center">Conheça Nossos Planos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">${cards}</div>`;
}

// ----------------------------------------
// MODAL DE AGENDAMENTO
// ----------------------------------------

export async function showSchedulingModal(service, appointmentToEdit = null) {

    // Atualiza modal se as configurações mudarem enquanto está aberto
    socket.off('config_atualizada');
    socket.on('config_atualizada', async () => {
        await fetchSettings(activeBarber.id);
    });

    const isEditing = !!appointmentToEdit;
    const timeSlots = [...barberData.availableTimeSlots].sort();

    openModal(
        isEditing ? 'Alterar Horário' : `Agendar ${service.name}`,
        `<form id="appointment-form"
              data-service-id="${service.id}"
              ${isEditing ? `data-edit-id="${appointmentToEdit.id}"` : ''}
              class="space-y-4">
            <p>Agendando: <strong class="text-blue-600">${service.name}</strong></p>
            <div>
                <label class="block text-sm font-medium mb-1">Data</label>
                <input type="date" name="date"
                       value="${isEditing ? appointmentToEdit.date : ''}"
                       class="w-full border-gray-300 rounded-md p-2" required>
            </div>
            <div>
                <label class="block text-sm font-medium mb-2">Horário</label>
                <div id="time-slots-container" class="grid grid-cols-4 gap-2"></div>
                <input type="hidden" name="time" id="selected-time"
                       value="${isEditing ? appointmentToEdit.time : ''}" required>
            </div>
            <button type="submit" class="w-full text-white py-2 rounded-lg font-bold hover:opacity-90 bg-blue-600">
                ${isEditing ? 'Salvar Alterações' : 'Confirmar Agendamento'}
            </button>
        </form>`,
        'max-w-lg'
    );

    const dateInput = modal.querySelector('input[type="date"]');
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);

    const loadTimeSlots = async (selectedDate) => {
        const slotsContainer = modal.querySelector('#time-slots-container');
        slotsContainer.innerHTML = '<p class="col-span-4 text-center text-sm text-gray-400">Verificando horários...</p>';

        try {
            const res = await fetch(`${API_URL}/appointments/occupied/${activeBarber.id}/${selectedDate}`);
            const occupied = await res.json();

            slotsContainer.innerHTML = timeSlots.map(slot => {
                const clean = slot.trim().substring(0, 5);
                const isOccupied = occupied.includes(clean);
                const isSelected = isEditing
                    && appointmentToEdit.date === selectedDate
                    && appointmentToEdit.time.includes(clean);

                return `<div class="time-slot ${isOccupied ? 'disabled' : ''} ${isSelected ? 'selected' : ''}"
                              data-time="${clean}">${clean}</div>`;
            }).join('');

            // Selecionar horário ao clicar
            slotsContainer.querySelectorAll('.time-slot:not(.disabled)').forEach(el => {
                el.addEventListener('click', () => {
                    slotsContainer.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    el.classList.add('selected');
                    modal.querySelector('#selected-time').value = el.dataset.time;
                });
            });

        } catch {
            slotsContainer.innerHTML = '<p class="col-span-4 text-center text-sm text-red-500">Erro ao carregar horários. Tente novamente.</p>';
        }
    };

    dateInput.addEventListener('change', (e) => {
        modal.querySelector('#selected-time').value = '';
        loadTimeSlots(e.target.value);
    });

    if (isEditing && appointmentToEdit.date) {
        loadTimeSlots(appointmentToEdit.date);
    }
}
