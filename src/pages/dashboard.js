import { formatCurrency } from '../utils/formatting.js';
import { barberData } from '../api/barberData.js';

export function renderDashboardPage(container) {
    // 1. OBTENÇÃO DA DATA ATUAL
    // Obtemos o mês e ano do sistema para filtrar os dados dinamicamente.
    const agora = new Date();
    const mesAtual = agora.getMonth(); // Janeiro é 0, Abril é 3.
    const anoAtual = agora.getFullYear();

    // 2. FILTRAGEM DE AGENDAMENTOS (RECEITA)
    // Filtramos apenas os agendamentos 'Concluido' que ocorreram no mês e ano vigentes.
    const completed = barberData.appointments.filter(a => {
        const dataAgendamento = new Date(a.date);
        return a.status === 'Concluido' && 
               dataAgendamento.getMonth() === mesAtual && 
               dataAgendamento.getFullYear() === anoAtual;
    });

    // 3. FILTRAGEM DE DESPESAS
    // Filtramos apenas as despesas registradas dentro do mês e ano atuais.
    const currentExpenses = barberData.expenses.filter(e => {
        const dataDespesa = new Date(e.created_at);
        return dataDespesa.getMonth() === mesAtual && 
               dataDespesa.getFullYear() === anoAtual;
    });

    // 4. CÁLCULO DO FATURAMENTO BRUTO
    // Soma os preços dos serviços prestados na lista filtrada acima.
    const totalRevenue = completed.reduce((sum, a) => {
        const service = barberData.services.find(s => s.id === a.service_id);
        return sum + (service ? parseFloat(service.price) : 0);
    }, 0);

    // 5. CÁLCULO DE DESPESAS TOTAIS
    // Soma os valores das despesas do mês atual.
    const totalExpenses = currentExpenses.reduce((sum, e) => sum + parseFloat(e.value), 0);

    // 6. CÁLCULO DO LUCRO LÍQUIDO
    // Subtrai as despesas da receita bruta, garantindo que o valor não seja inferior a zero.
    let netProfit = totalRevenue - totalExpenses;
    if (netProfit < 0) {
        netProfit = 0;
    }

    // 7. RENDERIZAÇÃO DA INTERFACE
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Faturamento Bruto</h4>
                <p class="text-3xl font-bold text-green-600 mt-1">${formatCurrency(totalRevenue)}</p>
                <p class="text-xs text-gray-400 mt-2">Total acumulado neste mês</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Serviços Prestados</h4>
                <p class="text-3xl font-bold text-blue-500 mt-1">${completed.length}</p>
                <p class="text-xs text-gray-400 mt-2">Atendimentos concluídos</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
                <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Despesas</h4>
                <p class="text-3xl font-bold text-red-500 mt-1">${formatCurrency(totalExpenses)}</p>
                <p class="text-xs text-gray-400 mt-2">Gastos registrados no mês</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500">
                <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Lucro Líquido</h4>
                <p class="text-3xl font-bold text-indigo-600 mt-1">${formatCurrency(netProfit)}</p>
                <p class="text-xs text-gray-400 mt-2">Resultado final do período</p>
            </div>
        </div>
    `;
}