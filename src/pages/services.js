import { formatCurrency } from '../utils/formatting.js';
import { openModal } from '../components/modal.js';
import { barberData, fetchServices } from '../api/barberData.js';
import { activeBarber } from '../api/auth.js';
import { socket } from '../components/socket.js';

export function renderServicesPage(container) {

    // --- SOCKET NO TOPO (BOA PRÁTICA) ---
    socket.off('servicos_atualizados');
    socket.on('servicos_atualizados', async () => {
        await fetchServices(activeBarber.id);
        renderServicesPage(container);
    });

    const rows = barberData.services.map(s => `
        <tr class="border-b hover:bg-gray-50" data-id="${s.id}">
            <td class="p-2">
                <img src="${s.image_url}" alt="${s.name}" class="w-12 h-12 rounded-md object-cover"
                     onerror="this.src='https://placehold.co/100x100/cccccc/ffffff?text=Img'">
            </td>
            <td class="p-3">${s.name}</td>
            <td class="p-3">${formatCurrency(parseFloat(s.price))}</td>
            <td class="p-3">${s.duration} min</td>
            <td class="p-3 text-center">
                <button class="edit-service-btn text-blue-500 hover:text-blue-700 mr-3" data-id="${s.id}">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete-service-btn text-red-500 hover:text-red-700" data-id="${s.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Gestão de Serviços</h2>
                <button id="add-service-btn" class="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center bg-slate-700">
                    <i class="fas fa-plus mr-2"></i> Adicionar Serviço
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b bg-gray-50">
                            <th class="p-3">Foto</th>
                            <th class="p-3">Serviço</th>
                            <th class="p-3">Preço</th>
                            <th class="p-3">Duração</th>
                            <th class="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="5" class="p-4 text-center text-gray-500 italic">Nenhum serviço cadastrado.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
}

export function showServiceForm(service = null) {
    const isEditing = !!service;
    openModal(isEditing ? 'Editar Serviço' : 'Novo Serviço', `
        <form id="service-form" data-id="${isEditing ? service.id : ''}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Nome</label>
                    <input type="text" name="name" value="${isEditing ? service.name : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">URL da Imagem</label>
                    <input type="text" name="image" value="${isEditing ? service.image_url : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium">Preço</label>
                        <input type="number" name="price" step="0.01" value="${isEditing ? service.price : ''}"
                               class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Duração (min)</label>
                        <input type="number" name="duration" value="${isEditing ? service.duration : ''}"
                               class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                    </div>
                </div>
                <button type="submit" class="w-full text-white py-2 rounded-lg font-bold hover:opacity-90 bg-slate-700">
                    ${isEditing ? 'Salvar' : 'Adicionar'}
                </button>
            </div>
        </form>`);
}
