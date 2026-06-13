// 校务问答机器人系统 - 全局JavaScript

// 模拟数据
const mockData = {
    // 用户数据
    currentUser: {
        id: 1,
        username: '张三',
        studentId: '2023666',
        phone: '88888888',
        role: 'student',
        avatar: '张'
    },
    
    // 热门问题
    hotQuestions: [
        { id: 1, text: '如何申请奖学金？', count: 125 },
        { id: 2, text: '选课系统什么时候开放？', count: 98 },
        { id: 3, text: '宿舍报修流程是什么？', count: 76 },
        { id: 4, text: '校园卡丢失怎么办？', count: 65 },
        { id: 5, text: '图书馆开放时间？', count: 54 }
    ],
    
    // 历史对话
    chatHistory: [
        { id: 1, question: '如何申请奖学金？', answer: '奖学金申请通常在每学期初开放，请登录教务系统查看具体通知。', time: '2026-03-10 14:30', liked: true },
        { id: 2, question: '选课系统什么时候开放？', answer: '选课系统将在3月15日上午9点开放，请提前做好准备。', time: '2026-03-09 10:15', liked: false },
        { id: 3, question: '宿舍报修流程是什么？', answer: '宿舍报修可以通过后勤服务公众号或拨打报修电话进行。', time: '2026-03-08 16:45', liked: true }
    ],
    
    // 论坛帖子
    forumPosts: [
        { 
            id: 1, 
            title: '关于本学期奖学金评选的通知', 
            author: '教务处', 
            time: '2026-03-10 09:00',
            category: '奖助',
            views: 1250,
            likes: 89,
            comments: 32,
            content: '本学期奖学金评选工作即将开始，请符合条件的同学及时提交申请材料...',
            pinned: true,
            featured: true
        },
        { 
            id: 2, 
            title: '选课系统使用指南', 
            author: '李四', 
            time: '2026-03-09 14:30',
            category: '选课',
            views: 890,
            likes: 45,
            comments: 18,
            content: '分享一些选课系统的使用技巧和注意事项...',
            pinned: false,
            featured: false
        },
        { 
            id: 3, 
            title: '宿舍热水供应时间调整', 
            author: '后勤处', 
            time: '2026-03-08 10:15',
            category: '宿舍',
            views: 760,
            likes: 32,
            comments: 15,
            content: '由于设备维护，宿舍热水供应时间调整为...',
            pinned: true,
            featured: false
        }
    ],
    
    // 论坛分类
    forumCategories: [
        { id: 'all', name: '全部' },
        { id: 'course', name: '选课' },
        { id: 'scholarship', name: '奖助勤贷' },
        { id: 'dorm', name: '宿舍' },
        { id: 'campus-card', name: '校园卡' },
        { id: 'library', name: '图书馆' },
        { id: 'exam', name: '考试' }
    ],

    yellowPageCategories: window.yellowPageSeedData ? window.yellowPageSeedData.categories : [],
    yellowPageDepartments: window.yellowPageSeedData ? window.yellowPageSeedData.departments : []
};

// 工具函数
const pathConfig = (() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const currentFolder = segments.length > 1 ? segments[segments.length - 2] : '';
    const roleFolders = ['admin', 'user', 'guest'];
    const inRoleFolder = roleFolders.includes(currentFolder);
    const currentRoleFolder = inRoleFolder ? currentFolder : '';
    const rootPrefix = inRoleFolder ? '../' : '';

    const buildRolePage = (roleFolder, page) => (
        currentRoleFolder === roleFolder ? page : `${rootPrefix}${roleFolder}/${page}`
    );

    return {
        currentRoleFolder,
        rootPrefix,
        login: `${rootPrefix}login.html`,
        adminHome: buildRolePage('admin', 'admin.html'),
        userHome: buildRolePage('user', 'index.html'),
        userPersonal: buildRolePage('user', 'personal.html'),
        userForum: buildRolePage('user', 'forum.html'),
        userYellowPages: buildRolePage('user', 'yellow-pages.html'),
        userHelp: buildRolePage('user', 'help.html'),
        userPost: buildRolePage('user', 'post.html'),
        guestHome: buildRolePage('guest', 'index.html'),
        guestForum: buildRolePage('guest', 'forum.html'),
        guestHelp: buildRolePage('guest', 'help.html'),
        guestPost: buildRolePage('guest', 'post.html'),
        entryByRole(role) {
            if (role === 'admin') return this.adminHome;
            if (role === 'guest') return this.guestHome;
            return this.userHome;
        }
    };
})();

