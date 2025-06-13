using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Enroll.Models
{
  public class TestSession
  {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string TestId { get; set; } = null!;
    public string? UserId { get; set; }

    public DateTime StartTime { get; set; } = DateTime.UtcNow;
    public DateTime? EndTime { get; set; }
    public List<Question> Questions { get; set; } = new List<Question>();
    public List<CandidateAnswer> Answers { get; set; } = new List<CandidateAnswer>();
    public double? Score { get; set; }
    public bool PointsAwarded { get; set; } = false;
    public List<CategoryResult> CategoryResults { get; set; } = new();

  }
}
