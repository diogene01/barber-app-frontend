export const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

export const formatTime = (date) =>
    new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function formatPhoneInput(value) {
    let v = value.replace(/\D/g, '').substring(0, 11);
    
    if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d*)$/, '($1) $2');
    } else if (v.length > 0) {
        v = v.replace(/^(\d*)$/, '($1');
    }
    
    return v;
}

export function setupPasswordValidation(inputElement) {
    if (!inputElement) return;

    inputElement.addEventListener('input', () => {
        const password = inputElement.value;
        let errorMessages = [];

        // 1. Check length (must be greater than 7, so minimum 8)
        if (password.length < 8) {
            errorMessages.push("mais que 7 caracteres");
        }
        // 2. Check for numbers
        if (!/[0-9]/.test(password)) {
            errorMessages.push("um número");
        }
        // 3. Check for special characters
        if (!/[^A-Za-z0-9]/.test(password)) {
            errorMessages.push("um caractere especial (ex: @, #, $)");
        }
        // 4. Check for uppercase letters
        if (!/[A-Z]/.test(password)) {
            errorMessages.push("uma letra maiúscula");
        }

        // If there are errors, build the professional dynamic message
        if (errorMessages.length > 0) {
            const formattedMessage = "A senha deve conter: " + errorMessages.join(", ").replace(/,([^,]*)$/, ' e$1') + ".";
            inputElement.setCustomValidity(formattedMessage);
        } else {
            // Clear validity to allow form submission
            inputElement.setCustomValidity("");
        }
    });
}