namespace Enroll.Interfaces
{
    public interface IEmailService
    {
        Task SendResetPasswordEmailAsync(string toEmail, string resetLink);
        Task SendEmailAsync(string toEmail, string subject, string body);
        
    }
}