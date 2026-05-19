import { io } from 'https://cdn.socket.io/4.7.4/socket.io.esm.min.js';
import { API_URL } from '../api/config.js';

// Instância única do socket usada por toda a aplicação
export const socket = io(API_URL, { autoConnect: false });

export function connectSocket() {
    socket.connect();
}

export function disconnectSocket() {
    socket.disconnect();
}
