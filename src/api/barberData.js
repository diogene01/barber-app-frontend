import { API_URL }  from './config.js';
import { applyVisualChanges } from '../components/visualChanges.js';

// Estado global dos dados do barbeiro ativo.
// Todas as páginas leem daqui após o carregamento.
export const barberData = {
    services: [],
    plans: [],
    appointments: [],
    expenses: [],
    clients: [],
    availableTimeSlots: []
};

// ----------------------------------------
// FUNÇÕES ATÔMICAS — buscam apenas um recurso
// Usadas para atualizar dados pontuais após uma ação (ex: só recarregar serviços)
// ----------------------------------------

export async function fetchServices(barberId) {
    const res = await fetch(`${API_URL}/services/${barberId}`);
    barberData.services = await res.json();
}

export async function fetchPlans(barberId) {
    const res = await fetch(`${API_URL}/plans/${barberId}`);
    barberData.plans = await res.json();
}

export async function fetchAppointments(barberId) {
    const res = await fetch(`${API_URL}/appointments/${barberId}`);
    barberData.appointments = await res.json();
}

export async function fetchExpenses(barberId) {
    const res = await fetch(`${API_URL}/expenses/${barberId}`);
    barberData.expenses = await res.json();
}

export async function fetchClients(barberId) {
    const res = await fetch(`${API_URL}/clients/${barberId}`);
    barberData.clients = await res.json();
}

export async function fetchSettings(barberId) {
    const res = await fetch(`${API_URL}/settings/${barberId}`);
    const data = await res.json();
    if (data?.available_time_slots) {
        barberData.availableTimeSlots = data.available_time_slots.split(',');
    }
}

// ----------------------------------------
// CARGA TOTAL — busca tudo em paralelo
// Usada no login e quando o usuário troca de perfil
// ----------------------------------------

export async function fetchAllBarberData(barber) {
    console.log(`[Dados] Carregando dados para: ${barber.name} (ID: ${barber.id})`);
    const loader = document.getElementById('loadingScreen');

    try {

        await Promise.all([
            fetchServices(barber.id),
            fetchPlans(barber.id),
            fetchAppointments(barber.id),
            fetchExpenses(barber.id),
            fetchClients(barber.id),
            fetchSettings(barber.id)
        ]);
        applyVisualChanges(barber);
        console.log('[Dados] Todos os dados sincronizados.');
    } catch (error) {
        console.error('[Dados] Erro ao carregar dados do barbeiro:', error);
    } finally {
        loader.style.display = 'none';
    }
}
