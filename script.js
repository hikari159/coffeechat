// === Настройки ===
const SOCKET_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6IjA2QUI5MjM4QUIwRDZENzBFRjdGIiwicmVhZF9vbmx5Ijp0cnVlLCJwcmV2ZW50X21hc3RlciI6dHJ1ZSwidHdpdGNoX2lkIjoiMTIzODE3ODQ5In0.3psdG1iTsbIHHNRTraqLb5BdzWNZvJApko-SbnQdIfw"; // ← замени на свой токен из StreamLabs

// Случайный выбор между кофе и чаем
const cupIcons = [
  'https://i.imgur.com/6wCQv3T.png ', // Кофе
  'https://i.imgur.com/LbRjDkO.png '  // Чай
];

// Пастельные градиенты для облаков
const pastelGradients = [
  'linear-gradient(135deg, #e0eafc, #cfdef3)',
  'linear-gradient(135deg, #fceabb, #f8b500)',
  'linear-gradient(135deg, #dfe9f3, #ffffff)',
  'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
  'linear-gradient(135deg, #c1dfc4, #ffffff)',
  'linear-gradient(135deg, #ffe0ec, #ffc0cb)',
  'linear-gradient(135deg, #e2ebf0, #ffffff)'
];

// === Инициализация WebSocket ===
const socket = new WebSocket('wss://sockets.streamlabs.com');

socket.onopen = function () {
  console.log("✅ Соединение установлено");
  socket.send(JSON.stringify({
    type: "auth",
    socketToken: SOCKET_TOKEN
  }));
};

socket.onerror = function (error) {
  console.error("❌ Ошибка WebSocket:", error);
};

socket.onclose = function (event) {
  console.warn("⚠️ Соединение закрыто:", event.reason);
};

socket.onmessage = function (event) {
  try {
    const msg = JSON.parse(event.data);
    console.log("📨 Получено событие:", msg);

    if (msg.type === 'message') {
      msg.messages.forEach(chatMsg => {
        if (chatMsg.type !== 'text') return;

        let formattedMessage = parseCheermotes(chatMsg.message, chatMsg);
        formattedMessage = formatLinks(formattedMessage);

        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble');
        bubble.style.background = pastelGradients[Math.floor(Math.random() * pastelGradients.length)];

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.src = chatMsg.senderAvatar || 'https://i.imgur.com/placeholder.png ';

        const cup = document.createElement('div');
        cup.classList.add('cup');
        cup.style.backgroundImage = `url('${cupIcons[Math.floor(Math.random() * cupIcons.length)]}')`;

        const textDiv = document.createElement('div');
        textDiv.innerHTML = `<span class="username">${chatMsg.sender}:</span> <span class="text">${formattedMessage}</span>`;

        bubble.appendChild(avatar);
        bubble.appendChild(cup);
        bubble.appendChild(textDiv);

        const chatContainer = document.getElementById('chat-container');
        chatContainer.prepend(bubble);

        if (chatContainer.children.length > 20) {
          chatContainer.removeChild(chatContainer.lastChild);
        }

        chatContainer.scrollTop = 0;
      });
    }
  } catch (e) {
    console.error("❌ Ошибка парсинга сообщения:", e);
  }
};

// === Парсеры ===
function parseCheermotes(message, chatMsg) {
  if (!chatMsg.cheermotes) return message;

  chatMsg.cheermotes.forEach(cheer => {
    const img = `<img src="${cheer.image}" alt="${cheer.name}" style="height: 1.2em; vertical-align: middle;">`;
    const regex = new RegExp(cheer.name + '\\d+', 'gi');
    message = message.replace(regex, img);
  });

  return message;
}

function formatLinks(text) {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
    return `<a href="${url}" target="_blank">${url}</a>`;
  });
}
