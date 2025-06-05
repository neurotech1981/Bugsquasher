import socketService from '../services/socketService'

// This file is now deprecated in favor of the SocketProvider component
// Import { useSocket } from '../components/SocketProvider' where needed

// These functions are kept for backward compatibility
export const initializeSocket = (token = null) => {
    console.warn('socketInitializer.initializeSocket is deprecated. Use SocketProvider component instead.')
    return socketService.connect(token)
}

export const authenticateSocket = (token, userId) => {
    console.warn('socketInitializer.authenticateSocket is deprecated. Use SocketProvider component instead.')
    const socket = socketService.getSocket()

    if (socket && socket.connected) {
        socket.auth = { token, userId }
        socket.emit('user_connect', userId)
    }

    return socket
}

export const deauthenticateSocket = () => {
    console.warn('socketInitializer.deauthenticateSocket is deprecated. Use SocketProvider component instead.')
    const socket = socketService.getSocket()

    if (socket) {
        socket.auth = {}
    }
}

export default socketService
