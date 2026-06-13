const adminState = {
    knowledgeEditingId: null,
    yellowEditingId: null
};

const knowledgeBaseApi = window.campusKnowledgeBase || null;
const adminKnowledgeCategories = knowledgeBaseApi ? knowledgeBaseApi.getCategories() : [];
let adminKnowledgeEntries = knowledgeBaseApi ? knowledgeBaseApi.getEntries() : [];

const adminYellowPageCategories = ((window.yellowPageSeedData && window.yellowPageSeedData.categories) || [])
    .filter((item) => item.id !== 'all');

const adminYellowPageDepartments = ((window.yellowPageSeedData && window.yellowPageSeedData.departments) || [])
    .map((item) => ({
        ...item,
        keywords: Array.isArray(item.keywords) ? [...item.keywords] : []
    }));

function setupKnowledgeSectionUI() {
    const section = document.getElementById('knowledge-section');
    if (!section) {
        return;
    }

    const sectionHeader = section.querySelector('.section-header');
    if (sectionHeader && !document.getElementById('knowledgeSummary')) {
        const headerNote = document.createElement('div');
        headerNote.className = 'yellow-modal-desc';
        headerNote.textContent = '公共知识库由管理员统一维护，同时覆盖学生校务与教师政策知识，全体用户均可查询。';

        const title = sectionHeader.querySelector('.section-title');
        if (title && title.parentElement === sectionHeader) {
            const titleWrap = document.createElement('div');
            title.before(titleWrap);
            titleWrap.appendChild(title);
            titleWrap.appendChild(headerNote);
        }

        const summary = document.createElement('div');
        summary.className = 'yellow-summary';
        summary.id = 'knowledgeSummary';
        sectionHeader.insertAdjacentElement('afterend', summary);
    }

    const searchBar = section.querySelector('.search-bar');
    if (searchBar) {
        searchBar.innerHTML = `
            <input type="text" id="knowledgeSearchInput" class="form-control search-input" placeholder="搜索问题、答案摘要或关键词">
            <select id="knowledgeCategoryFilter" class="form-control" style="width: 180px;">
                <option value="all">全部分类</option>
            </select>
            <select id="knowledgeScopeFilter" class="form-control" style="width: 150px;">
                <option value="all">全部范围</option>
                <option value="student">学生知识</option>
                <option value="teacher">教师政策</option>
            </select>
            <select id="knowledgeStatusFilter" class="form-control" style="width: 140px;">
                <option value="all">全部状态</option>
                <option value="active">启用</option>
                <option value="inactive">停用</option>
            </select>
            <button class="btn btn-primary" type="button" onclick="renderKnowledgeTable()">搜索</button>
        `;
    }

    const modal = document.getElementById('addKnowledgeModal');
    if (!modal) {
        return;
    }

    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
        modalTitle.id = 'knowledgeModalTitle';
    }

    const modalBody = modal.querySelector('.modal-body .knowledge-form');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="form-group">
                <label class="form-label">问题</label>
                <input type="text" id="knowledgeFormQuestion" class="form-control" placeholder="请输入问题">
            </div>
            <div class="form-group">
                <label class="form-label">答案摘要</label>
                <textarea id="knowledgeFormSummary" class="form-control" rows="6" placeholder="请输入政策说明、办理要点或答案摘要"></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">分类</label>
                    <select id="knowledgeFormCategory" class="form-control">
                        <option value="">请选择分类</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">状态</label>
                    <select id="knowledgeFormStatus" class="form-control">
                        <option value="active">启用</option>
                        <option value="inactive">停用</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">办理步骤</label>
                <textarea id="knowledgeFormSteps" class="form-control" rows="4" placeholder="每行一条步骤，用于前台结构化展示"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">搜索关键词</label>
                <input type="text" id="knowledgeFormKeywords" class="form-control" placeholder="多个关键词可用顿号、逗号或空格分隔">
            </div>
        `;
    }

    const modalFooter = modal.querySelector('.modal-footer');
    if (modalFooter) {
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" type="button" onclick="closeModal('addKnowledgeModal')">取消</button>
            <button class="btn btn-primary" type="button" onclick="saveKnowledgeEntry()">保存</button>
        `;
    }
}

function getCurrentTimestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function ensureAdminRole() {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') {
        alert('仅限管理员访问，请先以管理员身份登录。');
        window.location.href = '../login.html';
        return false;
    }
    return true;
}

function bindAdminMenu() {
    document.querySelectorAll('.admin-menu-item').forEach((item) => {
        item.addEventListener('click', () => {
            showAdminSection(item.getAttribute('data-section'));
        });
    });
}

function showAdminSection(sectionKey) {
    document.querySelectorAll('.admin-menu-item').forEach((item) => {
        item.classList.toggle('active', item.getAttribute('data-section') === sectionKey);
    });

    document.querySelectorAll('.admin-content > .admin-section').forEach((section) => {
        section.style.display = 'none';
    });

    const target = document.getElementById(`${sectionKey}-section`);
    if (target) {
        target.style.display = 'block';
    }
}

function bindModalClose() {
    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        window.location.href = '../login.html';
    }
}

function getKnowledgeCategory(categoryId) {
    return adminKnowledgeCategories.find((item) => item.id === categoryId) || null;
}

function getKnowledgeCategoryName(categoryId) {
    return getKnowledgeCategory(categoryId)?.name || '未分类';
}

function getKnowledgeGroupName(group) {
    return group === 'teacher' ? '教师政策' : '学生知识';
}

function getStatusText(status) {
    return status === 'active' ? '启用' : '停用';
}

function getStatusClass(status) {
    return status === 'active' ? 'status-active' : 'status-inactive';
}

function refreshKnowledgeEntries() {
    adminKnowledgeEntries = knowledgeBaseApi ? knowledgeBaseApi.getEntries() : [];
}

function persistKnowledgeEntries() {
    if (!knowledgeBaseApi) {
        return;
    }
    knowledgeBaseApi.saveEntries(adminKnowledgeEntries);
    refreshKnowledgeEntries();
}

function renderKnowledgeSummary() {
    const container = document.getElementById('knowledgeSummary');
    if (!container) {
        return;
    }

    const total = adminKnowledgeEntries.length;
    const studentCount = adminKnowledgeEntries.filter((item) => item.group === 'student').length;
    const teacherCount = adminKnowledgeEntries.filter((item) => item.group === 'teacher').length;
    const inactiveCount = adminKnowledgeEntries.filter((item) => item.status !== 'active').length;

    container.innerHTML = [
        { label: '知识总数', value: total },
        { label: '学生知识', value: studentCount },
        { label: '教师政策', value: teacherCount },
        { label: '停用条目', value: inactiveCount }
    ].map((card) => `
        <div class="yellow-summary-card">
            <div class="yellow-summary-value">${card.value}</div>
            <div class="yellow-summary-label">${card.label}</div>
        </div>
    `).join('');
}

function initKnowledgeFilters() {
    const categorySelect = document.getElementById('knowledgeCategoryFilter');
    const formCategorySelect = document.getElementById('knowledgeFormCategory');
    if (categorySelect) {
        categorySelect.innerHTML = ['<option value="all">全部分类</option>']
            .concat(adminKnowledgeCategories.map((item) => `<option value="${item.id}">${item.name}</option>`))
            .join('');
    }

    if (formCategorySelect) {
        formCategorySelect.innerHTML = ['<option value="">请选择分类</option>']
            .concat(adminKnowledgeCategories.map((item) => `<option value="${item.id}">${item.name}</option>`))
            .join('');
    }
}

