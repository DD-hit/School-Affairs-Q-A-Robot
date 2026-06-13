const userYellowPageCategories = (window.yellowPageSeedData && window.yellowPageSeedData.categories) || [];
const userYellowPageDepartments = ((window.yellowPageSeedData && window.yellowPageSeedData.departments) || [])
    .filter((item) => item.status === 'active');

const userYellowPageState = {
    category: 'all',
    keyword: ''
};

function renderUserYellowPageFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) {
        return;
    }

    container.innerHTML = userYellowPageCategories.map((category) => `
        <button
            class="category-filter ${category.id === userYellowPageState.category ? 'active' : ''}"
            data-category="${category.id}"
            type="button"
        >
            ${category.name}
        </button>
    `).join('');

    container.querySelectorAll('.category-filter').forEach((button) => {
        button.addEventListener('click', () => {
            userYellowPageState.category = button.dataset.category || 'all';
            renderUserYellowPageFilters();
            renderUserYellowPageDepartments();
        });
    });
}

function getUserFilteredYellowPageDepartments() {
    const keyword = userYellowPageState.keyword.trim().toLowerCase();

    return userYellowPageDepartments.filter((item) => {
        const matchCategory = userYellowPageState.category === 'all' || item.category === userYellowPageState.category;
        const searchPool = [
            item.name,
            item.description,
            item.location,
            item.categoryName,
            ...(item.keywords || [])
        ].join(' ').toLowerCase();
        const matchKeyword = !keyword || searchPool.includes(keyword);

        return matchCategory && matchKeyword;
    });
}

function renderUserYellowPageDepartments() {
    const list = getUserFilteredYellowPageDepartments();
    const grid = document.getElementById('departmentGrid');
    const count = document.getElementById('resultCount');

    if (!grid || !count) {
        return;
    }

    count.textContent = `共 ${userYellowPageDepartments.length} 个部门，当前显示 ${list.length} 个`;

    if (!list.length) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-title">未找到符合条件的部门</div>
                <div class="empty-state-desc">试试切换分类，或输入更简短的名称、职责关键词。</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map((item) => `
        <article class="department-card">
            <div class="department-card-header">
                <div class="department-name">${item.name}</div>
                <span class="badge badge-primary department-badge">${item.categoryName}</span>
            </div>
            <div class="department-info-list">
                <div class="department-info-item">
                    <span class="department-info-label">办公地点</span>
                    <span>${item.location}</span>
                </div>
                <div class="department-info-item">
                    <span class="department-info-label">联系电话</span>
                    <span>${item.phone}</span>
                </div>
                <div class="department-info-item">
                    <span class="department-info-label">办公时间</span>
                    <span>${item.officeHours}</span>
                </div>
            </div>
            <div class="department-desc">${item.description}</div>
        </article>
    `).join('');
}

function initUserYellowPages() {
    const searchInput = document.getElementById('departmentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function handleInput() {
            userYellowPageState.keyword = this.value;
            renderUserYellowPageDepartments();
        });
    }

    renderUserYellowPageFilters();
    renderUserYellowPageDepartments();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUserYellowPages);
} else {
    initUserYellowPages();
}
