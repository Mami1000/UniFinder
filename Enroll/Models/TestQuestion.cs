using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Enroll.Models{
public class TestQuestion
    {
        // Идентификатор категории (ссылка на Category.Id)
        [BsonRepresentation(BsonType.ObjectId)]
        public string CategoryId { get; set; } = null!;

        // Количество вопросов из этой категории, которые должны быть включены в тест
        public int Quantity { get; set; }
    }

}
