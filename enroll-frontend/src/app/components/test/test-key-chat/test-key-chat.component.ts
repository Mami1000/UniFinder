import { Component, OnInit, AfterViewInit, ViewChild, ViewChildren, QueryList, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { UserService, User } from '../../../services/user/user.service';
import { BotService, BotResponse } from '../../../services/bot/bot.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatButtonModule } from '@angular/material/button';

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string; // добавлено поле времени отправки (ISO формат)
}

@Component({
  selector: 'app-test-key-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './test-key-chat.component.html',
  styleUrls: ['./test-key-chat.component.css']
})
export class TestKeyChatComponent implements OnInit, AfterViewInit {
  @Input() testId: string | null = null;
  @Output() codeReceived: EventEmitter<string> = new EventEmitter<string>();
  messages: ChatMessage[] = [];
  userInput: string = '';
  userName: string = 'Пользователь';
  currentUserId: string = 'guest';

  // Ссылка на контейнер истории чата
  @ViewChild('chatHistory') private chatHistoryContainer!: ElementRef;
  // Список всех сообщений (каждый элемент с #chatMessage)
  @ViewChildren('chatMessage') private chatMessages!: QueryList<ElementRef>;

  constructor(
    private userService: UserService,
    private botService: BotService
  ) {}

  ngOnInit(): void {
    const currentUser: User | null = this.userService.getCurrentUser();
    if (currentUser && currentUser.name) {
      this.userName = `${currentUser.name} ${currentUser.surname || ''}`.trim();
      this.currentUserId = currentUser.id;
    }

    this.loadChatHistory();

    if (this.messages.length === 0) {
      this.messages.push({ 
        sender: 'Система', 
        text: `Привет, ${this.userName}! Нужен код для теста?`,
        timestamp: this.getCurrentTimestamp()
      });
      this.saveChatHistory();
    }
  }

  ngAfterViewInit(): void {
    // При изменениях списка сообщений прокручиваем к последнему элементу
    this.chatMessages.changes.subscribe(() => {
      this.scrollToLastMessage();
    });
    // Прокрутка сразу после инициализации представления
    this.scrollToLastMessage();
  }

  sendRequest(): void {
  if (!this.userInput.trim()) return;

  const userMessage = this.userInput.trim();
  this.messages.push({
    sender: this.userName,
    text: userMessage,
    timestamp: this.getCurrentTimestamp()
  });
  this.saveChatHistory();
  setTimeout(() => this.scrollToLastMessage(), 0);

  if (this.testId) {
    this.botService.processUserMessage(userMessage, this.currentUserId, this.testId)
      .subscribe((response: BotResponse) => {
        // Если сообщение содержит код, полученный с сервера
        if (response.reply.includes('Ваш код:')) {
          const key = response.reply.split('Ваш код:')[1].trim();
          // Эмитируем событие с полученным кодом
            this.codeReceived.emit(key);
        }

        this.messages.push({
          sender: 'Система',
          text: response.reply,
          timestamp: this.getCurrentTimestamp()
        });
        this.saveChatHistory();
        setTimeout(() => this.scrollToLastMessage(), 0);
      });
  } else {
    this.messages.push({
      sender: 'Система',
      text: 'Идентификатор теста не найден.',
      timestamp: this.getCurrentTimestamp()
    });
    this.saveChatHistory();
    setTimeout(() => this.scrollToLastMessage(), 0);
  }
  
  // Очистка userInput, если требуется (логика зависит от вашего кейса)
  this.userInput = '';
}
  

  private scrollToLastMessage(): void {
    try {
      if (this.chatMessages && this.chatMessages.last) {
        this.chatMessages.last.nativeElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    }
  }

  private getStorageKey(): string {
    const tid = this.testId || 'default';
    return 'chatHistory_' + this.currentUserId + '_' + tid;
  }
  
  private loadChatHistory(): void {
    const storageKey = this.getStorageKey();
    const dataStr = localStorage.getItem(storageKey);
    if (dataStr) {
      try {
        const dataObj = JSON.parse(dataStr);
        this.messages = dataObj.messages || [];
      } catch (e) {
        console.error('Ошибка парсинга chat history:', e);
        localStorage.removeItem(storageKey);
      }
    }
  }
  
  private saveChatHistory(): void {
    const storageKey = this.getStorageKey();
    const dataObj = {
      timestamp: new Date().toISOString(),
      messages: this.messages
    };
    localStorage.setItem(storageKey, JSON.stringify(dataObj));
  }

  // Метод для получения текущей даты и времени в ISO формате
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}