const utils = {
    // 格式化时间
    formatTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 1天内
            return Math.floor(diff / 3600000) + '小时前';
        } else if (diff < 604800000) { // 1周内
            return Math.floor(diff / 86400000) + '天前';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    },
    
    // 显示成功消息
    showSuccess: (message) => {
        showToast(message, 'success');
    },
    
    // 显示错误消息
    showError: (message) => {
        showToast(message, 'error');
    },
    
    // 显示警告消息
    showWarning: (message) => {
        showToast(message, 'warning');
    },
    
    // 显示加载状态
    showLoading: (element, show = true) => {
        if (show) {
            element.innerHTML = '<div class="loading"></div>';
            element.disabled = true;
        } else {
            element.disabled = false;
        }
    },
    
    // 验证表单
    validateForm: (formData) => {
        const errors = {};
        
        // 验证必填字段
        Object.keys(formData).forEach(key => {
            if (formData[key].required && !formData[key].value.trim()) {
                errors[key] = formData[key].message || '此字段为必填项';
            }
            
            // 验证邮箱
            if (formData[key].type === 'email' && formData[key].value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData[key].value)) {
                    errors[key] = '请输入有效的邮箱地址';
                }
            }
            
            // 验证手机号
            if (formData[key].type === 'tel' && formData[key].value) {
                const telRegex = /^1[3-9]\d{9}$/;
                if (!telRegex.test(formData[key].value)) {
                    errors[key] = '请输入有效的手机号码';
                }
            }
            
            // 验证密码
            if (formData[key].type === 'password' && formData[key].value) {
                if (formData[key].value.length < 6) {
                    errors[key] = '密码长度至少6位';
                }
            }
            
            // 验证确认密码
            if (formData[key].type === 'confirmPassword' && formData[key].value) {
                const passwordField = Object.keys(formData).find(k => formData[k].type === 'password');
                if (passwordField && formData[key].value !== formData[passwordField].value) {
                    errors[key] = '两次输入的密码不一致';
                }
            }
        });
        
        return errors;
    }
};

// 显示Toast消息
function showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close">&times;</button>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        }
        
        .toast-content {
            background: white;
            border-radius: 4px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            border-left: 4px solid #1677ff;
        }
        
        .toast-success .toast-content {
            border-left-color: #52c41a;
        }
        
        .toast-error .toast-content {
            border-left-color: #ff4d4f;
        }
        
        .toast-warning .toast-content {
            border-left-color: #faad14;
        }
        
        .toast-message {
            flex: 1;
            margin-right: 12px;
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #8c8c8c;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .toast-close:hover {
            color: #262626;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // 添加关闭事件
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
        style.remove();
    });
    
    // 3秒后自动关闭
    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 3000);
}

