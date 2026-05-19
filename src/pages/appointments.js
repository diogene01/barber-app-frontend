import { formatDate } from '../utils/formatting.js';
import { barberData, fetchAppointments, fetchClients } from '../api/barberData.js';
import { activeBarber } from '../api/auth.js';
import { socket } from '../components/socket.js';

export function renderAppointmentsPage(container) {
    // 1. MEMÓRIA DE FILTRO: Captura o estado dos inputs antes de qualquer re-renderização
    const currentDay = document.getElementById('filter-day')?.value || '';
    const currentMonth = document.getElementById('filter-month')?.value || '';
    const currentYear = document.getElementById('filter-year')?.value || '';

    // Função centralizada para atualizar a agenda
    const syncAgenda = async () => {
        console.log("Sincronizando agenda em tempo real...");
        await Promise.all([
            fetchAppointments(activeBarber.id),
            fetchClients(activeBarber.id)
        ]);
        renderAppointmentsPage(container);
    };

    socket.off('agendamentos_atualizados').on('agendamentos_atualizados', syncAgenda);
    socket.off('cliente_deletado').on('cliente_deletado', syncAgenda);

    // 2. REFERÊNCIAS DE HOJE
    const agora = new Date();
    const hojeDia = agora.getDate().toString().padStart(2, '0');
    const hojeMes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const hojeAno = agora.getFullYear().toString();

    // 3. FUNÇÃO DE VALIDAÇÃO (Borda Vermelha)
    const validarCampos = (dia, ano) => {
        const inputDia = document.getElementById('filter-day');
        const inputAno = document.getElementById('filter-year');
        let isValid = true;

        if (dia && (parseInt(dia) < 1 || parseInt(dia) > 31)) {
            inputDia.classList.add('border-red-500', 'ring-1', 'ring-red-500');
            isValid = false;
        } else {
            inputDia.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        }

        if (ano && ano.length !== 4) {
            inputAno.classList.add('border-red-500', 'ring-1', 'ring-red-500');
            isValid = false;
        } else {
            inputAno.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        }
        return isValid;
    };

    // 4. LÓGICA DE FILTRAGEM E RENDERIZAÇÃO DA TABELA
    const filtrarERenderizar = () => {
        const selDia = document.getElementById('filter-day').value;
        const selMes = document.getElementById('filter-month').value;
        const selAno = document.getElementById('filter-year').value;

        if (!validarCampos(selDia, selAno)) return;

        const filtro = {
            dia: selDia ? selDia.padStart(2, '0') : '',
            mes: selMes || hojeMes,
            ano: selAno || hojeAno
        };

        const agendamentosFiltrados = barberData.appointments.filter(a => {
            const dataPura = a.date.includes('T') ? a.date.split('T')[0] : a.date;
            const [ano, mes, dia] = dataPura.split('-');
            
            const bateAno = ano === filtro.ano;
            const bateMes = mes === filtro.mes;
            const bateDia = filtro.dia ? dia === filtro.dia : true;

            const naoConcluido = a.status !== 'Concluido';

            return bateAno && bateMes && bateDia && naoConcluido;
        }).sort((a, b) => {
            const dataA = a.date.split('T')[0];
            const dataB = b.date.split('T')[0];
            return new Date(`${dataA}T${a.time}`) - new Date(`${dataB}T${b.time}`);
        });

        const tableBody = document.getElementById('appointments-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = agendamentosFiltrados.map(a => {
            const client  = barberData.clients.find(c => c.id === a.client_id) || { name: 'N/A' };
            const service = barberData.services.find(s => s.id === a.service_id) || { name: 'N/A' };

            return `
                <tr class="border-b hover:bg-gray-50 transition-colors" data-id="${a.id}">
                    <td class="p-3 font-medium text-gray-700">${client.name}</td>
                    <td class="p-3 text-gray-600">${service.name}</td>
                    <td class="p-3 text-gray-600">${formatDate(a.date)}</td>
                    <td class="p-3 text-gray-600">${a.time.substring(0, 5)}</td>
                    <td class="p-3">
                        <div class="flex justify-center gap-2">
                            <button class="complete-appointment-btn bg-green-500 text-white w-8 h-8 rounded shadow hover:bg-green-600 transition-all active:scale-95" 
                                    title="Concluir Atendimento" data-id="${a.id}">
                                <i class="fas fa-check"></i>
                            </button>

                            <button class="delete-appointment-btn bg-red-500 text-white w-8 h-8 rounded shadow hover:bg-red-600 transition-all active:scale-95" 
                                    title="Negar/Excluir" data-id="${a.id}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('') || '<tr><td colspan="5" class="p-8 text-center text-gray-500 italic">Nenhum agendamento encontrado para este período.</td></tr>';
    };

    // 5. ESTRUTURA HTML DA PÁGINA
    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 class="text-2xl font-bold text-gray-800">Agenda de Horários</h2>
                
                <div class="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border">
                    <input type="number" id="filter-day" value="${currentDay}" placeholder="${hojeDia}" min="1" max="31" class="w-16 p-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                    
                    <select id="filter-month" class="p-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                        ${['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => {
                            const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
                            const isSelected = currentMonth ? (m === currentMonth) : (m === hojeMes);
                            return `<option value="${m}" ${isSelected ? 'selected' : ''}>${nomes[parseInt(m)-1]}</option>`;
                        }).join('')}
                    </select>

                    <input type="number" id="filter-year" value="${currentYear || hojeAno}" placeholder="${hojeAno}" class="w-20 p-1 border rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                    
                    <button id="btn-filtrar" class="bg-blue-600 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-blue-700 transition-colors">Filtrar</button>
                    <button id="btn-limpar" class="bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm font-semibold hover:bg-gray-400 transition-colors">Limpar</button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b bg-gray-50">
                            <th class="p-3 text-gray-600 font-bold">Cliente</th>
                            <th class="p-3 text-gray-600 font-bold">Serviço</th>
                            <th class="p-3 text-gray-600 font-bold">Data</th>
                            <th class="p-3 text-gray-600 font-bold">Hora</th>
                            <th class="p-3 text-center text-gray-600 font-bold">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="appointments-table-body"></tbody>
                </table>
            </div>
        </div>`;

    // 6. EVENTOS
    document.getElementById('btn-filtrar').addEventListener('click', filtrarERenderizar);
    
    document.getElementById('btn-limpar').addEventListener('click', () => {
        document.getElementById('filter-day').value = '';
        document.getElementById('filter-month').value = hojeMes;
        document.getElementById('filter-year').value = hojeAno;
        // Reseta bordas de erro
        document.getElementById('filter-day').classList.remove('border-red-500', 'ring-red-500');
        document.getElementById('filter-year').classList.remove('border-red-500', 'ring-red-500');
        filtrarERenderizar();
    });

    // Execução inicial
    filtrarERenderizar();
}

export function renderClientsPage(container) {
    const rows = barberData.clients.map(c => `
        <tr class="border-b hover:bg-gray-50" data-id="${c.id}">
            <td class="p-3">${c.name}</td>
            <td class="p-3">${c.phone}</td>
            <td class="p-3">${c.email}</td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="text-2xl font-bold mb-4">Lista de Clientes</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b bg-gray-50">
                            <th class="p-3">Nome</th>
                            <th class="p-3">Telefone</th>
                            <th class="p-3">Email</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="3" class="p-4 text-center text-gray-500 italic">Nenhum cliente ainda.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
}
