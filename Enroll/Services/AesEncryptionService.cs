using System.Security.Cryptography;
using System.Text;
using Enroll.Interfaces;

namespace Enroll.Services
{
    public class AesEncryptionService : IEncryptionService
    {
        private readonly byte[] _key;
        private const int IvSize = 12; // 96 бит
        private const int TagSize = 16; // 128 бит

        public AesEncryptionService(string encryptionKey)
        {
            _key = Encoding.UTF8.GetBytes(encryptionKey);
            if (_key.Length != 32)
                throw new ArgumentException("Ключ шифрования должен быть 32 байта в кодировке UTF-8.", nameof(encryptionKey));
        }

        public byte[] Encrypt(byte[] data, out byte[] iv)
        {
            iv = RandomNumberGenerator.GetBytes(IvSize);
            var cipherText = new byte[data.Length];
            var tag = new byte[TagSize];

            using var aesGcm = new AesGcm(_key, TagSize);
            aesGcm.Encrypt(iv, data, cipherText, tag);

            // Возвращаем объединённые данные: IV + cipherText + tag
            return iv.Concat(cipherText).Concat(tag).ToArray();
        }

        public byte[] Decrypt(byte[] encryptedData, byte[]? unusedIv = null)
        {
            if (encryptedData.Length < IvSize + TagSize)
                throw new ArgumentException("Защифрованный ключ короткий.", nameof(encryptedData));

            var iv = encryptedData[..IvSize];
            var tag = encryptedData[^TagSize..];
            var cipherText = encryptedData[IvSize..^TagSize];

            var plainText = new byte[cipherText.Length];

            using var aesGcm = new AesGcm(_key, TagSize);
            aesGcm.Decrypt(iv, cipherText, tag, plainText);

            return plainText;
        }
    }
}
