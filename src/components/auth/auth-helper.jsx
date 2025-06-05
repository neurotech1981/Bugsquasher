import ApiAuth from '../utils/ApiAuth'

const auth = {
    isAuthenticated() {
        if (typeof window === 'undefined') return false

        const jwt = localStorage.getItem('jwt')
        if (!jwt) return false

        try {
            const parsed = JSON.parse(jwt)
            if (!parsed || !parsed.token || !parsed.user) {
                console.error('Invalid token structure')
                this.signout(() => {})
                return false
            }

            // Check if token is expired (decode JWT to check exp claim)
            try {
                const tokenParts = parsed.token.split('.')
                if (tokenParts.length === 3) {
                    const payload = JSON.parse(atob(tokenParts[1]))
                    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                        console.error('Token is expired')
                        this.signout(() => {})
                        return false
                    }
                }
            } catch (tokenErr) {
                console.error('Error checking token expiration:', tokenErr)
                this.signout(() => {})
                return false
            }

            return parsed
        } catch (err) {
            console.error('Error handling JWT:', err)
            this.signout(() => {})
            return false
        }
    },
    authenticate(jwt, cb) {
        if (typeof window !== 'undefined') {
            // Store both token and user data
            localStorage.setItem('jwt', JSON.stringify(jwt))
        }
        cb()
    },
    signout(cb) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt')
        }
        cb()
        // optional
        ApiAuth.SignOut().then(() => {
            document.cookie = 't=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        })
    },
}

export default auth