// 显示确认对话框
function showConfirm(message, callback) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">确认操作</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                <button class="btn btn-danger" id="confirm-ok">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件监听
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('#confirm-cancel');
    const okBtn = modal.querySelector('#confirm-ok');
    
    const closeModal = () => {
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    okBtn.addEventListener('click', () => {
        callback();
        closeModal();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 页面跳转函数
function navigateTo(page) {
    window.location.href = page;
}

// 全局退出登录（清理本地会话）
function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = pathConfig.login;
}

// 初始化页面
function initPage() {
    // 设置当前用户信息（优先使用 localStorage 中的登录信息）
    const storedRole = localStorage.getItem('userRole');
    const storedName = localStorage.getItem('username');
    if (storedName) {
        mockData.currentUser.username = storedName;
        mockData.currentUser.avatar = storedName.charAt(0) || mockData.currentUser.avatar;
    }
    if (storedRole) {
        mockData.currentUser.role = storedRole;
    }

    const userInfoElements = document.querySelectorAll('.user-info');
    userInfoElements.forEach(element => {
        if (mockData.currentUser) {
            if (mockData.currentUser.role === 'guest') {
                element.innerHTML = `<span>欢迎，游客</span> <a href="${pathConfig.login}" class="btn btn-text">登录</a>`;
            } else if (mockData.currentUser.role === 'admin') {
                element.innerHTML = `<span>管理员：${mockData.currentUser.username}</span> <button class="btn btn-text" onclick="logout()">退出登录</button>`;
            } else {
                element.innerHTML = ` <span>${mockData.currentUser.username}</span> <div class="avatar">${mockData.currentUser.avatar}</div>`;
            }
        }
    });

    // 隐藏非管理员页面中的管理员后台链接
    const isAdmin = mockData.currentUser.role === 'admin';
    document.querySelectorAll('.nav-links a').forEach(a => {
        const href = a.getAttribute('href');
        if (href && href.toLowerCase().endsWith('admin.html')) {
            if (!isAdmin) {
                a.style.display = 'none';
            } else {
                a.style.display = '';
            }
        }
    });
    
    // 初始化标签页
    if (mockData.currentUser.role === 'guest') {
        document.querySelectorAll('a[href$="personal.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                utils.showWarning('请登录后使用个人中心');
            });
        });
    }

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // 更新激活状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应内容
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + '-content') {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 初始化模态框关闭按钮
    const modalCloseBtns = document.querySelectorAll('.modal-close');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.classList.remove('show');
        });
    });
    
    // 初始化表单提交
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                utils.showLoading(submitBtn, true);
                
                // 模拟API调用
                setTimeout(() => {
                    utils.showLoading(submitBtn, false);
                    
                    // 根据表单类型显示不同消息
                    if (form.id === 'login-form') {
                        utils.showSuccess('登录成功！');
                        setTimeout(() => navigateTo(pathConfig.userHome), 1000);
                    } else if (form.id === 'register-form') {
                        utils.showSuccess('注册成功！');
                        setTimeout(() => navigateTo(pathConfig.login), 1000);
                    } else if (form.id === 'post-form') {
                        utils.showSuccess('发帖成功！');
                        setTimeout(() => navigateTo(pathConfig.userForum), 1000);
                    } else if (form.id === 'comment-form') {
                        utils.showSuccess('评论成功！');
                        form.reset();
                        // 重新加载评论
                        if (typeof loadComments === 'function') {
                            loadComments();
                        }
                    } else {
                        utils.showSuccess('操作成功！');
                    }
                }, 1000);
            }
        });
    });
    
    // 初始化删除按钮
    const deleteBtns = document.querySelectorAll('.btn-delete');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showConfirm('确定要删除吗？此操作不可撤销。', () => {
                utils.showSuccess('删除成功！');
                // 在实际应用中，这里应该调用API删除数据
                btn.closest('.list-item')?.remove();
            });
        });
    });
    
    // 初始化点赞按钮
    const likeBtns = document.querySelectorAll('.btn-like');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const isLiked = btn.classList.contains('liked');
            
            if (isLiked) {
                btn.classList.remove('liked');
                btn.innerHTML = '👍 点赞';
                utils.showWarning('已取消点赞');
            } else {
                btn.classList.add('liked');
                btn.innerHTML = '👍 已点赞';
                utils.showSuccess('点赞成功！');
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);

// ==================== 论坛帖子相关功能 ====================

// 查看帖子详情
function viewPost(postId) {
    // 在实际应用中，这里应该根据postId获取帖子数据
    // 这里我们直接跳转到帖子详情页
    window.location.href = `${pathConfig.userPost}?id=${postId}`;
}

// 显示新帖子模态框
function showNewPostModal() {
    window.location.href = `${pathConfig.userPost}?mode=new`;
}

