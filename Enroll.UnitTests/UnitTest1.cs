using System.Collections.Generic;
using System.Threading.Tasks;
using Enroll.Controllers;
using Enroll.DTOs;
using Enroll.Models;
using Enroll.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using Moq;
using Xunit;

namespace Enroll.UnitTests
{
    public class TestControllerTests
    {
        private readonly Mock<ITestService> _mockTestService;
        private readonly TestController _controller;

        public TestControllerTests()
        {
            // Создаем мок для ITestService, чтобы изолировать логику контроллера
            _mockTestService = new Mock<ITestService>();
            _controller = new TestController(_mockTestService.Object);
        }

        // 1. SendMessage: успешное выполнение
     [Fact]
public async Task SendMessage_ReturnsOk_WhenEmailSentSuccessfully()
{
    // Arrange
    var emailRequest = new EmailRequest
    {
        ToEmail = "test@example.com",
        Subject = "Test subject",
        Message = "Test message"
    };

    _mockTestService
        .Setup(s => s.SendResultEmailAsync(emailRequest))
        .Returns(Task.CompletedTask);

    // Act
    var result = await _controller.SendMessage(emailRequest);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result);
    var messageProp = okResult.Value.GetType().GetProperty("message")!;
    Assert.NotNull(messageProp);  // Дополнительная проверка для надежности.
    var messageValue = messageProp.GetValue(okResult.Value)?.ToString();
    Assert.Equal("Email sent successfully", messageValue);
}


        // 2. SendMessage: обработка исключения
        [Fact]
        public async Task SendMessage_ReturnsStatus500_WhenExceptionThrown()
        {
            // Arrange
            var emailRequest = new EmailRequest
            {
                ToEmail = "test@example.com",
                Subject = "Test subject",
                Message = "Test message"
            };
            string exceptionMsg = "Ошибка при отправке";
            _mockTestService
                .Setup(s => s.SendResultEmailAsync(emailRequest))
                .ThrowsAsync(new System.Exception(exceptionMsg));
            
            // Act
            var result = await _controller.SendMessage(emailRequest);

            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(500, objResult.StatusCode);
            var messageProp = objResult.Value.GetType().GetProperty("message");
            Assert.NotNull(messageProp);
            var messageValue = messageProp.GetValue(objResult.Value)?.ToString();
            Assert.Equal(exceptionMsg, messageValue);
        }

        // 3. SearchTests
        [Fact]
        public async Task SearchTests_ReturnsOk_WithListOfTests()
        {
            // Arrange
            string term = "sample";
            var tests = new List<Test>
            {
                new Test { Id = ObjectId.GenerateNewId().ToString(), Name = "Test1", Time = 3600 },
                new Test { Id = ObjectId.GenerateNewId().ToString(), Name = "Test2", Time = 1800 }
            };
            _mockTestService.Setup(s => s.SearchTestsAsync(term))
                            .ReturnsAsync(tests);

            // Act
            var result = await _controller.SearchTests(term);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(tests, okResult.Value);
        }

        // 4. SendMessageOptions
        [Fact]
        public void SendMessageOptions_ReturnsOk()
        {
            // Act
            var result = _controller.SendMessageOptions();
            // Assert
            Assert.IsType<OkResult>(result);
        }

