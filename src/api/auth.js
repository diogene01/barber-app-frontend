import { API_URL } from '../api/config.js';
import { fetchAllBarberData } from '../api/barberData.js';
import { navigateTo } from '../components/router.js';
import { showMessage } from '../utils/message.js';
import { renderCustomerView } from '../pages/customer.js';
import { connectSocket, disconnectSocket } from '../components/socket.js';

// Usuário atualmente logado (barbeiro ou barbearia selecionada pelo cliente)
export let activeBarber = null;

// Cliente logado
export let activeClient = null;


const loader = document.getElementById('loadingScreen');
// ----------------------------------------
// LOGIN
// ----------------------------------------

export async function handleLogin(e, role) {
    e.preventDefault();
    const email = document.getElementById(`${role}-email`).value;
    const password = document.getElementById(`${role}-password`).value;

    loader.style.display = 'flex';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType: role })
        });
        const result = await response.json();

        if (!response.ok) {
            loader.style.display = 'none';
            showMessage(result.error, 'error');
            return;
        }

        connectSocket();

        if (role === 'barber') {
            activeBarber = result.user;

            // if (activeBarber.subscription_status !== 'active') {
            //     loginError.textContent = 'Sua assinatura está vencida. Regularize para acessar.';
            //     loginError.classList.remove('hidden');
            //     return;
            // }

            document.getElementById('admin-name-display').textContent = activeBarber.name;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-wrapper').classList.remove('hidden');
            document.getElementById('admin-view').classList.remove('hidden');
            document.getElementById('customer-view').classList.add('hidden');

            await fetchAllBarberData(activeBarber);
            navigateTo('page-dashboard');

        } else {
            activeClient = result.user;
            loader.style.display = 'none';
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('barber-code-screen').classList.remove('hidden');
        }

    } catch (error) {
        console.error('[Auth] Erro no login:', error);
        loginError.textContent = 'Erro ao conectar com o servidor.';
        loginError.classList.remove('hidden');
    }
}

// ----------------------------------------
// CÓDIGO DA BARBEARIA (fluxo do cliente)
// ----------------------------------------

export async function handleBarberCode(e) {
    e.preventDefault();
    const code = document.getElementById('barber-code-input').value;
    const barberCodeError = document.getElementById('barber-code-error');
    barberCodeError.classList.add('hidden');

    try {
        loader.style.display = 'flex';

        const response = await fetch(`${API_URL}/barbers?code=${code}`);
        const result = await response.json();

        if (!response.ok || result.length === 0) {
            barberCodeError.textContent = result.error || 'Código inválido.';
            barberCodeError.classList.remove('hidden');
            loader.style.display = 'none';
            return;
        }

        activeBarber = result[0];
        document.getElementById('barber-code-screen').classList.add('hidden');
        document.getElementById('app-wrapper').classList.remove('hidden');
        document.getElementById('customer-view').classList.remove('hidden');
        document.getElementById('admin-view').classList.add('hidden');

        await fetchAllBarberData(activeBarber);
        renderCustomerView();
        loader.style.display = 'none';

    } catch (error) {
        console.error('[Auth] Erro ao verificar código:', error);
        barberCodeError.textContent = 'Erro ao conectar com o servidor.';
        barberCodeError.classList.remove('hidden');
    }

    document.getElementById('barber-code-input').value = '';
}

// ----------------------------------------
// CADASTRO
// ----------------------------------------

export async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const userType = document.getElementById('user-type').value;

    if (password !== confirmPassword) {
        showMessage('As senhas não coincidem.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, userType })
        });
        const result = await response.json();

        if (response.ok) {
            showMessage(result.message, 'success');
            document.getElementById('login-form-container').classList.remove('hidden');
            document.getElementById('register-form-container').classList.add('hidden');
            document.getElementById('register-form').reset();
        } else {
            showMessage(result.error, 'error');
        }
    } catch (error) {
        console.error('[Auth] Erro no cadastro:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// ----------------------------------------
// LOGOUT
// ----------------------------------------

export function handleLogout() {
    activeBarber = null;
    activeClient = null;
    disconnectSocket();

    document.querySelectorAll('#admin-login-form input, #client-login-form input').forEach(input => {
        input.value = '';
    });

    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('customer-view').classList.add('hidden');
    document.getElementById('app-wrapper').classList.add('hidden');
    document.getElementById('barber-code-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}
