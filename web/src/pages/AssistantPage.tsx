import { useState } from 'react';
import { assistantMessages, quickPrompts } from '../data/mockData';
import type { AssistantMessage } from '../types/banking';

function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>(assistantMessages);
  const [value, setValue] = useState('');

  function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const assistantMessage: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: 'Пока я работаю как фронтовая заготовка. После подключения Assistant Service ответ будет приходить с backend.',
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setValue('');
  }

  return (
    <section className="assistant-page">
      <div className="page-hero">
        <div>
          <p className="eyebrow">Assistant Service</p>
          <h2>Банковский ассистент</h2>
          <p>Помогает с переводами, счетами, валютой и новостями.</p>
        </div>
      </div>

      <div className="assistant-layout">
        <div className="chat">
          {messages.map((message) => (
            <article className={`chat-message chat-message--${message.role}`} key={message.id}>
              {message.text}
            </article>
          ))}

          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(value);
            }}
          >
            <input
              placeholder="Напишите вопрос"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
            <button type="submit">Отправить</button>
          </form>
        </div>

        <aside className="card">
          <p className="eyebrow">Быстрые вопросы</p>
          <div className="prompt-list">
            {quickPrompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default AssistantPage;
