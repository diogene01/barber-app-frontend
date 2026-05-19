// Aplica o logo e imagem de fundo do barbeiro ativo na interface
export function applyVisualChanges(barber) {
    if (!barber) return;

    const logo = barber.logo_url || 'https://placehold.co/100x100/334155/FFFFFF?text=Logo';
    const bg = barber.background_image_url || 'https://images.unsplash.com/photo-1622288432458-2d7c3a6e3e0d?q=80&w=1932';

    document.querySelectorAll('.app-logo').forEach(el => el.src = logo);

    const customerView = document.getElementById('customer-view');
    if (customerView) customerView.style.backgroundImage = `url(${bg})`;
}
