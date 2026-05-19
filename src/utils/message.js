export function showMessage(text, type = 'success') {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');    

    messageText.textContent = text;

    messageBox.className = [
        'fixed top-5 right-5 text-white py-3 px-5 rounded-lg shadow-lg z-50',
        'opacity-0 transition-opacity duration-300',
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    ].join(' ');
    messageBox.classList.remove('hidden', 'opacity-0');

    setTimeout(() => {
        messageBox.classList.add('opacity-0');
        setTimeout(() => messageBox.classList.add('hidden'), 300);
    }, 2000);
}
