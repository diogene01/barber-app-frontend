import { formatDate } from '../utils/formatting.js';
import { activeBarber } from '../api/auth.js';

export function renderSubscriptionPage(container) {
    const { subscription_status: status, subscription_due_date: dueDate } = activeBarber;
    const isActive = status === 'active';

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-6">Minha Assinatura</h2>
            <div class="space-y-4">
                <div class="flex justify-between items-center p-4 border rounded-lg">
                    <span class="font-medium">Status</span>
                    <span class="font-semibold px-3 py-1 rounded-full ${isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                        ${isActive ? 'Ativa' : 'Vencida'}
                    </span>
                </div>
                <div class="flex justify-between items-center p-4 border rounded-lg">
                    <span class="font-medium">Próximo Vencimento</span>
                    <span class="font-semibold">${formatDate(dueDate)}</span>
                </div>
            </div>

            ${isActive
                ? `<div class="mt-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
                       <h3 class="font-bold">Tudo certo!</h3>
                       <p>Sua assinatura está em dia.</p>
                   </div>`
                : `<div class="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                       <h3 class="font-bold">Pagamento pendente</h3>
                       <p>Regularize para continuar usando o sistema.</p>
                   </div>
                   <button id="renew-subscription-btn"
                           class="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                       Pagar com Pix e Reativar
                   </button>`}
        </div>`;
}
