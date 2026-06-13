(function bindSharedKnowledgeHomepage(global) {
    const knowledgeBase = global.campusKnowledgeBase;
    if (!knowledgeBase) {
        return;
    }

    function renderHotTags(questions) {
        const hotQuestionsList = document.getElementById('hot-questions-list');
        if (!hotQuestionsList) {
            return;
        }

        hotQuestionsList.innerHTML = questions.map((question) => `
            <div class="hot-tag">${question}</div>
        `).join('');

        if (typeof global.setupHotQuestionClicks === 'function') {
            global.setupHotQuestionClicks();
        } else {
            hotQuestionsList.querySelectorAll('.hot-tag').forEach((tag) => {
                tag.addEventListener('click', () => {
                    const text = tag.textContent || '';
                    const questionInput = document.getElementById('question-input');
                    const chatInput = document.getElementById('chat-input');
                    if (questionInput) {
                        questionInput.value = text;
                    }
                    if (chatInput) {
                        chatInput.value = text;
                    }
                });
            });
        }
    }

    function getDefaultHotQuestions() {
        const entries = knowledgeBase.getActiveEntries();
        const studentEntries = entries.filter((item) => item.group === 'student').slice(0, 5);
        const teacherEntries = entries.filter((item) => item.group === 'teacher').slice(0, 3);
        return studentEntries.concat(teacherEntries).map((item) => item.question);
    }

    function updatePlaceholders(categoryName) {
        const placeholder = categoryName
            ? `请输入关于${categoryName}的问题...`
            : '请输入您的问题，例如：如何申请奖学金？';
        const questionInput = document.getElementById('question-input');
        const chatInput = document.getElementById('chat-input');

        if (questionInput) {
            questionInput.placeholder = placeholder;
        }
        if (chatInput) {
            chatInput.placeholder = categoryName
                ? `请输入关于${categoryName}的问题...`
                : '输入您的问题...';
        }
    }

    function renderCategories() {
        const categoryGrid = document.getElementById('category-grid');
        if (!categoryGrid) {
            return;
        }

        const categories = knowledgeBase.getHomepageCategories();
        categoryGrid.innerHTML = '';

        categories.forEach((category) => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div class="category-icon" style="background: ${category.color}">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-name">${category.name}</div>
            `;

            card.addEventListener('click', () => {
                categoryGrid.querySelectorAll('.category-card').forEach((item) => item.classList.remove('active'));
                card.classList.add('active');
                updatePlaceholders(category.name);
                loadCategoryQuestions(category.id);
                const questionInput = document.getElementById('question-input');
                if (questionInput) {
                    questionInput.focus();
                }
            });

            categoryGrid.appendChild(card);
        });
    }

    function updateWelcomeText() {
        const messageBubble = document.querySelector('#chat-messages .message .message-bubble');
        if (!messageBubble) {
            return;
        }

        messageBubble.textContent = '您好，我是校务问答助手，可以为您解答学生校务知识，以及教师校务、科研、人事、职称等政策问题。';
    }

    function formatAnswer(question) {
        const matched = knowledgeBase.findEntry(question);
        if (matched) {
            if (typeof global.formatStructuredAnswer === 'function') {
                return global.formatStructuredAnswer(matched);
            }

            const steps = (matched.steps || []).map((step) => `<li>${step}</li>`).join('');
            return `
                <div class="structured-answer">
                    <h4>${matched.title}</h4>
                    <p>${matched.content}</p>
                    <ol class="answer-steps">${steps}</ol>
                </div>
            `;
        }

        if (typeof global.formatSolutionPath === 'function') {
            return global.formatSolutionPath(question);
        }

        return '暂未找到匹配答案，请尝试调整关键词后重新提问。';
    }

    function loadCategoryQuestions(categoryId) {
        const questionsByCategory = knowledgeBase.getCategoryQuestions();
        renderHotTags(questionsByCategory[categoryId] || []);
    }

    function loadHotQuestions() {
        renderHotTags(getDefaultHotQuestions());
    }

    function overrideQuestionFlow() {
        const questionInput = document.getElementById('question-input');
        const chatInput = document.getElementById('chat-input');
        const askBtn = document.getElementById('ask-btn');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');
        const clearBtn = document.getElementById('clear-btn');
        let sharedChatMessageCounter = 0;
        let latestQuestionText = '';

        function supportsFeedback() {
            return Boolean(document.getElementById('feedback-modal'));
        }

        function createFeedbackPanel(messageId) {
            return `
                <div class="message-feedback" data-feedback-for="${messageId}">
                    <div class="feedback-label">这个回答对您有帮助吗？</div>
                    <div class="feedback-buttons">
                        <button type="button" class="feedback-action" data-feedback-action="helpful" data-message-id="${messageId}">有帮助</button>
                        <button type="button" class="feedback-action" data-feedback-action="unhelpful" data-message-id="${messageId}">没帮助</button>
                        <button type="button" class="feedback-action" data-feedback-action="detail" data-message-id="${messageId}">补充反馈</button>
                    </div>
                    <div class="feedback-note" data-feedback-note></div>
                </div>
            `;
        }

        function addMessage(content, isUser) {
            if (typeof global.addMessage === 'function') {
                global.addMessage(content, isUser);
                return;
            }

            if (!chatMessages) {
                return;
            }

            const message = document.createElement('div');
            const messageId = `shared-chat-message-${++sharedChatMessageCounter}`;
            const plainText = String(content).replace(/<[^>]*>/g, '').trim();
            message.className = `message${isUser ? ' user' : ''}`;
            message.dataset.messageId = messageId;
            if (isUser) {
                latestQuestionText = plainText;
                message.dataset.question = plainText;
            } else {
                message.dataset.question = latestQuestionText;
            }
            message.innerHTML = `
                <div class="message-avatar">${isUser ? '我' : '机'}</div>
                <div class="message-content">
                    <div class="message-bubble">${content}</div>
                    <div class="message-time">刚刚</div>
                </div>
            `;
            if (!isUser && supportsFeedback()) {
                const messageContent = message.querySelector('.message-content');
                if (messageContent) {
                    messageContent.insertAdjacentHTML('beforeend', createFeedbackPanel(messageId));
                }
            }
            chatMessages.appendChild(message);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function isGuestUser() {
            return false;
        }

        function showGuestReadonlyMessage() {
            if (typeof global.showGuestReadonlyMessage === 'function') {
                global.showGuestReadonlyMessage();
            }
        }

        function showInputError() {
            if (global.utils && typeof global.utils.showError === 'function') {
                global.utils.showError('请输入问题');
            }
        }

        function submitQuestion(fromChatInput) {
            if (isGuestUser()) {
                showGuestReadonlyMessage();
                return;
            }

            const sourceInput = fromChatInput ? chatInput : questionInput;
            if (!sourceInput) {
                return;
            }

            const question = sourceInput.value.trim();
            if (!question) {
                showInputError();
                return;
            }

            addMessage(question, true);
            global.setTimeout(() => {
                addMessage(formatAnswer(question), false);
            }, 1000);

            if (questionInput) {
                questionInput.value = '';
            }
            if (chatInput) {
                chatInput.value = '';
            }
        }

        if (askBtn) {
            askBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                submitQuestion(false);
            }, true);
        }
        if (sendBtn) {
            sendBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                submitQuestion(true);
            }, true);
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                if (questionInput) {
                    questionInput.value = '';
                }
                if (chatInput) {
                    chatInput.value = '';
                }
            }, true);
        }

        if (questionInput) {
            questionInput.addEventListener('keypress', (event) => {
                if (event.key !== 'Enter') {
                    return;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                submitQuestion(false);
            }, true);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (event) => {
                if (event.key !== 'Enter' || event.shiftKey) {
                    return;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                submitQuestion(true);
            }, true);
        }

        global.getAnswer = formatAnswer;
        global.loadCategoryQuestions = loadCategoryQuestions;
        global.loadHotQuestions = loadHotQuestions;
    }

    function init() {
        renderCategories();
        loadHotQuestions();
        updateWelcomeText();
        updatePlaceholders('');
        overrideQuestionFlow();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
