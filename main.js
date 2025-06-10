// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    for (const link of scrollLinks) {
        link.addEventListener('click', smoothScroll);
    }

    function smoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
    }

    // 导航栏滚动效果
    const header = document.querySelector('.site-header');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = window.scrollY;
    });

    // 评论功能
    initCommentSystem();

    // 表单提交事件
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        // 检查是否是评论表单
        if (form.classList.contains('feedback-form')) {
            form.addEventListener('submit', handleCommentSubmit);
        } else {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // 简单验证
                const inputs = form.querySelectorAll('input, textarea');
                let isValid = true;

                inputs.forEach(input => {
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');
                    } else {
                        input.classList.remove('error');
                    }
                });

                if (isValid) {
                    // 模拟表单提交成功
                    alert('表单提交成功！');
                    form.reset();
                } else {
                    alert('请填写所有必填字段！');
                }
            });
        }
    });

    // 响应式菜单（如果需要的话）
    const menuToggle = document.querySelector('.mobile-menu-toggle');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const nav = document.querySelector('.main-navigation');
            nav.classList.toggle('open');
            this.classList.toggle('active');
        });
    }
});

// 评论系统功能
function initCommentSystem() {
    // 如果是第一次访问，初始化一些示例评论
    initDefaultComments();

    // 页面加载时显示已保存的评论
    displayComments();
}

function initDefaultComments() {
    // 不再添加默认评论，让页面开始时为空
    // 用户可以自己添加评论
}

function handleCommentSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const userName = form.querySelector('#userName').value.trim();
    const userEmail = form.querySelector('#userEmail').value.trim();
    const userFeedback = form.querySelector('#userFeedback').value.trim();

    // 验证表单
    if (!userName || !userEmail || !userFeedback) {
        alert('请填写所有必填字段！');
        return;
    }

    // 创建评论对象
    const comment = {
        id: Date.now(), // 使用时间戳作为唯一ID
        name: userName,
        email: userEmail,
        content: userFeedback,
        date: new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };

    // 保存评论到本地存储
    saveComment(comment);

    // 重新显示评论列表，并高亮新评论
    displayComments(comment.id);

    // 清空表单
    form.reset();

    alert('评论提交成功！');
}

function saveComment(comment) {
    // 获取现有评论
    let comments = getComments();

    // 添加新评论到数组开头（最新的在前面）
    comments.unshift(comment);

    // 保存到本地存储
    localStorage.setItem('communityComments', JSON.stringify(comments));
}

function getComments() {
    const commentsJson = localStorage.getItem('communityComments');
    return commentsJson ? JSON.parse(commentsJson) : [];
}

function displayComments(newCommentId = null) {
    const commentsContainer = document.querySelector('#commentsContainer');
    if (!commentsContainer) return;

    const comments = getComments();

    // 清空现有评论显示
    commentsContainer.innerHTML = '';

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">暂无评论，快来发表第一条评论吧！</p>';
        return;
    }

    // 显示所有评论
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment, comment.id === newCommentId);
        commentsContainer.appendChild(commentElement);
    });
}

function createCommentElement(comment, isNew = false) {
    const commentDiv = document.createElement('div');
    commentDiv.className = isNew ? 'feedback-item new-comment' : 'feedback-item';
    commentDiv.innerHTML = `
        <div class="feedback-header">
            <span class="author-name">${escapeHtml(comment.name)}</span>
            <span class="submit-date">${comment.date}</span>
            <button class="delete-btn" onclick="deleteComment(${comment.id})" title="删除评论">删除</button>
        </div>
        <p>${escapeHtml(comment.content)}</p>
    `;

    // 如果是新评论，3秒后移除高亮效果
    if (isNew) {
        setTimeout(() => {
            commentDiv.classList.remove('new-comment');
        }, 3000);
    }

    return commentDiv;
}

function deleteComment(commentId) {
    // 确认删除
    if (!confirm('确定要删除这条评论吗？')) {
        return;
    }

    // 获取现有评论
    let comments = getComments();

    // 过滤掉要删除的评论
    comments = comments.filter(comment => comment.id !== commentId);

    // 更新本地存储
    localStorage.setItem('communityComments', JSON.stringify(comments));

    // 重新显示评论列表
    displayComments();

    alert('评论已删除！');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 清除所有评论的功能（可以在控制台调用）
function clearAllComments() {
    if (confirm('确定要清除所有评论吗？此操作不可恢复！')) {
        localStorage.removeItem('communityComments');
        displayComments();
        alert('所有评论已清除！');
    }
}