// 帖子点赞功能
function togglePostLike(postId, likeBtn) {
    const isLiked = likeBtn.classList.contains('liked');
    const likeCountElement = likeBtn.querySelector('.like-count');
    let likeCount = parseInt(likeCountElement.textContent);
    
    if (isLiked) {
        // 取消点赞
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = '👍 点赞';
        likeCount--;
        showToast('已取消点赞', 'info');
    } else {
        // 点赞
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = '👍 已点赞';
        likeCount++;
        showToast('点赞成功！', 'success');
    }
    
    likeCountElement.textContent = likeCount;
}

// 收藏帖子
function togglePostFavorite(postId, favBtn) {
    const isFavorited = favBtn.classList.contains('favorited');
    
    if (isFavorited) {
        favBtn.classList.remove('favorited');
        favBtn.innerHTML = '⭐ 收藏';
        showToast('已取消收藏', 'info');
    } else {
        favBtn.classList.add('favorited');
        favBtn.innerHTML = '⭐ 已收藏';
        showToast('收藏成功！', 'success');
    }
}

// 分享帖子
function sharePost(postId) {
    const postUrl = new URL(`${pathConfig.userPost}?id=${postId}`, window.location.href).toString();
    const postTitle = document.querySelector('.post-title')?.textContent || '校务论坛帖子';
    
    if (navigator.share) {
        // 使用Web Share API
        navigator.share({
            title: postTitle,
            text: '看看这个校务论坛的帖子',
            url: postUrl
        }).then(() => {
            showToast('分享成功！', 'success');
        }).catch((error) => {
            console.log('分享失败:', error);
            copyToClipboard(postUrl);
        });
    } else {
        // 降级方案：复制链接到剪贴板
        copyToClipboard(postUrl);
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('链接已复制到剪贴板', 'success');
    }).catch((error) => {
        console.error('复制失败:', error);
        showToast('复制失败，请手动复制链接', 'error');
    });
}

// 举报帖子
function reportPost(postId) {
    showConfirm('确定要举报这个帖子吗？', () => {
        // 在实际应用中，这里应该调用举报API
        showToast('举报已提交，管理员会尽快处理', 'success');
    });
}

// 帖子分类筛选
function filterPostsByCategory(category) {
    const categoryTabs = document.querySelectorAll('.category-tab');
    const postCards = document.querySelectorAll('.post-card');
    
    // 更新激活的分类标签
    categoryTabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 筛选帖子
    postCards.forEach(card => {
        const postCategory = card.dataset.category;
        
        if (category === 'all' || postCategory === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // 显示筛选结果
    const visiblePosts = document.querySelectorAll('.post-card[style*="block"]');
    if (visiblePosts.length === 0) {
        showToast(`没有找到${category === 'all' ? '' : '该分类'}的帖子`, 'info');
    }
}

// 搜索帖子
function searchPosts() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        showToast('请输入搜索关键词', 'warning');
        return;
    }
    
    const postCards = document.querySelectorAll('.post-card');
    let foundCount = 0;
    
    postCards.forEach(card => {
        const title = card.querySelector('.post-title').textContent.toLowerCase();
        const content = card.querySelector('.post-content').textContent.toLowerCase();
        const author = card.querySelector('.post-author').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm) || author.includes(searchTerm)) {
            card.style.display = 'block';
            foundCount++;
            
            // 高亮搜索关键词
            highlightText(card, searchTerm);
        } else {
            card.style.display = 'none';
        }
    });
    
    if (foundCount === 0) {
        showToast(`没有找到包含"${searchTerm}"的帖子`, 'info');
    } else {
        showToast(`找到${foundCount}个相关帖子`, 'success');
    }
}

// 高亮文本
function highlightText(element, searchTerm) {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const nodes = [];
    let node;
    while (node = walker.nextNode()) {
        nodes.push(node);
    }
    
    nodes.forEach(node => {
        const text = node.textContent;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        const newText = text.replace(regex, '<mark>$1</mark>');
        
        if (newText !== text) {
            const span = document.createElement('span');
            span.innerHTML = newText;
            node.parentNode.replaceChild(span, node);
        }
    });
}

