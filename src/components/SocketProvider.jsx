import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'

// Create socket context
const SocketContext = createContext(null)
const SOCKET_URL = 'http://localhost:4000'

// Custom hook to use socket
export const useSocket = () => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
}

export const SocketProvider = ({ children, token = null }) => {
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const socketInitialized = useRef(false)

    // Initialize socket connection once
    useEffect(() => {
        // Only create the socket once
        if (socketInitialized.current) return

        console.log('SocketProvider: Creating socket ONE TIME ONLY')
        socketInitialized.current = true

        // Create socket instance
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: false,
            autoConnect: true,
            auth: token ? { token } : undefined,
        })

        // Set up event listeners
        newSocket.on('connect', () => {
            console.log('Socket connected')
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })

        setSocket(newSocket)

        // Cleanup on unmount
        return () => {
            console.log('SocketProvider: Cleaning up socket')
            newSocket.disconnect()
        }
    }, []) // Empty dependency array - run only once!

    // Update auth token if it changes
    useEffect(() => {
        if (!socket || !token) return

        console.log('SocketProvider: Updating auth token only')
        socket.auth = { token }
    }, [socket, token])

    // Provide socket context to child components
    const value = {
        socket,
        isConnected,
        emit: (event, data) => {
            if (socket && socket.connected) {
                socket.emit(event, data)
                return true
            }
            return false
        },
        on: (event, callback) => {
            if (socket) {
                socket.on(event, callback)
                return () => socket.off(event, callback)
            }
            return () => {}
        },
    }

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export default SocketProvider
