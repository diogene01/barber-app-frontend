import { handleFormSubmit } from '../api/actions.js';

export const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close-btn');

export function openModal(title, bodyHTML, size = 'max-w-md') {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    modal.querySelector('div').className = `bg-white rounded-lg shadow-2xl w-full ${size}`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

export function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modalBody.innerHTML = '';
}

export function initModal() {
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modalBody.addEventListener('submit', handleFormSubmit);
}

// Modal de confirmação para ações destrutivas (deletar, salvar, etc.)
export function showConfirmModal(message, onConfirm) {
    openModal('Confirmação', `
        <p class="text-center mb-6">${message}</p>
        <div class="flex justify-end space-x-4">
            <button id="confirm-cancel-btn" class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Voltar</button>
            <button id="confirm-action-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar</button>
        </div>
    `, 'max-w-sm');

    document.getElementById('confirm-action-btn').onclick = () => { onConfirm(); closeModal(); };
    document.getElementById('confirm-cancel-btn').onclick = closeModal;
}