function getFilteredKnowledgeEntries() {
    const keyword = (document.getElementById('knowledgeSearchInput')?.value || '').trim().toLowerCase();
    const categoryId = document.getElementById('knowledgeCategoryFilter')?.value || 'all';
    const scope = document.getElementById('knowledgeScopeFilter')?.value || 'all';
    const status = document.getElementById('knowledgeStatusFilter')?.value || 'all';

    return adminKnowledgeEntries.filter((item) => {
        const matchCategory = categoryId === 'all' || item.categoryId === categoryId;
        const matchScope = scope === 'all' || item.group === scope;
        const matchStatus = status === 'all' || item.status === status;
        const searchPool = [
            item.id,
            item.question,
            item.summary,
            item.categoryName,
            item.groupName,
            ...(item.keywords || [])
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || searchPool.includes(keyword);
        return matchCategory && matchScope && matchStatus && matchKeyword;
    });
}

function renderKnowledgeTable() {
    renderKnowledgeSummary();

    const tbody = document.getElementById('knowledgeTableBody');
    if (!tbody) {
        return;
    }

    const list = getFilteredKnowledgeEntries();
    if (!list.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:#8c8c8c;padding:32px 16px;">
                    未找到符合条件的知识条目，请调整筛选条件后重试。
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((item) => `
        <tr>
            <td>${item.id}</td>
            <td>
                <div class="department-name-cell">
                    <span class="department-name-main">${item.question}</span>
                    <span class="department-name-sub">${getKnowledgeGroupName(item.group)}</span>
                </div>
            </td>
            <td>${item.summary || '-'}</td>
            <td>
                <div class="department-name-cell">
                    <span class="badge badge-primary">${item.categoryName || getKnowledgeCategoryName(item.categoryId)}</span>
                    <span class="department-name-sub">${getStatusText(item.status)}</span>
                </div>
            </td>
            <td>${item.updatedAt || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-text" type="button" onclick="editKnowledge('${item.id}')">编辑</button>
                    <button class="btn btn-text" type="button" onclick="toggleKnowledgeStatus('${item.id}')">${item.status === 'active' ? '停用' : '启用'}</button>
                    <button class="btn btn-text btn-danger" type="button" onclick="deleteKnowledge('${item.id}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function bindKnowledgeSearch() {
    ['knowledgeSearchInput', 'knowledgeCategoryFilter', 'knowledgeScopeFilter', 'knowledgeStatusFilter'].forEach((id) => {
        const element = document.getElementById(id);
        if (!element) {
            return;
        }
        const eventName = element.tagName === 'SELECT' ? 'change' : 'input';
        element.addEventListener(eventName, renderKnowledgeTable);
    });
}

function resetKnowledgeForm() {
    const defaults = {
        knowledgeFormQuestion: '',
        knowledgeFormSummary: '',
        knowledgeFormCategory: '',
        knowledgeFormStatus: 'active',
        knowledgeFormSteps: '',
        knowledgeFormKeywords: ''
    };

    Object.entries(defaults).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

function showAddKnowledgeModal() {
    adminState.knowledgeEditingId = null;
    const title = document.getElementById('knowledgeModalTitle');
    if (title) {
        title.textContent = '添加知识条目';
    }
    resetKnowledgeForm();
    document.getElementById('addKnowledgeModal')?.classList.add('show');
}

function editKnowledge(id) {
    const target = adminKnowledgeEntries.find((item) => item.id === id);
    if (!target) {
        return;
    }

    adminState.knowledgeEditingId = id;
    const title = document.getElementById('knowledgeModalTitle');
    if (title) {
        title.textContent = '编辑知识条目';
    }

    document.getElementById('knowledgeFormQuestion').value = target.question || '';
    document.getElementById('knowledgeFormSummary').value = target.summary || '';
    document.getElementById('knowledgeFormCategory').value = target.categoryId || '';
    document.getElementById('knowledgeFormStatus').value = target.status || 'active';
    document.getElementById('knowledgeFormSteps').value = (target.steps || []).join('\n');
    document.getElementById('knowledgeFormKeywords').value = (target.keywords || []).join('、');
    document.getElementById('addKnowledgeModal')?.classList.add('show');
}

function nextKnowledgeId() {
    const numbers = adminKnowledgeEntries
        .map((item) => Number(String(item.id || '').replace(/\D/g, '')))
        .filter((item) => !Number.isNaN(item));
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    return `KB${String(next).padStart(3, '0')}`;
}

function saveKnowledgeEntry() {
    const question = document.getElementById('knowledgeFormQuestion')?.value.trim() || '';
    const summary = document.getElementById('knowledgeFormSummary')?.value.trim() || '';
    const categoryId = document.getElementById('knowledgeFormCategory')?.value || '';
    const status = document.getElementById('knowledgeFormStatus')?.value || 'active';
    const stepsText = document.getElementById('knowledgeFormSteps')?.value || '';
    const keywordsText = document.getElementById('knowledgeFormKeywords')?.value || '';

    if (!question || !summary || !categoryId) {
        alert('请完整填写问题、答案摘要和分类。');
        return;
    }

    const category = getKnowledgeCategory(categoryId);
    if (!category) {
        alert('请选择有效的知识分类。');
        return;
    }

    const steps = stepsText.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    const keywords = keywordsText.split(/[、，,\s]+/).map((item) => item.trim()).filter(Boolean);
    const updatedAt = getCurrentTimestamp();

    if (adminState.knowledgeEditingId) {
        const target = adminKnowledgeEntries.find((item) => item.id === adminState.knowledgeEditingId);
        if (!target) {
            return;
        }

        Object.assign(target, {
            question,
            summary,
            steps,
            categoryId,
            categoryName: category.name,
            group: category.group,
            groupName: category.groupName,
            keywords,
            status,
            updatedAt
        });
    } else {
        adminKnowledgeEntries.unshift({
            id: nextKnowledgeId(),
            question,
            summary,
            steps,
            categoryId,
            categoryName: category.name,
            group: category.group,
            groupName: category.groupName,
            keywords,
            status,
            updatedAt
        });
    }

    persistKnowledgeEntries();
    closeModal('addKnowledgeModal');
    renderKnowledgeTable();
}

function toggleKnowledgeStatus(id) {
    const target = adminKnowledgeEntries.find((item) => item.id === id);
    if (!target) {
        return;
    }

    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    const actionText = nextStatus === 'active' ? '启用' : '停用';
    if (!confirm(`确定要${actionText}“${target.question}”吗？`)) {
        return;
    }

    target.status = nextStatus;
    target.updatedAt = getCurrentTimestamp();
    persistKnowledgeEntries();
    renderKnowledgeTable();
}

function deleteKnowledge(id) {
    const index = adminKnowledgeEntries.findIndex((item) => item.id === id);
    if (index === -1) {
        return;
    }

    if (!confirm(`确定要删除“${adminKnowledgeEntries[index].question}”吗？此操作仅用于原型演示。`)) {
        return;
    }

    adminKnowledgeEntries.splice(index, 1);
    persistKnowledgeEntries();
    renderKnowledgeTable();
}

function adminGetYellowCategoryName(categoryId) {
    const category = adminYellowPageCategories.find((item) => item.id === categoryId);
    return category ? category.name : '未分类';
}

function initAdminYellowPageFilters() {
    const categorySelect = document.getElementById('yellowPageCategory');
    const formCategorySelect = document.getElementById('yellowFormCategory');

    if (categorySelect) {
        categorySelect.innerHTML = ['<option value="all">全部类别</option>']
            .concat(adminYellowPageCategories.map((item) => `<option value="${item.id}">${item.name}</option>`))
            .join('');
    }

    if (formCategorySelect) {
        formCategorySelect.innerHTML = ['<option value="">请选择类别</option>']
            .concat(adminYellowPageCategories.map((item) => `<option value="${item.id}">${item.name}</option>`))
            .join('');
    }
}

function bindAdminYellowPageSearch() {
    const searchInput = document.getElementById('yellowPageSearch');
    const categorySelect = document.getElementById('yellowPageCategory');
    const statusSelect = document.getElementById('yellowPageStatus');

    if (searchInput) {
        searchInput.addEventListener('input', renderAdminYellowPageTable);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', renderAdminYellowPageTable);
    }
    if (statusSelect) {
        statusSelect.addEventListener('change', renderAdminYellowPageTable);
    }
}

function renderAdminYellowPageSummary() {
    const container = document.getElementById('yellowPageSummary');
    if (!container) {
        return;
    }

    const total = adminYellowPageDepartments.length;
    const active = adminYellowPageDepartments.filter((item) => item.status === 'active').length;
    const inactive = total - active;
    const categoryCount = new Set(adminYellowPageDepartments.map((item) => item.category)).size;

    container.innerHTML = [
        { label: '部门总数', value: total },
        { label: '启用中', value: active },
        { label: '停用中', value: inactive },
        { label: '覆盖类别', value: categoryCount }
    ].map((card) => `
        <div class="yellow-summary-card">
            <div class="yellow-summary-value">${card.value}</div>
            <div class="yellow-summary-label">${card.label}</div>
        </div>
    `).join('');
}

function getAdminFilteredYellowPageDepartments() {
    const keyword = (document.getElementById('yellowPageSearch')?.value || '').trim().toLowerCase();
    const category = document.getElementById('yellowPageCategory')?.value || 'all';
    const status = document.getElementById('yellowPageStatus')?.value || 'all';

    return adminYellowPageDepartments.filter((item) => {
        const matchCategory = category === 'all' || item.category === category;
        const matchStatus = status === 'all' || item.status === status;
        const pool = [
            item.name,
            item.location,
            item.phone,
            item.description,
            item.categoryName,
            ...(item.keywords || [])
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || pool.includes(keyword);
        return matchCategory && matchStatus && matchKeyword;
    });
}

function renderAdminYellowPageTable() {
    renderAdminYellowPageSummary();

    const tbody = document.getElementById('yellowPageTableBody');
    if (!tbody) {
        return;
    }

    const list = getAdminFilteredYellowPageDepartments();
    if (!list.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;color:#8c8c8c;padding:32px 16px;">
                    未找到符合条件的部门，请调整筛选条件后重试。
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = list.map((item) => `
        <tr>
            <td>
                <div class="department-name-cell">
                    <span class="department-name-main">${item.name}</span>
                    <span class="department-name-sub">${item.description}</span>
                </div>
            </td>
            <td><span class="badge badge-primary">${item.categoryName || adminGetYellowCategoryName(item.category)}</span></td>
            <td>${item.location}</td>
            <td>${item.phone}</td>
            <td>${item.officeHours}</td>
            <td><span class="status-badge yellow-status ${getStatusClass(item.status)}">${getStatusText(item.status)}</span></td>
            <td>${item.updatedAt || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-text" type="button" onclick="editYellowPageDepartment(${item.id})">编辑</button>
                    <button class="btn btn-text" type="button" onclick="toggleYellowPageStatus(${item.id})">${item.status === 'active' ? '停用' : '启用'}</button>
                    <button class="btn btn-text btn-danger" type="button" onclick="deleteYellowPageDepartment(${item.id})">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderYellowPageTable() {
    renderAdminYellowPageTable();
}

function resetYellowPageForm() {
    const defaults = {
        yellowFormName: '',
        yellowFormCategory: '',
        yellowFormLocation: '',
        yellowFormPhone: '',
        yellowFormHours: '',
        yellowFormStatus: 'active',
        yellowFormDescription: '',
        yellowFormKeywords: ''
    };

    Object.entries(defaults).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

function openYellowPageModal() {
    adminState.yellowEditingId = null;
    const title = document.getElementById('yellowPageModalTitle');
    if (title) {
        title.textContent = '新增黄页部门';
    }
    resetYellowPageForm();
    document.getElementById('yellowPageModal')?.classList.add('show');
}

function editYellowPageDepartment(id) {
    const department = adminYellowPageDepartments.find((item) => item.id === id);
    if (!department) {
        return;
    }

    adminState.yellowEditingId = id;
    const title = document.getElementById('yellowPageModalTitle');
    if (title) {
        title.textContent = '编辑黄页部门';
    }

    document.getElementById('yellowFormName').value = department.name || '';
    document.getElementById('yellowFormCategory').value = department.category || '';
    document.getElementById('yellowFormLocation').value = department.location || '';
    document.getElementById('yellowFormPhone').value = department.phone || '';
    document.getElementById('yellowFormHours').value = department.officeHours || '';
    document.getElementById('yellowFormStatus').value = department.status || 'active';
    document.getElementById('yellowFormDescription').value = department.description || '';
    document.getElementById('yellowFormKeywords').value = (department.keywords || []).join('、');
    document.getElementById('yellowPageModal')?.classList.add('show');
}

function saveYellowPageDepartment() {
    const name = document.getElementById('yellowFormName').value.trim();
    const category = document.getElementById('yellowFormCategory').value;
    const location = document.getElementById('yellowFormLocation').value.trim();
    const phone = document.getElementById('yellowFormPhone').value.trim();
    const officeHours = document.getElementById('yellowFormHours').value.trim();
    const status = document.getElementById('yellowFormStatus').value;
    const description = document.getElementById('yellowFormDescription').value.trim();
    const keywordText = document.getElementById('yellowFormKeywords').value.trim();

    if (!name || !category || !location || !phone || !officeHours || !description) {
        alert('请完整填写部门名称、类别、办公地点、联系电话、办公时间和职责简介。');
        return;
    }

    const keywords = keywordText.split(/[、，,\s]+/).map((item) => item.trim()).filter(Boolean);
    const categoryName = adminGetYellowCategoryName(category);
    const updatedAt = getCurrentTimestamp();

    if (adminState.yellowEditingId !== null) {
        const target = adminYellowPageDepartments.find((item) => item.id === adminState.yellowEditingId);
        if (!target) {
            return;
        }

        Object.assign(target, {
            name,
            category,
            categoryName,
            location,
            phone,
            officeHours,
            description,
            keywords,
            status,
            updatedAt
        });
    } else {
        const nextId = adminYellowPageDepartments.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
        adminYellowPageDepartments.unshift({
            id: nextId,
            name,
            category,
            categoryName,
            location,
            phone,
            officeHours,
            description,
            keywords,
            status,
            updatedAt
        });
    }

    closeModal('yellowPageModal');
    renderAdminYellowPageTable();
}

function toggleYellowPageStatus(id) {
    const target = adminYellowPageDepartments.find((item) => item.id === id);
    if (!target) {
        return;
    }

    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    const actionText = nextStatus === 'active' ? '启用' : '停用';
    if (!confirm(`确定要${actionText}“${target.name}”吗？`)) {
        return;
    }

    target.status = nextStatus;
    target.updatedAt = getCurrentTimestamp();
    renderAdminYellowPageTable();
}

function deleteYellowPageDepartment(id) {
    const index = adminYellowPageDepartments.findIndex((item) => item.id === id);
    if (index === -1) {
        return;
    }

    if (!confirm(`确定要删除“${adminYellowPageDepartments[index].name}”吗？此操作仅用于原型演示。`)) {
        return;
    }

    adminYellowPageDepartments.splice(index, 1);
    renderAdminYellowPageTable();
}

function initAdminPage() {
    if (!ensureAdminRole()) {
        return;
    }

    setupKnowledgeSectionUI();
    bindAdminMenu();
    bindModalClose();
    initKnowledgeFilters();
    bindKnowledgeSearch();
    initAdminYellowPageFilters();
    bindAdminYellowPageSearch();
    showAdminSection('dashboard');
    renderKnowledgeTable();
    renderAdminYellowPageTable();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminPage);
} else {
    initAdminPage();
}
