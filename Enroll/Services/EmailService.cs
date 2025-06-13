using System.Threading.Tasks;
using Enroll.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;
using System;
using Enroll.DTOs;
using Enroll.Models;

namespace Enroll.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _smtpServer = "smtp.mail.ru"; 
        private readonly int _smtpPort = 587;
        private readonly string _smtpUser = "uni.finder@mail.ru";
        private readonly string _smtpPass = "du7eSbnma5Xns41586A9";
        private readonly string _fromEmail = "uni.finder@mail.ru";
        
        // Универсальный метод отправки писем
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = body
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_smtpUser, _smtpPass);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Ошибка при отправке email: {ex.Message}");
                throw;
            }
        }


        
        
        public async Task SendResetPasswordEmailAsync(string toEmail, string resetLink)
        {
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_fromEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Сброс пароля";

            email.Body = new TextPart(TextFormat.Html)
            {
                Text = $"<p>Для сброса пароля перейдите по <a href='{resetLink}'>этой ссылке</a>.</p>"
            };

            try
            {
                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_smtpUser, _smtpPass);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Ошибка при отправке email: {ex.Message}");
                throw;
            }
        }
    }
}
