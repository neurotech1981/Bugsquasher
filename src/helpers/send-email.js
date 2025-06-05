/* eslint-disable no-undef */
import nodemailer from 'nodemailer'
import config from '../backend/config/email_config.json' assert { type: 'json' }

const sendEmail = async ({ to, subject, html, from = config.emailFrom }) => {
    const transporter = nodemailer.createTransport(config.smtpOptions)
    await transporter.sendMail({ from, to, subject, html })
}

export default sendEmail
