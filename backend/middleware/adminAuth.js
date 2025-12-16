import jwt from 'jsonwebtoken'

/**
 * Middleware: Admin Authentication
 * - Checks for JWT token in headers
 * - Verifies token and ensures it matches ADMIN_EMAIL + ADMIN_PASSWORD combination
 * - Used to protect admin-only routes
 */
const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers

        // Missing token
        if (!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        // Verify token signature
        const token_decode = jwt.verify(token, process.env.JWT_SECRET)

        // Validate payload matches admin credentials (simple but effective for small apps)
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({ success: false, message: "Not Authorized Login Again" })
        }

        // All good — proceed to route handler
        next()
    } catch (error) {
        // Invalid or expired token
        res.json({ success: false, message: error.message })
    }
}

export default adminAuth