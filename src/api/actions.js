import { API_URL } from './config.js';
import { fetchAllBarberData, fetchServices, fetchPlans, fetchAppointments, fetchExpenses, barberData } from './barberData.js';
import { activeBarber, activeClient } from './auth.js';
import { closeModal } from '../components/modal.js';
import { renderPage, navigateTo } from '../components/router.js';
import { renderCustomerView } from '../pages/customer.js';
import { showMessage } from '../utils/message.js';

// ----------------------------------------
// SUBMIT DE FORMULÁRIOS (serviços, planos, despesas, agendamentos, configurações)
// ----------------------------------------

export async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.id ? parseInt(form.dataset.id) : null;
    const editId = form.dataset.editId ? parseInt(form.dataset.editId) : null;
    const formData = new FormData(form);

    let endpoint = '';
    let method = '';
    let data = {};

    switch (form.id) {
        case 'service-form':
            data = {
                barber_id: activeBarber.id,
                name: formData.get('name'),
                image_url: formData.get('image'),
                price: parseFloat(formData.get('price')),
                duration_minutes: parseInt(formData.get('duration'))
            };
            endpoint = `/services${id ? `/${id}` : ''}`;
            method = id ? 'PUT' : 'POST';
            break;

        case 'plan-form':
            data = {
                barber_id: activeBarber.id,
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price'))
            };
            endpoint = `/plans${id ? `/${id}` : ''}`;
            method = id ? 'PUT' : 'POST';
            break;

        case 'expense-form':
            data = {
                barber_id: activeBarber.id,
                description: formData.get('description'),
                value: parseFloat(formData.get('value'))
            };
            endpoint = `/expenses${id ? `/${id}` : ''}`;
            method = id ? 'PUT' : 'POST';
            break;

        case 'appointment-form':
            data = {
                barber_id: activeBarber.id,
                client_id: activeClient.id,
                service_id: parseInt(form.dataset.serviceId),
                date: formData.get('date'),
                time: formData.get('time'),
                status: 'Agendado'
            };
            endpoint = `/appointments${editId ? `/${editId}` : ''}`;
            method = editId ? 'PUT' : 'POST';

            if (!data.date || !data.time) {
                showMessage('Por favor, selecione data e horário.', 'error');
                return;
            }
            break;

        default:
            return;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            closeModal();

            // Recarrega apenas o recurso alterado (mais rápido que buscar tudo)
            if (form.id === 'service-form')     await fetchServices(activeBarber.id);
            if (form.id === 'plan-form')        await fetchPlans(activeBarber.id);
            if (form.id === 'expense-form')     await fetchExpenses(activeBarber.id);
            if (form.id === 'appointment-form') await fetchAppointments(activeBarber.id);

            // Re-renderiza a página atual ou a view do cliente
            const activePage = document.querySelector('.nav-link.active')?.dataset.target;
            if (activePage) {
                renderPage(activePage);
            } else {
                renderCustomerView();
            }
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao salvar:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// ----------------------------------------
// DELETAR (serviços, planos, despesas, agendamentos)
// ----------------------------------------

export async function handleDelete(e, type) {
    const row = e.target.closest('tr');
    const id = parseInt(row.dataset.id);

    try {
        const response = await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            await fetchAllBarberData(activeBarber);
            navigateTo(`page-${type}`);
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error(`[Ação] Erro ao deletar ${type}:`, error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// ----------------------------------------
// ATUALIZAR (agendamentos)
// ----------------------------------------

export async function handleUpdateStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/appointments/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`Agendamento ${newStatus}!`, 'success');
            
            // Atualiza a lista local
            await fetchAppointments(activeBarber.id);
            
            // Re-renderiza a página para refletir a mudança (sumir da lista se filtrado)
            const activePage = document.querySelector('.nav-link.active')?.dataset.target;
            if (activePage) renderPage(activePage);
            
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao atualizar status:', error);
        showMessage('Erro ao processar atualização.', 'error');
    }
}

// ----------------------------------------
// CANCELAR AGENDAMENTO (fluxo do cliente)
// ----------------------------------------

export async function handleCancelAppointment(id) {
    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            await fetchAllBarberData(activeBarber);
            renderCustomerView();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao cancelar agendamento:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}


// ----------------------------------------
// EXCLUIR CONTA DO BARBEIRO
// ----------------------------------------

export async function handleDeleteBarberAccount() {
    try {
        const response = await fetch(`${API_URL}/barbers/delete-account/${activeBarber.id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');

            setTimeout(() => {
                localStorage.clear();
                window.location.reload();
            }, 2000);

        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao excluir conta:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// ----------------------------------------
// SALVAR CONFIGURAÇÕES
// ----------------------------------------

export async function handleSaveBarberSettings() {
    // 1. Captura os elementos do DOM
    const nameInput = document.getElementById('barber-name');
    const phoneInput = document.getElementById('barber-phone');
    const logoInput = document.getElementById('logo-url');
    const bgInput = document.getElementById('background-url');
    const logoPreview = document.querySelector('.app-logo'); // A imagem redonda que aparece na tela

    // 2. Validação básica
    if (!nameInput?.value.trim() || 
        !phoneInput?.value.trim() || 
        !logoInput?.value.trim() || 
        !bgInput?.value.trim()) {
        
        return showMessage('Todos os campos precisam estar preenchidos!', 'error');
    }

    // 3. Monta o objeto para o Back-end
    const updatedSettings = {
        newName: nameInput.value.trim(),
        newPhone: phoneInput.value.trim(),
        logo_url: logoInput.value.trim(),
        background_image_url: bgInput.value.trim(),
        available_time_slots: barberData.availableTimeSlots.join(',')
    };

    try {
        const response = await fetch(`${API_URL}/settings/${activeBarber.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedSettings)
        });
        
        const result = await response.json();

        if (response.ok) {
            // --- ATUALIZAÇÃO DOS DADOS EM MEMÓRIA ---
            // Atualizamos o objeto activeBarber para que o restante do app reflita as mudanças
            activeBarber.name = updatedSettings.newName;
            activeBarber.phone = updatedSettings.newPhone;
            activeBarber.logo_url = updatedSettings.logo_url;
            activeBarber.background_image_url = updatedSettings.background_image_url;

            // --- ATUALIZAÇÃO VISUAL IMEDIATA ---
            // Atualiza a imagem do logo que está na tela de configurações
            if (logoPreview) {
                logoPreview.src = updatedSettings.logo_url;
            }

            // Se você tiver um logo no Header/Sidebar, pode atualizar aqui também:
            const headerLogo = document.getElementById('header-logo');
            if (headerLogo) headerLogo.src = updatedSettings.logo_url;

            showMessage(result.message, 'success');

            // 4. Sincroniza o restante dos dados (como os slots de horários)
            await fetchAllBarberData(activeBarber);
            
        } else {
            showMessage(result.error || 'Erro ao salvar alterações.', 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao salvar configurações:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}


export async function handleSaveClientSettings() {
    const newName = document.getElementById('edit-client-name')?.value.trim();
    const newPhone = document.getElementById('edit-client-phone')?.value.trim();

    // Validação simples
    if (!newName || !newPhone) {
        return showMessage('Preencha seu nome e telefone.', 'error');
    }

    try {
        const response = await fetch(`${API_URL}/clients/settings/${activeClient.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, phone: newPhone })
        });

        if (response.ok) {
            showMessage('Perfil atualizado com sucesso!', 'success');
            
            // Atualiza os dados locais para refletir a mudança sem deslogar
            activeClient.name = newName;
            activeClient.phone = newPhone;
            
            closeModal(); // Fecha o modal após salvar
            renderCustomerView(); // Re-renderiza para atualizar o nome no topo, se necessário
        } else {
            showMessage('Erro ao atualizar perfil.', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showMessage('Erro de conexão.', 'error');
    }
}

export async function handleDeleteClientAccount() {
    try {
        const response = await fetch(`${API_URL}/clients/delete-account/${activeClient.id}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            window.location.reload();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Ação] Erro ao excluir conta:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}
