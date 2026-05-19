import { formatCurrency } from '../utils/formatting.js';
import { openModal } from '../components/modal.js';
import { barberData } from '../api/barberData.js';

export function renderExpensesPage(container) {
    const rows = barberData.expenses.map(e => `
        <tr class="border-b hover:bg-gray-50" data-id="${e.id}">
            <td class="p-3">${e.description}</td>
            <td class="p-3">${formatCurrency(parseFloat(e.value))}</td>
            <td class="p-3 text-center">
                <button class="edit-expense-btn text-blue-500 hover:text-blue-700 mr-3" data-id="${e.id}">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete-expense-btn text-red-500 hover:text-red-700" data-id="${e.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>`).join('');

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Gestão de Despesas</h2>
                <button id="add-expense-btn" class="text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center bg-slate-700">
                    <i class="fas fa-plus mr-2"></i> Nova Despesa
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b bg-gray-50">
                            <th class="p-3">Descrição</th>
                            <th class="p-3">Valor</th>
                            <th class="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="3" class="p-4 text-center text-gray-500 italic">Nenhuma despesa registrada.</td></tr>'}</tbody>
                </table>
            </div>
        </div>`;
}

export function showExpenseForm(expense = null) {
    const isEditing = !!expense;
    openModal(isEditing ? 'Editar Despesa' : 'Nova Despesa', `
        <form id="expense-form" data-id="${isEditing ? expense.id : ''}">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium">Descrição</label>
                    <input type="text" name="description" value="${isEditing ? expense.description : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                </div>
                <div>
                    <label class="block text-sm font-medium">Valor</label>
                    <input type="number" name="value" step="0.01" value="${isEditing ? expense.value : ''}"
                           class="mt-1 block w-full border-gray-300 rounded-md p-2" required>
                </div>
                <button type="submit" class="w-full text-white py-2 rounded-lg font-bold hover:opacity-90 bg-slate-700">
                    ${isEditing ? 'Salvar' : 'Adicionar'}
                </button>
            </div>
        </form>`);
}
