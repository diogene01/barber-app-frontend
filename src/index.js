// index.js — Ponto de entrada da aplicação
// Responsável apenas por inicializar os event listeners.
// Toda lógica de negócio fica nos módulos correspondentes.

import { handleLogin, handleBarberCode, handleRegister, handleLogout } from './api/auth.js';
import { handleDelete, handleCancelAppointment, handleDeleteBarberAccount, handleSaveBarberSettings, handleDeleteClientAccount, handleSaveClientSettings, handleFormSubmit, handleUpdateStatus } from './api/actions.js';
import { barberData } from './api/barberData.js';
import { navigateTo, renderPage } from './components/router.js';
import { initModal, showConfirmModal, modal } from './components/modal.js';
import { renderCustomerTab, showSchedulingModal, showClientSettingsModal } from './pages/customer.js';
import { showServiceForm } from './pages/services.js';
import { showPlanForm } from './pages/plans.js';
import { showExpenseForm } from './pages/expenses.js';
import { formatPhoneInput, setupPasswordValidation } from './utils/formatting.js';

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }

    // Abre/Fecha ao clicar nos botões
    openBtn?.addEventListener('click', toggleMenu);
    closeBtn?.addEventListener('click', toggleMenu);
    overlay?.addEventListener('click', toggleMenu);

    // Fecha o menu automaticamente ao clicar em uma opção (importante no mobile)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // md: 768px no Tailwind
                toggleMenu();
            }
        });
    });


    // ----------------------------------------
    // FORMULÁRIOS DE AUTENTICAÇÃO
    // ----------------------------------------

    document.getElementById('admin-login-form').addEventListener('submit', (e) => handleLogin(e, 'barber'));
    document.getElementById('client-login-form').addEventListener('submit', (e) => handleLogin(e, 'client'));
    document.getElementById('barber-code-form').addEventListener('submit', handleBarberCode);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Alternar entre tela de login e cadastro
    document.getElementById('show-register-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').classList.add('hidden');
        document.getElementById('register-form-container').classList.remove('hidden');
    });
    document.getElementById('show-login-link').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form-container').classList.add('hidden');
        document.getElementById('login-form-container').classList.remove('hidden');
    });

    document.addEventListener('input', (e) => {
        // Verifica se o ID do elemento que disparou o evento é um dos campos de telefone
        if (e.target.id === 'register-phone' || e.target.id === 'barber-phone') {
        e.target.value = formatPhoneInput(e.target.value);
        }
    });

    setupPasswordValidation(document.getElementById('register-password'));

    // ----------------------------------------
    // MODAL
    // ----------------------------------------

    initModal();

    // ----------------------------------------
    // CLIQUES GLOBAIS — delegação de eventos
    // ----------------------------------------

    document.body.addEventListener('click', (e) => {
        const target = e.target;

        // Toggle de senha visível/oculta
        const toggleIcon = target.closest('[data-toggle-password]');
        if (toggleIcon) {
            const input = document.getElementById(toggleIcon.dataset.togglePassword);
            if (input) {
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                toggleIcon.classList.toggle('fa-eye-slash', !show);
                toggleIcon.classList.toggle('fa-eye', show);
            }
            return;
        }

        // Logout
        if (target.closest('.logout-btn')) 
        {  
            showConfirmModal('Deseja encerrar sua sessão?', () => handleLogout()); return;
        }

        // Navegação lateral (painel do barbeiro)
        const navLink = target.closest('#sidebar-nav .nav-link');
        if (navLink) { e.preventDefault(); navigateTo(navLink.dataset.target); return; }

        // Abas do cliente
        const customerTab = target.closest('#customer-tabs a');
        if (customerTab) {
            e.preventDefault();
            document.querySelectorAll('#customer-tabs a').forEach(a => {
                a.classList.remove('border-blue-500', 'text-blue-600');
                a.classList.add('border-transparent', 'text-gray-500');
            });
            customerTab.classList.add('border-blue-500', 'text-blue-600');
            customerTab.classList.remove('border-transparent', 'text-gray-500');
            renderCustomerTab(customerTab.dataset.tab);
            return;
        }
    });

    // ----------------------------------------
    // CLIQUES EM BOTÕES — CRUD e ações
    // ----------------------------------------

    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        const dropdown = document.getElementById('customer-dropdown');

            // --- LÓGICA DO MENU DA ENGRENAGEM (CLIENTE) ---
            // Se clicar no botão da engrenagem, alterna o menu e para a execução
            if (btn && btn.id === 'customer-menu-btn') {
                dropdown?.classList.toggle('hidden');
                return;
            }

            // Se o menu estiver aberto e clicar em qualquer outra coisa, fecha o menu
            if (dropdown && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
                // Não damos 'return' aqui para permitir que o clique execute a ação do botão (ex: Sair)
            }

        if (!btn) return;
        const id = btn.dataset.id ? parseInt(btn.dataset.id) : null;

        // Adicionar
        if (btn.id === 'add-service-btn') { showServiceForm(); return; }
        if (btn.id === 'add-plan-btn')    { showPlanForm(); return; }
        if (btn.id === 'add-expense-btn') { showExpenseForm(); return; }

        // Editar
        if (btn.classList.contains('edit-service-btn')) {
            showServiceForm(barberData.services.find(s => s.id === id)); return;
        }
        if (btn.classList.contains('edit-plan-btn')) {
            showPlanForm(barberData.plans.find(p => p.id === id)); return;
        }
        if (btn.classList.contains('edit-expense-btn')) {
            showExpenseForm(barberData.expenses.find(ex => ex.id === id)); return;
        }


        // Deletar (painel do barbeiro)
        if (btn.classList.contains('delete-service-btn')) {
            showConfirmModal('Excluir este serviço?', () => handleDelete(e, 'services')); return;
        }
        if (btn.classList.contains('delete-plan-btn')) {
            showConfirmModal('Excluir este plano?', () => handleDelete(e, 'plans')); return;
        }
        if (btn.classList.contains('delete-expense-btn')) {
            showConfirmModal('Excluir esta despesa?', () => handleDelete(e, 'expenses')); return;
        }
        if (btn.classList.contains('delete-appointment-btn')) {
            showConfirmModal('Excluir este agendamento?', () => handleDelete(e, 'appointments')); return;
        }

        if (btn.classList.contains('complete-appointment-btn')) {
            showConfirmModal('Esse agendamento foi concluido?', () => handleUpdateStatus(id, 'Concluido')); return;
        }

        if (btn.classList.contains('schedule-service-btn')) {
            showSchedulingModal(barberData.services.find(s => s.id === id)); return;
        }

        if (btn.id === 'open-client-settings') {
            showClientSettingsModal();
            return;
        }

        if (btn.id === 'save-client-settings') {
            handleSaveClientSettings();
            return;
}

        if (btn.classList.contains('edit-appointment-btn')) {
            const appt = barberData.appointments.find(a => a.id === id);
            const svc  = barberData.services.find(s => s.id === appt?.service_id);
            if (appt && svc) showSchedulingModal(svc, appt);
            return;
        }

        if (btn.classList.contains('cancel-appointment-btn')) {
            showConfirmModal('Cancelar este agendamento?', () => handleCancelAppointment(id)); return;
        }

        // Horários de atendimento (configurações)
        if (btn.id === 'add-time-slot-btn') {
            const input = document.getElementById('new-time-slot');
            const time = input.value;
            if (!time) return;
            if (!barberData.availableTimeSlots.includes(time)) {
                barberData.availableTimeSlots.push(time);
                renderPage('page-settings');
            }
            return;
        }
        if (btn.classList.contains('delete-time-slot-btn')) {
            barberData.availableTimeSlots = barberData.availableTimeSlots.filter(s => s !== btn.dataset.time);
            renderPage('page-settings');
            return;
        }

        // Salvar configurações
        if (btn.id === 'save-settings-btn') {
            showConfirmModal('Salvar as alterações de perfil e horários?', handleSaveBarberSettings); return;
        }

        // Excluir conta
        if (btn.id === 'delete-account-btn') {
            showConfirmModal(
                'EXCLUIR sua conta permanentemente? Esta ação não pode ser desfeita.',
                handleDeleteBarberAccount
            );
            return;
        }

        // Excluir conta
        if (btn.id === 'delete-client-account-btn') {
            showConfirmModal(
                'EXCLUIR sua conta permanentemente? Esta ação não pode ser desfeita.',
                handleDeleteClientAccount
            );
            return;
        }
    });
});
