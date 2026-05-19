import { barberData, fetchSettings } from '../api/barberData.js';
import { activeBarber } from '../api/auth.js';
import { socket } from '../components/socket.js';

export function renderSettingsPage(container) {

    const slots = [...barberData.availableTimeSlots].sort();

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">Configurações da Barbearia</h2>
            
            <div class="space-y-6">
                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-700">Identidade da Barbearia</h3>
                    
                    <div class="mb-6">
                        <label for="barber-name" class="block text-sm font-medium text-gray-600 mb-1">Nome da Barbearia / Barbeiro</label>
                        <input type="text" id="barber-name" value="${activeBarber.name}"
                            class="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-slate-500 transition-all">
                    </div>

                    <div class="mb-6">
                        <label for="barber-phone" class="block text-sm font-medium text-gray-600 mb-1">Telefone/WhatsApp</label>
                        <input type="text" id="barber-phone" value="${activeBarber.phone}"
                            class="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-slate-500 transition-all">
                    </div>

                    <div class="mb-6">
                        <label for="edit-barber-email" class="block text-sm font-medium text-gray-600 mb-1">E-mail (Login)</label>
                        <input type="email" id="edit-barber-email" value="${activeBarber.email}" 
                                class="w-full border border-gray-200 rounded-md p-2 mt-1 bg-gray-50 text-gray-500" disabled>
                        <p class="text-xs text-gray-400 mt-1">* O e-mail não pode ser alterado por segurança.</p>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-600 mb-1">Código da Barbearia (ID)</label>
                        <input type="text" value="${activeBarber.code}" 
                                class="w-full border border-gray-200 rounded-md p-2 mt-1 bg-gray-50 text-gray-500 font-mono" disabled>
                        <p class="text-xs text-gray-400 mt-1">* Este código identifica sua barbearia para suporte e integrações.</p>
                    </div>

                    <div class="flex items-center gap-6">
                        <img src="${activeBarber.logo_url}" class="app-logo w-24 h-24 rounded-full object-cover bg-gray-100 border-2 border-gray-200 shadow-sm">
                        <div class="w-full">
                            <label for="logo-url" class="block text-sm font-medium text-gray-600 mb-1">URL do Logo</label>
                            <input type="text" id="logo-url" value="${activeBarber.logo_url}"
                                class="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-slate-500 transition-all">
                        </div>
                    </div>
                </div>
                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold mb-3 text-gray-700">Plano de Fundo (Área do Cliente)</h3>
                    <label for="background-url" class="block text-sm font-medium text-gray-600 mb-1">URL da Imagem</label>
                    <input type="text" id="background-url" value="${activeBarber.background_image_url}"
                           class="w-full border border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-slate-500 transition-all">
                </div>

                <div class="border-t pt-6">
                    <h3 class="text-lg font-semibold mb-2 text-gray-700">Horários de Atendimento</h3>
                    <p class="text-sm text-gray-500 mb-4">Adicione ou remova os horários disponíveis.</p>
                    
                    <div class="flex flex-row gap-2 mb-4">
                        <input type="time" id="new-time-slot" 
                               class="block w-full border border-gray-300 rounded-md p-2 outline-none">
                        <button type="button" id="add-time-slot-btn"
                                class="text-white px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-800 transition-colors whitespace-nowrap">
                            Adicionar
                        </button>
                    </div>

                    <div id="time-slots-list" class="flex flex-wrap gap-2">
                        ${slots.map(slot => `
                            <div class="bg-gray-200 text-gray-800 text-base font-medium px-3 py-1 rounded-full flex items-center">
                                <span>${slot}</span>
                                <button type="button" class="delete-time-slot-btn ml-2 text-red-500 hover:text-red-700 text-2xl leading-none"
                                        data-time="${slot}">&times;</button>
                            </div>`).join('')}
                    </div>
                </div>

                <div class="border-t pt-10 mt-6 flex flex-col space-y-8">
                    
                    <div class="flex justify-center">
                        <button type="button" id="save-settings-btn"
                                class="w-full md:w-auto bg-slate-700 text-white px-5 py-3 rounded-lg font-bold hover:bg-slate-800 transition-all shadow-md">
                            Salvar Alterações
                        </button>
                    </div>

                    <div class="mt-8 pt-4 border-t border-gray-100 text-center">
                        <p class="text-xs text-gray-400 mb-2">Deseja encerrar sua conta permanentemente?</p>
                        <button id="delete-account-btn" class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                            Excluir minha conta
                        </button>
                    </div>
                </div>

            </div>
        </div>`;
}