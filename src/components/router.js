import { renderDashboardPage } from '../pages/dashboard.js';
import { renderAppointmentsPage, renderClientsPage } from '../pages/appointments.js';
import { renderServicesPage } from '../pages/services.js';
import { renderPlansPage } from '../pages/plans.js';
import { renderExpensesPage } from '../pages/expenses.js';
import { renderSettingsPage } from '../pages/settings.js';
import { renderSubscriptionPage } from '../pages/subscription.js';
import { activeBarber } from '../api/auth.js';
import { applyVisualChanges } from './visualChanges.js';

const sidebarNav = document.getElementById('sidebar-nav');
const contentPages = document.querySelectorAll('.page-content');
const pageTitleEl = document.getElementById('page-title');

// Navega para uma página do painel do barbeiro e a renderiza
export function navigateTo(targetPageId) {
    sidebarNav.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetPageId);
    });

    contentPages.forEach(page => {
        page.classList.toggle('hidden', page.id !== targetPageId);
    });

    const activeLink = sidebarNav.querySelector(`[data-target="${targetPageId}"]`);
    if (activeLink) pageTitleEl.textContent = activeLink.textContent.trim();

    renderPage(targetPageId);
}

// Renderiza o conteúdo da página — pode ser chamado para forçar um refresh
export function renderPage(pageId) {
    const container = document.getElementById(pageId);
    if (!container) return;

    switch (pageId) {
        case 'page-dashboard':    renderDashboardPage(container); break;
        case 'page-appointments': renderAppointmentsPage(container); break;
        case 'page-services':     renderServicesPage(container); break;
        case 'page-plans':        renderPlansPage(container); break;
        case 'page-clients':      renderClientsPage(container); break;
        case 'page-expenses':     renderExpensesPage(container); break;
        case 'page-subscription': renderSubscriptionPage(container); break;
        case 'page-settings':     renderSettingsPage(container); break;
    }

    applyVisualChanges(activeBarber);
}
