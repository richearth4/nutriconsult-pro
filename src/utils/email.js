let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (e) {
    console.warn('⚠️ Nodemailer not found. Falling back to Mock Email Service.');
}

/**
 * Real/Mock Email Service
 * Handles production delivery via SMTP with fallback to console logging.
 */
const emailService = {
    /**
     * Send an email notification
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} body - Email body (HTML or Text)
     */
    async sendEmail(to, subject, body) {
        // Use Nodemailer if available and configured
        if (nodemailer && process.env.EMAIL_HOST && process.env.EMAIL_USER) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"Nutrilas" <noreply@nutrilas.com>',
                    to: to,
                    subject: subject,
                    text: body,
                    html: body.replace(/\n/g, '<br>')
                });

                console.log(`✅ Email sent via SMTP: ${info.messageId}`);
                return { success: true, messageId: info.messageId };
            } catch (error) {
                console.error('❌ SMTP Delivery Failed:', error.message);
                // Fallback to mock on error in dev/test
            }
        }

        // Mock Fallback
        console.log('--- 📧 MOCK EMAIL SENT ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body.substring(0, 100)}...`);
        console.log('---------------------------');
        return { success: true, messageId: 'mock-' + Math.random().toString(36).substring(7) };
    },

    async sendIntakeNotification(user) {
        return this.sendEmail(
            user.email,
            'Health Intake Completed - Nutrilas',
            `Hello ${user.name},\n\nThank you for completing your health intake. Your nutritionist will review your data and prepare your personalized plan shortly.`
        );
    },

    async sendPlanAssignedNotification(user, planName) {
        return this.sendEmail(
            user.email,
            'New Nutrition Plan Assigned!',
            `Hello ${user.name},\n\nA new nutrition plan (${planName}) has been assigned to your profile. Check your dashboard to view the details.`
        );
    },

    async sendWelcomeEmail(user) {
        return this.sendEmail(
            user.email,
            'Welcome to Nutrilas!',
            `Hello ${user.name},\n\nWelcome to Nutrilas! We're excited to help you achieve your nutrition goals.\n\nPlease complete your intake profile to get started.`
        );
    }
};

module.exports = emailService;
