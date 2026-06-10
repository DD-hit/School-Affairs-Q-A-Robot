# 校务问答机器人系统 - 设计系统

## 项目定位
校园政务服务类智能问答 + 信息分享平台，面向师生，简洁清爽、专业易用、无冗余元素

## 新增需求设计原则
1. **自然操作流程**: 先分类查找，再搜索
2. **答案结构化**: 分点、提纲式呈现，易阅读
3. **明确提示**: 无法回答时提供解决路径（电话、链接、部门指引）
4. **简洁界面**: 无多余文字、无花哨动画、无信息过载
5. **用户管理**: 支持登录、个人中心、聊天记录管理
6. **分类推送**: 校务分类（校级 / 院级）
7. **主题切换**: 浅色 / 深色模式
8. **扩展功能**: 多模型切换与自定义知识库导入

## 色彩系统
### 浅色模式
- **主色**: #1677FF (校徽蓝/政务蓝)
- **辅助色**: #69B1FF
- **警示色**: #FF4D4F
- **成功色**: #52C41A
- **中性色**: 
  - 文字: #262626 (主要), #595959 (次要), #8C8C8C (辅助)
  - 边框: #D9D9D9
  - 背景: #F5F5F5, #FFFFFF

### 深色模式
- **主色**: #4096FF
- **辅助色**: #69B1FF
- **警示色**: #FF7875
- **成功色**: #73D13D
- **中性色**: 
  - 文字: #FFFFFF (主要), #BFBFBF (次要), #8C8C8C (辅助)
  - 边框: #434343
  - 背景: #141414, #1F1F1F

## 字体系统
- **字体族**: "Microsoft YaHei", "Segoe UI", sans-serif
- **字号**:
  - 标题: 20px (h1), 18px (h2), 16px (h3)
  - 正文: 14px
  - 辅助文字: 12px
  - 小字: 10px

## 间距系统 (8px基准)
- **小间距**: 4px
- **基础间距**: 8px
- **中等间距**: 16px
- **大间距**: 24px
- **超大间距**: 32px

## 圆角系统
- **小圆角**: 4px (按钮、输入框)
- **中等圆角**: 8px (卡片)
- **大圆角**: 12px (模态框)

## 阴影系统
- **一级阴影**: 0 1px 2px rgba(0, 0, 0, 0.1)
- **二级阴影**: 0 2px 8px rgba(0, 0, 0, 0.15)
- **三级阴影**: 0 4px 16px rgba(0, 0, 0, 0.2)

## 交互状态
- **悬停**: 主色变深10%
- **点击**: 主色变深20%
- **禁用**: 透明度0.5
- **加载**: 旋转动画

## 布局规范
- **顶部导航栏**: 固定定位，高度60px
- **内容区**: 最大宽度1200px，居中显示
- **底部栏**: 固定定位，高度80px
- **响应式**: 适配PC端，最小宽度1024px

## 组件规范
### 按钮
- **主按钮**: 背景色#1677FF，文字白色，圆角4px，内边距8px 16px
- **次按钮**: 边框色#1677FF，文字#1677FF，背景透明
- **文字按钮**: 文字#1677FF，无背景无边框
- **主题切换按钮**: 圆形，直径40px，包含太阳/月亮图标

### 分类选择器
- **布局**: 网格布局，每行3-4个分类
- **样式**: 卡片式，图标+文字，悬停有轻微上浮效果
- **激活状态**: 边框加粗，背景色微调

### 答案展示区
- **结构**: 分点列表，使用有序/无序列表
- **样式**: 清晰的层级关系，适当缩进
- **提纲式**: 使用标题层级，突出重点

### 解决路径提示
- **样式**: 警告样式，黄色背景，清晰图标
- **内容**: 电话、链接、部门指引分点列出
- **交互**: 链接可点击，电话可复制

### 输入框
- **高度**: 32px
- **边框**: 1px solid #D9D9D9
- **圆角**: 4px
- **内边距**: 8px 12px

### 卡片
- **背景**: #FFFFFF
- **边框**: 1px solid #F0F0F0
- **圆角**: 8px
- **阴影**: 0 2px 8px rgba(0, 0, 0, 0.15)
- **内边距**: 16px

### 导航栏
- **高度**: 60px
- **背景**: #FFFFFF
- **边框**: 1px solid #F0F0F0
- **文字**: #262626
- **激活状态**: 文字#1677FF，下边框2px solid #1677FF

## 页面结构模板
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>页面标题 - 校务问答机器人系统</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="light-mode">
    <!-- 顶部导航栏 -->
    <header class="navbar">
        <div class="container">
            <!-- 导航内容 -->
            <!-- 主题切换按钮 -->
            <button class="theme-toggle" id="theme-toggle">
                <i class="fas fa-moon"></i>
            </button>
        </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
        <div class="container">
            <!-- 页面内容 -->
        </div>
    </main>

    <!-- 底部栏 -->
    <footer class="footer">
        <div class="container">
            <!-- 底部内容 -->
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>
```

## 新增页面组件
### 分类查找区
```html
<section class="category-section">
    <h3 class="section-title">请选择问题分类</h3>
    <div class="category-grid">
        <div class="category-card" data-category="academic">
            <div class="category-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="category-name">学业相关</div>
        </div>
        <!-- 更多分类 -->
    </div>
</section>
```

### 结构化答案展示
```html
<div class="structured-answer">
    <h4>奖学金申请流程</h4>
    <ol class="answer-steps">
        <li>登录教务系统查看奖学金通知</li>
        <li>准备相关证明材料</li>
        <li>在规定时间内提交申请</li>
        <li>等待学院和学校审核</li>
        <li>公示结果</li>
    </ol>
</div>
```

### 解决路径提示
```html
<div class="solution-path">
    <div class="solution-header">
        <i class="fas fa-exclamation-circle"></i>
        <span>暂时无法回答您的问题</span>
    </div>
    <div class="solution-options">
        <div class="solution-option">
            <i class="fas fa-phone"></i>
            <span>电话咨询：12345678</span>
        </div>
        <div class="solution-option">
            <i class="fas fa-link"></i>
            <a href="#">相关链接：教务处网站</a>
        </div>
        <div class="solution-option">
            <i class="fas fa-building"></i>
            <span>部门指引：行政楼301室</span>
        </div>
    </div>
</div>
```