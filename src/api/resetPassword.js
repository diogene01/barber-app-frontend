import { API_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const loader = document.getElementById('loadingScreen');

    // 1. Captura o token direto da URL do navegador (?token=XYZ...)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Se alguém tentar entrar na página sem um token válido, manda de volta pro login
    if (!token) {
        alert('Token de redefinição inválido ou ausente.');
        window.location.href = 'index.html';
        return;
    }

    // 2. Lógica para mostrar/esconder a senha ao clicar no olho
    document.body.addEventListener('click', (e) => {
        const toggleIcon = e.target.closest('[data-toggle-password]');
        if (toggleIcon) {
            const input = document.getElementById(toggleIcon.dataset.togglePassword);
            if (input) {
                const show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                toggleIcon.classList.toggle('fa-eye-slash', !show);
                toggleIcon.classList.toggle('fa-eye', show);
            }
        }
    });

    // 3. Envio do Formulário
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        if (loader) loader.style.display = 'flex';

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            });

            const result = await response.json();
            if (loader) loader.style.display = 'none';

            if (response.ok) {
                alert('Sua senha foi atualizada com sucesso! Faça login com a nova senha.');
                window.location.href = 'index.html'; // Redireciona para o login unificado
            } else {
                alert(result.error || 'Erro ao redefinir a senha.');
            }

        } catch (error) {
            if (loader) loader.style.display = 'none';
            console.error('Erro ao redefinir senha:', error);
            alert('Não foi possível conectar ao servidor.');
        }
    });
});