// File: Interfaces/IEncryptionService.cs
namespace Enroll.Interfaces
{
    public interface IEncryptionService
    {
        byte[] Encrypt(byte[] data, out byte[] iv);
        byte[] Decrypt(byte[] encryptedData, byte[]? iv = null);
    }
}
