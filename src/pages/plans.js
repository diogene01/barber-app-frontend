import { formatCurrency } from '../utils/formatting.js';
import { openModal } from '../components/modal.js';
import { barberData } from '../api/barberData.js';

export function renderPlansPage(container) {
    const rows = barberData.plans.map(p => `
        <tr class="border-b hover:bg-gray-50" data-id="${p.id}">
            <td class="p-3">${p.name}</td>
            <td class="p-3">${p.description}</td>
            <td class="p-3">${formatCurrency(parseFloat(p.price))}</td>
            <td class="p-3 text-center">
                <button class="edit-plan-btn text-blue-500 hover:text-blue-700 mr-3" data-id="${p.id}">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete-plan-btn text-red-500 hover:text-red-700" data-id="${p.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Planos Mensais</h2>
                <button id="add-plan-btn" class="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center bg-slate-700">
                    <i class="fas fa-plus mr-2"></i> Novo Plano
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b bg-gray-50">
                            <th class="p-3">Nome</th>
                            <th class="p-3">Descrição</th>
                            <th class="p-3">Preço</th>
                            <th class="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="4" class="p-4 text-center text-gray-500 italic">Nenhum plano cadastrado.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
}

export function showPlanForm(plan = null) {
    const isEditing = !!plan;
    openModal(isEditing ? 'Editar Plano' : 'Novo Plano', `
        <form id="plan-form" data-id="${isEditing ? plan.id : ''}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Nome do Plano</label>
                    <input type="text" name="name" value="${isEditing ? plan.name : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Descrição</label>
                    <textarea name="description" class="mt-1 block w-full border-gray-300 rounded-md p-2">${isEditing ? plan.description : ''}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium">Preço Mensal</label>
                    <input type="number" name="price" step="0.01" value="${isEditing ? plan.price : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                </div>
                <button type="submit" class="w-full text-white py-2 rounded-lg font-bold hover:opacity-90 bg-slate-700">
                    ${isEditing ? 'Salvar' : 'Adicionar'}
                </button>
            </div>
        </form>`);
}