// 加载更多帖子
let currentPage = 1;
const postsPerPage = 10;

function loadMorePosts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        utils.showLoading(loadMoreBtn, true);
        
        // 模拟加载更多数据
        setTimeout(() => {
            currentPage++;
            
            // 在实际应用中，这里应该从API获取更多帖子
            // 这里只是模拟加载
            const postList = document.querySelector('.post-list');
            if (postList) {
                // 添加一些模拟的新帖子
                for (let i = 0; i < postsPerPage; i++) {
                    const newPostId = mockData.forumPosts.length + i + 1;
                    const newPost = createPostElement({
                        id: newPostId,
                        title: `模拟帖子 ${newPostId}`,
                        author: '模拟用户',
                        time: '刚刚',
                        category: ['course', 'scholarship', 'dorm'][i % 3],
                        views: Math.floor(Math.random() * 100),
                        likes: Math.floor(Math.random() * 50),
                        comments: Math.floor(Math.random() * 20),
                        content: '这是模拟加载的帖子内容...',
                        pinned: false,
                        featured: false
                    });
                    postList.appendChild(newPost);
                }
            }
            
            utils.showLoading(loadMoreBtn, false);
            showToast(`已加载第${currentPage}页帖子`, 'success');
            
            // 如果已经是最后一页，隐藏加载更多按钮
            if (currentPage >= 3) { // 假设最多3页
                loadMoreBtn.style.display = 'none';
                const endMessage = document.createElement('div');
                endMessage.className = 'text-center mt-4 mb-4';
                endMessage.textContent = '没有更多帖子了';
                loadMoreBtn.parentNode.appendChild(endMessage);
            }
        }, 1000);
    }
}

// 创建帖子元素
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = `post-card ${post.pinned ? 'pinned' : ''} ${post.featured ? 'featured' : ''}`;
    postElement.dataset.category = post.category;
    postElement.onclick = () => viewPost(post.id);
    
    const categoryNames = {
        'course': '选课',
        'scholarship': '奖助勤贷',
        'dorm': '宿舍',
        'card': '校园卡',
        'library': '图书馆',
        'exam': '考试'
    };
    
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-title">${post.title}</div>
            ${post.pinned ? '<span class="badge badge-primary">置顶</span>' : ''}
            ${post.featured ? '<span class="badge badge-success">精华</span>' : ''}
        </div>
        <div class="post-content">${post.content}</div>
        <div class="post-footer">
            <div class="post-meta">
                <div class="post-author">${post.author}</div>
                <div class="post-time">${post.time}</div>
                <div class="post-category">${categoryNames[post.category] || post.category}</div>
            </div>
            <div class="post-stats">
                <div class="stat-item">
                    <span class="stat-icon">👁️</span>
                    <span class="stat-count">${post.views}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">👍</span>
                    <span class="stat-count like-count">${post.likes}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-icon">💬</span>
                    <span class="stat-count">${post.comments}</span>
                </div>
            </div>
        </div>
    `;
    
    return postElement;
}

// 初始化论坛页面
function initForumPage() {
    // 初始化分类标签点击事件
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            filterPostsByCategory(category);
        });
    });
    
    // 初始化搜索功能
    const searchBtn = document.querySelector('.search-bar .btn-primary');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchPosts);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    }
    
    // 初始化加载更多按钮
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMorePosts);
    }
    
    // 初始化发帖按钮
    const newPostBtn = document.querySelector('.btn-success');
    if (newPostBtn && !newPostBtn.onclick) {
        newPostBtn.addEventListener('click', showNewPostModal);
    }
}

// 检查当前页面并初始化相应功能
function checkAndInitPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'forum.html') {
        initForumPage();
    }
    
    // 其他页面的初始化可以在这里添加
}

// 在页面加载完成后检查并初始化
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    checkAndInitPage();
});
