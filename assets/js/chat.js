/**
 * Real-time Chat Controller
 */
const ChatController = {
    socket: null,
    receiverId: null, // For Admin, this is the selected client. For Client, this is the admin (ID 1 usually)
    isAdmin: false,

    init(receiverId = null) {
        this.receiverId = receiverId;
        const session = getSession();
        if (!session) return;

        this.isAdmin = session.role === 'admin';

        // If client, default receiver is nutritionist (we'll fetch first nutritionist/admin)
        if (!this.isAdmin && !this.receiverId) {
            this.receiverId = 'admin_id_placeholder'; // This will be set dynamically in dashboard
        }

        this.setupSocket();
        this.renderChatWidget();
    },

    setupSocket() {
        const token = localStorage.getItem('nutri_token');
        this.socket = io('http://localhost:5001', {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Chat Server');
        });

        this.socket.on('receive_message', (message) => {
            this.addMessageToUI(message, 'received');
            this.playNotificationSound();
        });

        this.socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    },

    async loadHistory() {
        if (!this.receiverId) return;
        try {
            const res = await api.request(`/api/chat/history/${this.receiverId}`);
            const messages = res.messages;

            const container = document.getElementById('chatMessages');
            container.innerHTML = '';

            const userId = getSession().userId;
            messages.forEach(msg => {
                const type = msg.sender_id === userId ? 'sent' : 'received';
                this.addMessageToUI(msg, type);
            });
        } catch (error) {
            console.error('Failed to load chat history', error);
        }
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        if (!content || !this.receiverId) return;

        const data = {
            receiverId: this.receiverId,
            content: content
        };

        this.socket.emit('send_message', data);

        // Optimistically add to UI
        this.addMessageToUI({ content, created_at: new Date() }, 'sent');
        input.value = '';
    },

    addMessageToUI(msg, type) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const msgEl = document.createElement('div');
        msgEl.className = `message message-${type}`;
        msgEl.textContent = msg.content;

        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
    },

    toggleChat() {
        const win = document.getElementById('chatWindow');
        const isOpen = win.style.display === 'flex';
        win.style.display = isOpen ? 'none' : 'flex';

        if (!isOpen) {
            this.loadHistory();
        }
    },

    renderChatWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div id="chatWindow" class="chat-window">
                <div class="chat-header">
                    <span>${this.isAdmin ? 'Client Chat' : 'My Nutritionist'}</span>
                    <button onclick="ChatController.toggleChat()" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
                </div>
                <div id="chatMessages" class="chat-messages"></div>
                <div class="chat-input-area">
                    <input type="text" id="chatInput" class="chat-input" placeholder="Type a message...">
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="ChatController.sendMessage()">Sent</button>
                </div>
            </div>
            <div class="chat-button" onclick="ChatController.toggleChat()">
                💬
            </div>
        `;
        document.body.appendChild(widget);

        // Enter key support
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    },

    playNotificationSound() {
        // Optional: Implement simple beep
    }
};
