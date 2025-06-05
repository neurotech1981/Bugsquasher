import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:4000'

/**
 * THIS SERVICE IS DEPRECATED.
 * Please use the SocketProvider component and useSocket hook instead.
 *
 * import { useSocket } from '../components/SocketProvider'
 *
 * Example usage:
 * const { socket, isConnected, emit, on } = useSocket()
 */

class SocketService {
    constructor() {
        this.socket = null
        console.warn('SocketService is deprecated. Please use SocketProvider component and useSocket hook instead.')
    }

    // This method should not be called directly - use SocketProvider instead
    connect(token = null) {
        console.warn('SocketService.connect is deprecated - use SocketProvider component instead')

        if (this.socket) {
            console.warn('Socket already exists - reusing existing connection')
            return this.socket
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            auth: token ? { token } : undefined,
            reconnection: false,
            autoConnect: false,
        })

        return this.socket
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    getSocket() {
        return this.socket
    }

    isConnected() {
        return this.socket?.connected || false
    }

    // Simple method to check if the socket is authenticated
    isAuthenticated() {
        return this.socket?.auth?.token != null
    }

    // Event listener registration helper
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback)
            return true
        }
        return false
    }

    // Event emission helper
    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data)
            return true
        }
        console.warn('Cannot emit event: socket not connected')
        return false
    }
}

// Create a singleton instance - but this should not be used directly
const socketServiceInstance = new SocketService()

export default socketServiceInstance