        // 5. CreateTest: если входные данные не переданы
        [Fact]
        public async Task CreateTest_ReturnsBadRequest_WhenNewTestDtoIsNull()
        {
            // Act
            var result = await _controller.CreateTest(null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // 6. CreateTest: корректные данные
        [Fact]
        public async Task CreateTest_ReturnsResult_WhenValidTestDto()
        {
            // Arrange
            var createDto = new CreateTestDto
            {
                Name = "Test",
                Time = 3600,
                Questions = new List<TestQuestionDto>
                {
                    new TestQuestionDto { CategoryId = "cat1", Quantity = 5 }
                }
            };
            var serviceResponse = (200, (object)new { message = "Тест успешно создан", test = new Test { Id = ObjectId.GenerateNewId().ToString(), Name = createDto.Name, Time = createDto.Time, Questions = new List<TestQuestion> { new TestQuestion { CategoryId = "cat1", Quantity = 5 } } } });
            _mockTestService.Setup(s => s.CreateTestAsync(createDto))
                            .ReturnsAsync(serviceResponse);

            // Act
            var result = await _controller.CreateTest(createDto);

            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 7. GetTestById: невалидный id
        [Fact]
        public async Task GetTestById_ReturnsBadRequest_WhenIdInvalid()
        {
            // Arrange
            string invalidId = "wrongId";
            // Act
            var result = await _controller.GetTestById(invalidId);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // 8. GetTestById: валидный id
        [Fact]
        public async Task GetTestById_ReturnsTest_WhenIdValid()
        {
            // Arrange
            string validId = ObjectId.GenerateNewId().ToString();
            var serviceResponse = (200, (object)new { message = "Test found", test = new Test { Id = validId, Name = "Test", Time = 3600 } });
            _mockTestService.Setup(s => s.GetTestByIdAsync(validId))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.GetTestById(validId);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 9. ListTests
        [Fact]
        public async Task ListTests_ReturnsListOfTests()
        {
            // Arrange
            var tests = new List<Test>
            {
                new Test { Id = ObjectId.GenerateNewId().ToString(), Name = "Test1", Time = 3600 }
            };
            _mockTestService.Setup(s => s.GetAllTestsAsync())
                            .ReturnsAsync((200, (object)tests));
            // Act
            var result = await _controller.ListTests();
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
            Assert.Equal(tests, objResult.Value);
        }

        // 10. UpdateTest: проверка некорректных входных данных
        [Fact]
        public async Task UpdateTest_ReturnsBadRequest_WhenDataInvalid()
        {
            // Act
            var result1 = await _controller.UpdateTest(null, new Test());
            var result2 = await _controller.UpdateTest("someId", null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result1);
            Assert.IsType<BadRequestObjectResult>(result2);
        }

        // 11. UpdateTest: корректное обновление
        [Fact]
        public async Task UpdateTest_ReturnsResult_WhenValidData()
        {
            // Arrange
            string id = ObjectId.GenerateNewId().ToString();
            var updatedTest = new Test { Id = id, Name = "Updated test", Time = 3000 };
            var serviceResponse = (200, (object)new { message = "Test updated", test = updatedTest });
            _mockTestService.Setup(s => s.UpdateTestAsync(id, updatedTest))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.UpdateTest(id, updatedTest);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 12. DeleteTest: отсутствующий id
        [Fact]
        public async Task DeleteTest_ReturnsBadRequest_WhenIdNull()
        {
            // Act
            var result = await _controller.DeleteTest(null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // 13. DeleteTest: корректное удаление
        [Fact]
        public async Task DeleteTest_ReturnsResult_WhenValidId()
        {
            // Arrange
            string id = ObjectId.GenerateNewId().ToString();
            var serviceResponse = (200, (object)new { message = "Test deleted" });
            _mockTestService.Setup(s => s.DeleteTestAsync(id))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.DeleteTest(id);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 14. GenerateQuestionsForTest: отсутствующий id
        [Fact]
        public async Task GenerateQuestionsForTest_ReturnsBadRequest_WhenIdNull()
        {
            // Act
            var result = await _controller.GenerateQuestionsForTest(null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // 15. GenerateQuestionsForTest: корректный id
        [Fact]
        public async Task GenerateQuestionsForTest_ReturnsResult_WhenValidId()
        {
            // Arrange
            string id = ObjectId.GenerateNewId().ToString();
            var serviceResponse = (200, (object)new { message = "Questions generated" });
            _mockTestService.Setup(s => s.GenerateQuestionsForTestAsync(id))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.GenerateQuestionsForTest(id);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 16. CreateCodeForTest: отсутствие id или userId
        [Fact]
        public async Task CreateCodeForTest_ReturnsBadRequest_WhenIdOrUserIdNull()
        {
            // Act
            var result1 = await _controller.CreateCodeForTest(null, "user123");
            var result2 = await _controller.CreateCodeForTest("someId", null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result1);
            Assert.IsType<BadRequestObjectResult>(result2);
        }

        // 17. CreateCodeForTest: корректные параметры
        [Fact]
        public async Task CreateCodeForTest_ReturnsResult_WhenValidParameters()
        {
            // Arrange
            string id = ObjectId.GenerateNewId().ToString();
            string userId = "user123";
            var serviceResponse = (200, (object)new { message = "Code created", code = "ABC123" });
            _mockTestService.Setup(s => s.CreateCodeForTestAsync(id, userId))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.CreateCodeForTest(id, userId);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 18. OpenTest: отсутствие ключа или testId
        [Fact]
        public async Task OpenTest_ReturnsBadRequest_WhenKeyOrTestIdMissing()
        {
            // Act
            var result1 = await _controller.OpenTest(null, "testId");
            var result2 = await _controller.OpenTest("key", null);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result1);
            Assert.IsType<BadRequestObjectResult>(result2);
        }

        // 19. OpenTest: корректные параметры
        [Fact]
        public async Task OpenTest_ReturnsResult_WhenValidParameters()
        {
            // Arrange
            string key = "key123";
            string testId = ObjectId.GenerateNewId().ToString();
            var serviceResponse = (200, (object)new { message = "Test opened" });
            _mockTestService.Setup(s => s.OpenTestAsync(key, testId))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.OpenTest(key, testId);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }

        // 20. FinishTest: невалидная модель (ModelState не валидна)
        [Fact]
        public async Task FinishTest_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            _controller.ModelState.AddModelError("UserId", "Required");
            var finishDto = new FinishTestDto();
            // Act
            var result = await _controller.FinishTest(finishDto);
            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // 21. FinishTest: корректные данные
        [Fact]
        public async Task FinishTest_ReturnsResult_WhenValidDto()
        {
            // Arrange
            var finishDto = new FinishTestDto
            {
                SessionId = "session123",
                UserId = "user123",
                Answers = new List<CandidateAnswer>()
            };
            var serviceResponse = (200, (object)new { message = "Test finished", score = 100.0 });
            _mockTestService.Setup(s => s.FinishTestAsync(finishDto))
                            .ReturnsAsync(serviceResponse);
            // Act
            var result = await _controller.FinishTest(finishDto);
            // Assert
            var objResult = Assert.IsType<ObjectResult>(result);
            Assert.Equal(200, objResult.StatusCode);
        }
    }
}
