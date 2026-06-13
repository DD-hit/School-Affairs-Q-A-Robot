(function initPrivateLibrary(global) {
    const DOCS_PREFIX = 'privateLibraryDocs';
    const MODE_KEY = 'privateLibraryQaMode';

    function getCurrentUser() {
        const username = localStorage.getItem('username')
            || global.mockData?.currentUser?.username
            || 'default-user';
        const role = localStorage.getItem('userRole')
            || global.mockData?.currentUser?.role
            || 'student';
        return {
            id: username,
            role
        };
    }

    function getDocsKey() {
        return `${DOCS_PREFIX}:${getCurrentUser().id}`;
    }

    function readDocs() {
        try {
            const raw = localStorage.getItem(getDocsKey());
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn('读取私域资料失败', error);
            return [];
        }
    }

    function saveDocs(docs) {
        localStorage.setItem(getDocsKey(), JSON.stringify(docs));
    }

    function getMode() {
        return localStorage.getItem(MODE_KEY) === 'private' ? 'private' : 'public';
    }

    function setMode(mode) {
        const safeMode = mode === 'private' ? 'private' : 'public';
        localStorage.setItem(MODE_KEY, safeMode);
        syncHomeModeUI();
    }

    function hasDocs() {
        return readDocs().length > 0;
    }

    function formatBytes(bytes) {
        if (!bytes) {
            return '0 KB';
        }
        if (bytes >= 1024 * 1024) {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    function formatTime(timestamp) {
        if (!timestamp) {
            return '--';
        }
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) {
            return '--';
        }
        const pad = (value) => String(value).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getExtension(name) {
        const parts = String(name || '').split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    }

    function getDocTypeLabel(name) {
        const ext = getExtension(name);
        if (ext === 'pdf') return 'PDF';
        if (ext === 'doc' || ext === 'docx') return 'Word';
        if (ext === 'txt' || ext === 'md') return '文本';
        if (ext === 'csv' || ext === 'xls' || ext === 'xlsx') return '表格';
        return ext ? ext.toUpperCase() : '文件';
    }

    function buildFallbackText(file) {
        const typeLabel = getDocTypeLabel(file.name);
        return `资料名称：${file.name}\n资料类型：${typeLabel}\n这是您上传到个人资料库的本地文件。当前前端原型已完成文件收录，可基于文件名称、类型和可解析内容进行私域问答。`;
    }

    function buildSearchTerms(question) {
        const text = String(question || '').trim().toLowerCase();
        const direct = text.match(/[\u4e00-\u9fa5a-z0-9]{2,}/gi) || [];
        const terms = new Set(direct);

        direct.forEach((item) => {
            if (/^[\u4e00-\u9fa5]+$/u.test(item) && item.length > 3) {
                for (let index = 0; index < item.length - 1; index += 1) {
                    terms.add(item.slice(index, index + 2));
                }
            }
        });

        if (!terms.size && text) {
            terms.add(text);
        }
        return Array.from(terms);
    }

    function countMatches(source, term) {
        if (!source || !term) {
            return 0;
        }
        let count = 0;
        let cursor = 0;
        while (true) {
            const index = source.indexOf(term, cursor);
            if (index === -1) {
                break;
            }
            count += 1;
            cursor = index + term.length;
        }
        return count;
    }

    function getExcerpt(content, terms) {
        const text = String(content || '').replace(/\s+/g, ' ').trim();
        if (!text) {
            return '该文件当前仅完成本地收录，尚未提取到可直接展示的正文片段。';
        }

        const normalized = text.toLowerCase();
        let hitIndex = -1;
        let hitTerm = '';

        terms.forEach((term) => {
            if (hitIndex !== -1) {
                return;
            }
            const currentIndex = normalized.indexOf(term);
            if (currentIndex !== -1) {
                hitIndex = currentIndex;
                hitTerm = term;
            }
        });

        if (hitIndex === -1) {
            return `${text.slice(0, 140)}${text.length > 140 ? '...' : ''}`;
        }

        const start = Math.max(0, hitIndex - 40);
        const end = Math.min(text.length, hitIndex + Math.max(hitTerm.length, 24) + 80);
        const excerpt = text.slice(start, end);
        return `${start > 0 ? '...' : ''}${excerpt}${end < text.length ? '...' : ''}`;
    }

    function buildPrivateAnswer(question) {
        const docs = readDocs();
        if (!docs.length) {
            return `
                <div class="private-answer">
                    <div class="private-answer-title">我的资料库还是空的</div>
                    <p>请先到个人中心上传 PDF、Word 或文本资料，再切回“我的资料问答”提问。</p>
                    <div class="private-answer-meta">
                        <a href="personal.html#library">前往我的资料库</a>
                    </div>
                </div>
            `;
        }

        const terms = buildSearchTerms(question);
        const ranked = docs
            .map((doc) => {
                const searchSource = `${doc.name} ${doc.content || ''}`.toLowerCase();
                let score = 0;
                terms.forEach((term) => {
                    if (doc.name.toLowerCase().includes(term)) {
                        score += 6;
                    }
                    score += countMatches(searchSource, term) * 2;
                });
                return {
                    doc,
                    score
                };
            })
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }
                return new Date(right.doc.uploadedAt).getTime() - new Date(left.doc.uploadedAt).getTime();
            });

        const best = ranked[0];
        if (!best || best.score <= 0) {
            const latest = docs[0];
            return `
                <div class="private-answer">
                    <div class="private-answer-title">未找到直接匹配内容</div>
                    <p>我暂时没有在您的私域资料中找到和“${escapeHtml(question)}”直接对应的片段。您可以换个问法，或先补充更相关的文件。</p>
                    <div class="private-answer-meta">
                        <span>最近上传：${escapeHtml(latest.name)}</span>
                        <a href="personal.html#library">管理我的资料</a>
                    </div>
                </div>
            `;
        }

        const topDocs = ranked.filter((item) => item.score > 0).slice(0, 3);
        const sources = topDocs.map((item) => `
            <span class="private-source-chip">${escapeHtml(item.doc.name)}</span>
        `).join('');
        const excerpt = getExcerpt(best.doc.content, terms);

        return `
            <div class="private-answer">
                <div class="private-answer-title">已根据您的个人资料进行回答</div>
                <p>结合当前最相关的资料内容，问题“${escapeHtml(question)}”优先命中了文件 <strong>${escapeHtml(best.doc.name)}</strong>。您可以先查看以下命中片段，再继续追问更细的问题。</p>
                <div class="private-answer-excerpt">${escapeHtml(excerpt)}</div>
                <div class="private-answer-meta">
                    <span>来源文件</span>
                    ${sources}
                </div>
            </div>
        `;
    }

    function getSuggestedQuestions() {
        const docs = readDocs().slice(0, 5);
        if (!docs.length) {
            return [
                '我的资料库里目前有什么文件？',
                '请根据我的资料总结主要内容',
                '哪份资料和我的问题最相关？'
            ];
        }
        return docs.map((doc) => `请根据《${doc.name}》概括重点内容`);
    }

    async function extractPdfText(file) {
        if (!global.pdfjsLib) {
            return '';
        }
        if (global.pdfjsLib.GlobalWorkerOptions) {
            global.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await global.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            pages.push(pageText);
        }
        return pages.join('\n').trim();
    }

    async function extractDocxText(file) {
        if (!global.mammoth) {
            return '';
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await global.mammoth.extractRawText({ arrayBuffer });
        return String(result?.value || '').trim();
    }

    async function extractFileText(file) {
        const extension = getExtension(file.name);
        if (['txt', 'md', 'json', 'csv'].includes(extension)) {
            return String(await file.text()).trim();
        }
        if (extension === 'pdf') {
            return extractPdfText(file);
        }
        if (extension === 'docx') {
            return extractDocxText(file);
        }
        return '';
    }

    async function saveUploadedFiles(fileList) {
        const files = Array.from(fileList || []);
        if (!files.length) {
            return [];
        }

        const docs = readDocs();
        const created = [];

        for (const file of files) {
            let content = '';
            let parseStatus = 'limited';
            try {
                content = await extractFileText(file);
                parseStatus = content ? 'ready' : 'limited';
            } catch (error) {
                console.warn('解析文件失败', file.name, error);
            }

            if (!content) {
                content = buildFallbackText(file);
            }

            const doc = {
                id: `doc_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
                name: file.name,
                size: file.size || 0,
                typeLabel: getDocTypeLabel(file.name),
                parseStatus,
                uploadedAt: new Date().toISOString(),
                content: content.slice(0, 12000)
            };
            docs.unshift(doc);
            created.push(doc);
        }

        saveDocs(docs);
        syncHomeModeUI();
        renderLibraryList();
        return created;
    }

    function deleteDoc(id) {
        const nextDocs = readDocs().filter((doc) => doc.id !== id);
        saveDocs(nextDocs);
        syncHomeModeUI();
        renderLibraryList();
    }

    function clearDocs() {
        saveDocs([]);
        syncHomeModeUI();
        renderLibraryList();
    }

    function exportDocs() {
        const docs = readDocs();
        const blob = new Blob([JSON.stringify(docs, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'private-library-export.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    function renderHomeHotQuestions() {
        const hotList = document.getElementById('hot-questions-list');
        if (!hotList || getMode() !== 'private') {
            return;
        }

        hotList.innerHTML = getSuggestedQuestions().map((question) => `
            <div class="hot-tag">${escapeHtml(question)}</div>
        `).join('');
    }

    function syncHomeModeUI() {
        const publicBtn = document.getElementById('qa-mode-public');
        const privateBtn = document.getElementById('qa-mode-private');
        const modeNote = document.getElementById('qa-mode-note');
        const questionInput = document.getElementById('question-input');
        const chatInput = document.getElementById('chat-input');
        const mode = getMode();
        const isPrivate = mode === 'private';

        if (publicBtn) {
            publicBtn.classList.toggle('active', !isPrivate);
        }
        if (privateBtn) {
            privateBtn.classList.toggle('active', isPrivate);
        }
        if (modeNote) {
            modeNote.textContent = isPrivate
                ? (hasDocs() ? '仅基于您本地上传的个人资料进行回答，管理员不可见。' : '请先在个人中心上传资料后，再使用我的资料问答。')
                : '当前使用管理员维护的公共知识库进行问答。';
        }
        if (questionInput) {
            questionInput.placeholder = isPrivate
                ? '请输入关于我已上传资料的问题'
                : '请输入您的问题，例如：如何申请奖学金？';
        }
        if (chatInput) {
            chatInput.placeholder = isPrivate
                ? '请输入基于个人资料的问题...'
                : '输入您的问题...';
        }

        if (isPrivate) {
            renderHomeHotQuestions();
        } else if (typeof global.loadHotQuestions === 'function') {
            global.loadHotQuestions();
        }
    }

    function bindHomePage() {
        const publicBtn = document.getElementById('qa-mode-public');
        const privateBtn = document.getElementById('qa-mode-private');
        if (!publicBtn || !privateBtn) {
            return;
        }

        publicBtn.addEventListener('click', () => setMode('public'));
        privateBtn.addEventListener('click', () => {
            if (getCurrentUser().role === 'guest') {
                if (global.utils?.showWarning) {
                    global.utils.showWarning('请登录后使用我的资料问答');
                }
                return;
            }
            setMode('private');
        });

        syncHomeModeUI();
    }

    function renderLibraryList() {
        const list = document.getElementById('private-library-list');
        const empty = document.getElementById('private-library-empty');
        const count = document.getElementById('private-library-count');
        const latest = document.getElementById('private-library-latest');
        if (!list) {
            return;
        }

        const docs = readDocs();
        if (count) {
            count.textContent = String(docs.length);
        }
        if (latest) {
            latest.textContent = docs.length ? formatTime(docs[0].uploadedAt) : '--';
        }
        if (!docs.length) {
            list.innerHTML = '';
            if (empty) {
                empty.style.display = 'flex';
            }
            return;
        }

        if (empty) {
            empty.style.display = 'none';
        }
        list.innerHTML = docs.map((doc) => `
            <div class="library-item">
                <div class="library-item-main">
                    <div class="library-item-title-row">
                        <div class="library-item-title">${escapeHtml(doc.name)}</div>
                        <span class="library-status ${doc.parseStatus === 'ready' ? 'ready' : 'limited'}">
                            ${doc.parseStatus === 'ready' ? '可问答' : '已收录'}
                        </span>
                    </div>
                    <div class="library-item-meta">
                        <span>${escapeHtml(doc.typeLabel)}</span>
                        <span>${formatBytes(doc.size)}</span>
                        <span>${formatTime(doc.uploadedAt)}</span>
                    </div>
                    <div class="library-item-excerpt">${escapeHtml(getExcerpt(doc.content, []))}</div>
                </div>
                <div class="library-item-actions">
                    <button type="button" class="btn btn-text" data-library-delete="${doc.id}">删除</button>
                </div>
            </div>
        `).join('');
    }

    function bindPersonalPage() {
        const uploadButton = document.getElementById('private-upload-trigger');
        const uploadInput = document.getElementById('private-file-input');
        const clearButton = document.getElementById('private-clear-all');
        const exportButton = document.getElementById('private-export-list');
        const askButton = document.getElementById('go-private-qa');
        if (!uploadInput) {
            return;
        }

        if (uploadButton) {
            uploadButton.addEventListener('click', () => uploadInput.click());
        }

        uploadInput.addEventListener('change', async (event) => {
            const created = await saveUploadedFiles(event.target.files);
            if (created.length && global.utils?.showSuccess) {
                global.utils.showSuccess(`已收录 ${created.length} 份个人资料`);
            }
            event.target.value = '';
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (!readDocs().length) {
                    return;
                }
                if (global.confirm('确定清空当前账号的全部个人资料吗？此操作仅影响本地浏览器数据。')) {
                    clearDocs();
                    if (global.utils?.showWarning) {
                        global.utils.showWarning('已清空本地个人资料库');
                    }
                }
            });
        }

        if (exportButton) {
            exportButton.addEventListener('click', () => {
                exportDocs();
                if (global.utils?.showSuccess) {
                    global.utils.showSuccess('已导出资料清单');
                }
            });
        }

        if (askButton) {
            askButton.addEventListener('click', () => {
                setMode('private');
                global.location.href = 'index.html';
            });
        }

        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-library-delete]');
            if (!button) {
                return;
            }
            deleteDoc(button.getAttribute('data-library-delete'));
            if (global.utils?.showWarning) {
                global.utils.showWarning('已移除该资料');
            }
        });

        renderLibraryList();
    }

    global.privateLibrary = {
        getMode,
        setMode,
        hasDocs,
        getDocs: readDocs,
        answer: buildPrivateAnswer,
        bindHomePage,
        bindPersonalPage,
        renderLibraryList
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            bindHomePage();
            bindPersonalPage();
        });
    } else {
        bindHomePage();
        bindPersonalPage();
    }
})(window);
