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
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (loader) loader.style.display = 'flex';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, userType: role })
        });

        const contentType = response.headers.get('content-type');
        let result = {};
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        }

        if (!response.ok) {
            if (loader) loader.style.display = 'none';
            showMessage(result.error || `Erro no servidor: Status ${response.status}`, 'error');
            return;
        }

        connectSocket();

        if (role === 'barber') {
            activeBarber = result.user;

            const adminDisplay = document.getElementById('admin-name-display');
            if (adminDisplay) adminDisplay.textContent = activeBarber.name;

            document.getElementById('login-screen')?.classList.add('hidden');
            document.getElementById('app-wrapper')?.classList.remove('hidden');
            document.getElementById('admin-view')?.classList.remove('hidden');
            document.getElementById('customer-view')?.classList.add('hidden');

            await fetchAllBarberData(activeBarber);
            navigateTo('page-dashboard');

        } else {
            activeClient = result.user;
            if (loader) loader.style.display = 'none';
            document.getElementById('login-screen')?.classList.add('hidden');
            document.getElementById('barber-code-screen')?.classList.remove('hidden');
        }

    } catch (error) {
        console.error('[Auth] Erro no login:', error);
        if (loader) loader.style.display = 'none'; 
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}

// ----------------------------------------
// CÓDIGO DA BARBEARIA (fluxo do cliente)
// ----------------------------------------

export async function handleBarberCode(e) {
    e.preventDefault();
    const code = document.getElementById('barber-code-input').value;
    const barberCodeError = document.getElementById('barber-code-error');
    if (barberCodeError) barberCodeError.classList.add('hidden');

    try {
        if (loader) loader.style.display = 'flex';

        const response = await fetch(`${API_URL}/barbers?code=${code}`);
        
        const contentType = response.headers.get('content-type');
        let result = [];
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        }

        if (!response.ok || !Array.isArray(result) || result.length === 0) {
            const errorMsg = result.error || 'Código inválido.';
            if (barberCodeError) {
                barberCodeError.textContent = errorMsg;
                barberCodeError.classList.remove('hidden');
            } else {
                showMessage(errorMsg, 'error');
            }
            if (loader) loader.style.display = 'none';
            return;
        }

        activeBarber = result[0];
        document.getElementById('barber-code-screen')?.classList.add('hidden');
        document.getElementById('app-wrapper')?.classList.remove('hidden');
        document.getElementById('customer-view')?.classList.remove('hidden');
        document.getElementById('admin-view')?.classList.add('hidden');

        await fetchAllBarberData(activeBarber);
        renderCustomerView();
        if (loader) loader.style.display = 'none';

    } catch (error) {
        console.error('[Auth] Erro ao verificar código:', error);
        if (loader) loader.style.display = 'none';
        if (barberCodeError) {
            barberCodeError.textContent = 'Erro ao conectar com o servidor.';
            barberCodeError.classList.remove('hidden');
        } else {
            showMessage('Erro ao conectar com o servidor.', 'error');
        }
    }

    const codeInput = document.getElementById('barber-code-input');
    if (codeInput) codeInput.value = '';
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
        if (loader) loader.style.display = 'flex';

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, userType })
        });
        
        const contentType = response.headers.get('content-type');
        let result = {};
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        }

        if (loader) loader.style.display = 'none';

        if (response.ok) {
            showMessage(result.message || 'Cadastro realizado com sucesso!', 'success');
            document.getElementById('login-form-container')?.classList.remove('hidden');
            document.getElementById('register-form-container')?.classList.add('hidden');
            document.getElementById('register-form')?.reset();
        } else {
            showMessage(result.error || 'Erro ao realizar cadastro.', 'error');
        }
    } catch (error) {
        console.error('[Auth] Erro no cadastro:', error);
        if (loader) loader.style.display = 'none';
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

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const typeSelect = document.getElementById('login-user-type');

    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (typeSelect) typeSelect.value = '';

    document.getElementById('admin-view')?.classList.add('hidden');
    document.getElementById('customer-view')?.classList.add('hidden');
    document.getElementById('app-wrapper')?.classList.add('hidden');
    document.getElementById('barber-code-screen')?.classList.add('hidden');
    document.getElementById('login-screen')?.classList.remove('hidden');
}

// ----------------------------------------
// ESQUECI MINHA SENHA
// ----------------------------------------

export async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;

    if (loader) loader.style.display = 'flex';

    try {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        // Garante leitura de JSON segura caso a resposta não venha no formato correto
        const contentType = response.headers.get('content-type');
        let result = {};
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        }

        if (loader) loader.style.display = 'none';

        if (response.ok) {
            showMessage('E-mail enviado! Verifique sua caixa de entrada.', 'success');
            
            document.getElementById('forgot-password-container')?.classList.add('hidden');
            document.getElementById('login-form-container')?.classList.remove('hidden');
            document.getElementById('forgot-password-form')?.reset();
        } else {
            showMessage(result.error || 'Não foi possível enviar o e-mail de recuperação.', 'error');
        }

    } catch (error) {
        if (loader) loader.style.display = 'none';
        console.error('[Auth] Erro ao processar esqueci senha:', error);
        showMessage('Erro ao conectar com o servidor.', 'error');
    }
}