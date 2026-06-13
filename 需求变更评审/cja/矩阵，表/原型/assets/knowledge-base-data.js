(function initCampusKnowledgeBase(global) {
    const STORAGE_KEY = 'campusKnowledgeBaseEntries';
    const DEFAULT_TIMESTAMP = '2026-06-12 09:00';

    const categories = [
        { id: 'academic', name: '学业相关', icon: 'fas fa-graduation-cap', color: '#1677ff', group: 'student', groupName: '学生知识' },
        { id: 'scholarship', name: '奖助学金', icon: 'fas fa-award', color: '#52c41a', group: 'student', groupName: '学生知识' },
        { id: 'dormitory', name: '宿舍生活', icon: 'fas fa-home', color: '#fa8c16', group: 'student', groupName: '学生知识' },
        { id: 'campus-card', name: '校园卡', icon: 'fas fa-credit-card', color: '#722ed1', group: 'student', groupName: '学生知识' },
        { id: 'library', name: '图书馆', icon: 'fas fa-book', color: '#13c2c2', group: 'student', groupName: '学生知识' },
        { id: 'exam', name: '考试报名', icon: 'fas fa-file-alt', color: '#f5222d', group: 'student', groupName: '学生知识' },
        { id: 'leave', name: '请假申请', icon: 'fas fa-calendar-check', color: '#eb2f96', group: 'student', groupName: '学生知识' },
        { id: 'other', name: '其他问题', icon: 'fas fa-question-circle', color: '#8c8c8c', group: 'student', groupName: '学生知识' },
        { id: 'teacher-affairs', name: '教师校务', icon: 'fas fa-briefcase', color: '#2f54eb', group: 'teacher', groupName: '教师政策' },
        { id: 'teacher-research', name: '科研管理', icon: 'fas fa-flask', color: '#14b8a6', group: 'teacher', groupName: '教师政策' },
        { id: 'teacher-personnel', name: '人事服务', icon: 'fas fa-user-tie', color: '#fa8c16', group: 'teacher', groupName: '教师政策' },
        { id: 'teacher-title', name: '职称评审', icon: 'fas fa-medal', color: '#7c3aed', group: 'teacher', groupName: '教师政策' }
    ];

    const seedEntries = [
        {
            id: 'KB001',
            question: '如何申请奖学金？',
            summary: '奖学金申请通常在每学期初开放，按学校通知完成线上填报与材料提交。',
            steps: [
                '登录教务系统或学生事务平台查看当学期奖学金通知。',
                '准备成绩单、获奖证明和综合表现材料。',
                '在规定时间内提交申请并确认辅导员审核状态。',
                '关注学院公示与学校复核结果。'
            ],
            categoryId: 'scholarship',
            keywords: ['奖学金', '奖助学金', '评选', '申请'],
            status: 'active',
            updatedAt: '2026-06-12 09:00'
        },
        {
            id: 'KB002',
            question: '奖学金评选标准是什么？',
            summary: '奖学金通常综合学业成绩、德育表现、科研竞赛和社会实践情况进行评定。',
            steps: [
                '先确认本学期奖学金类型与对应的申报范围。',
                '查看学院公布的成绩排名、违纪记录和素质测评分要求。',
                '按通知准备加分证明和佐证材料。',
                '如有异议，可在公示期内向学院学生工作办公室反馈。'
            ],
            categoryId: 'scholarship',
            keywords: ['奖学金标准', '评选标准', '综合测评', '加分'],
            status: 'active',
            updatedAt: '2026-06-11 16:10'
        },
        {
            id: 'KB003',
            question: '宿舍报修流程是什么？',
            summary: '宿舍报修可通过线上后勤报修入口或宿舍值班电话提交，紧急情况优先电话报修。',
            steps: [
                '进入后勤服务平台填写楼栋、房间和故障描述。',
                '上传现场照片并选择可上门处理时间。',
                '紧急漏水、断电等问题可同步拨打值班电话。',
                '提交后在个人中心查看维修受理与完成状态。'
            ],
            categoryId: 'dormitory',
            keywords: ['宿舍报修', '维修', '后勤', '故障'],
            status: 'active',
            updatedAt: '2026-06-10 10:25'
        },
        {
            id: 'KB004',
            question: '校园卡丢失怎么办？',
            summary: '校园卡遗失后请先挂失，再携带有效证件前往校园卡服务中心补办。',
            steps: [
                '通过校园卡平台或服务电话立即办理挂失。',
                '携带学生证或身份证到校园卡服务中心现场确认。',
                '缴纳补卡费用并核对个人信息。',
                '补卡完成后重新开通门禁和消费权限。'
            ],
            categoryId: 'campus-card',
            keywords: ['校园卡', '挂失', '补办', '门禁'],
            status: 'active',
            updatedAt: '2026-06-09 14:20'
        },
        {
            id: 'KB005',
            question: '图书馆借书期限是多久？',
            summary: '本科生、研究生和教职工的借阅期限不同，可在图书馆系统中查看个人借阅规则。',
            steps: [
                '登录图书馆检索系统查看当前身份对应的借阅期限。',
                '如需续借，请在到期前在线办理。',
                '预约书籍到馆后按通知时间领取。',
                '逾期未还将按图书馆规定计收滞纳费用。'
            ],
            categoryId: 'library',
            keywords: ['图书馆', '借书', '续借', '逾期'],
            status: 'active',
            updatedAt: '2026-06-08 09:30'
        },
        {
            id: 'KB006',
            question: '四六级考试如何报名？',
            summary: '全国大学英语四六级考试报名一般通过统一报名平台进行，学校会同步发布报名通知。',
            steps: [
                '关注教务处通知，确认报名时间和资格条件。',
                '登录统一报名平台核对个人信息并选择级别。',
                '在规定时间内完成缴费并保存报名回执。',
                '考前在系统下载准考证并查看考场安排。'
            ],
            categoryId: 'exam',
            keywords: ['四六级', '考试报名', '准考证', '缴费'],
            status: 'active',
            updatedAt: '2026-06-07 11:45'
        },
        {
            id: 'KB007',
            question: '病假需要什么证明？',
            summary: '病假通常需要提交医院诊断证明或病历材料，并按学院流程完成请假审批。',
            steps: [
                '在线填写请假申请并选择病假类型。',
                '上传门诊病历、诊断证明或住院相关材料。',
                '等待辅导员和学院审批结果。',
                '返校后按要求补交纸质材料或完成销假。'
            ],
            categoryId: 'leave',
            keywords: ['病假', '请假', '诊断证明', '销假'],
            status: 'active',
            updatedAt: '2026-06-06 13:20'
        },
        {
            id: 'KB008',
            question: '校园网怎么办理？',
            summary: '校园网可通过信息化中心线上平台办理开户、充值和故障申报。',
            steps: [
                '登录信息化服务门户绑定学号和联系方式。',
                '选择网络套餐并完成在线缴费。',
                '在宿舍或办公区按说明配置终端网络参数。',
                '网络异常时可提交工单或拨打网络服务电话。'
            ],
            categoryId: 'other',
            keywords: ['校园网', '网络办理', '信息化', '充值'],
            status: 'active',
            updatedAt: '2026-06-05 15:40'
        },
        {
            id: 'KB101',
            question: '教师调停课如何报备？',
            summary: '教师调停课需通过教务平台提交申请，并同步完成学院审批和学生通知。',
            steps: [
                '登录教务平台进入调停课申请模块。',
                '填写课程信息、调整原因和拟补课时间。',
                '提交后等待学院教学秘书和主管领导审核。',
                '审核通过后及时向学生发布调课通知并保留记录。'
            ],
            categoryId: 'teacher-affairs',
            keywords: ['教师调课', '停课', '补课', '教学秘书'],
            status: 'active',
            updatedAt: '2026-06-12 10:00'
        },
        {
            id: 'KB102',
            question: '教师请销假流程怎么走？',
            summary: '教师请销假由本人在校务平台发起，按所在单位和人事规定逐级审批。',
            steps: [
                '在校务平台选择请假类型并填写起止时间。',
                '上传相关证明材料或工作安排说明。',
                '经系主任、学院负责人审批后生效。',
                '返岗后在系统内完成销假并更新教学安排。'
            ],
            categoryId: 'teacher-affairs',
            keywords: ['教师请假', '销假', '校务平台', '审批'],
            status: 'active',
            updatedAt: '2026-06-11 17:30'
        },
        {
            id: 'KB103',
            question: '教师年度考核结果如何查询？',
            summary: '年度考核结果由所在单位统一完成归档，教师可在人事服务平台查询个人结果。',
            steps: [
                '登录人事服务平台进入年度考核模块。',
                '查看考核等次、评议意见和归档时间。',
                '如需补充材料或说明，可在规定时段内提交。',
                '对结果存在异议时，按学院通知流程申请复核。'
            ],
            categoryId: 'teacher-affairs',
            keywords: ['年度考核', '教师考核', '复核', '人事平台'],
            status: 'active',
            updatedAt: '2026-06-10 08:50'
        },
        {
            id: 'KB104',
            question: '科研项目经费报销流程是什么？',
            summary: '科研经费报销需按照项目预算、财务制度和经费负责人审批要求办理。',
            steps: [
                '确认支出内容在项目预算和经费使用范围内。',
                '准备发票、合同、审批单及相关佐证材料。',
                '在科研管理系统发起报销申请并提交负责人审核。',
                '审核通过后按财务通知完成线下或电子票据归档。'
            ],
            categoryId: 'teacher-research',
            keywords: ['科研经费', '报销', '财务', '预算'],
            status: 'active',
            updatedAt: '2026-06-12 10:20'
        },
        {
            id: 'KB105',
            question: '横向项目合同备案在哪里办理？',
            summary: '横向项目合同需先在科研管理部门完成审核，再按学校规定办理备案和用章流程。',
            steps: [
                '准备合同文本、合作方资质和项目立项信息。',
                '向科研管理部门提交合同审核申请。',
                '根据反馈修改条款并完成部门备案。',
                '备案通过后再进入学校合同用章流程。'
            ],
            categoryId: 'teacher-research',
            keywords: ['横向项目', '合同备案', '科研管理', '用章'],
            status: 'active',
            updatedAt: '2026-06-11 14:40'
        },
        {
            id: 'KB106',
            question: '科研成果认定需要提交哪些材料？',
            summary: '科研成果认定通常需要提交成果原件、检索证明和人员署名说明等材料。',
            steps: [
                '确认成果类型是否属于学校当期认定范围。',
                '准备论文、专利、获奖证书或著作等原始材料。',
                '上传检索证明、收录证明和署名页。',
                '在科研平台提交后跟进学院和科研部门审核结果。'
            ],
            categoryId: 'teacher-research',
            keywords: ['科研成果', '成果认定', '检索证明', '论文'],
            status: 'active',
            updatedAt: '2026-06-09 16:15'
        },
        {
            id: 'KB107',
            question: '教师入职报到需要准备哪些材料？',
            summary: '新入职教师需按人事通知准备身份、学历学位、档案和银行卡等基础材料。',
            steps: [
                '按报到通知准备身份证、学历学位证书和相关原件。',
                '提交入职登记表、照片、体检结果和政审材料。',
                '配合办理人事档案、社保、公积金和工号开通。',
                '完成报到后领取校园身份与办公系统账号。'
            ],
            categoryId: 'teacher-personnel',
            keywords: ['教师入职', '报到', '人事材料', '档案'],
            status: 'active',
            updatedAt: '2026-06-12 09:40'
        },
        {
            id: 'KB108',
            question: '在职证明和收入证明如何申请？',
            summary: '教师可通过人事服务平台提交申请，由人事部门统一出具在职或收入证明。',
            steps: [
                '登录人事服务平台选择证明类型。',
                '填写使用场景、语言版本和领取方式。',
                '等待人事部门审核并生成电子或纸质证明。',
                '如需盖章原件，按通知时间到指定窗口领取。'
            ],
            categoryId: 'teacher-personnel',
            keywords: ['在职证明', '收入证明', '人事服务', '盖章'],
            status: 'active',
            updatedAt: '2026-06-10 12:35'
        },
        {
            id: 'KB109',
            question: '教师岗位聘任变更如何办理？',
            summary: '岗位聘任变更需结合学校人事安排和所在单位意见，在人事系统中提交申请。',
            steps: [
                '确认岗位变更条件和时间窗口。',
                '填写岗位聘任变更申请并附单位意见。',
                '按流程完成学院审核和人事部门复核。',
                '审批完成后在人事系统查看变更结果。'
            ],
            categoryId: 'teacher-personnel',
            keywords: ['岗位聘任', '岗位变更', '人事', '聘任'],
            status: 'active',
            updatedAt: '2026-06-08 10:10'
        },
        {
            id: 'KB110',
            question: '职称评审材料何时提交？',
            summary: '职称评审材料提交通常以学校年度通知为准，分学院初审和学校复审两个阶段。',
            steps: [
                '关注人事部门发布的年度职称评审通知。',
                '按通知节点准备业绩成果、教学工作量和代表作材料。',
                '先完成学院初审与公示，再提交学校复审材料。',
                '逾期未提交的材料一般不再补报。'
            ],
            categoryId: 'teacher-title',
            keywords: ['职称评审', '材料提交', '初审', '复审'],
            status: 'active',
            updatedAt: '2026-06-12 08:30'
        },
        {
            id: 'KB111',
            question: '职称申报代表作如何认定？',
            summary: '代表作认定需符合学校职称文件要求，并与申报系列、岗位类型保持一致。',
            steps: [
                '核对申报通知中对代表作数量、署名和发表时间的要求。',
                '准备成果原件、检索证明和个人贡献说明。',
                '按学院要求完成形式审查和真实性承诺。',
                '特殊情况可提前向人事部门咨询认定口径。'
            ],
            categoryId: 'teacher-title',
            keywords: ['代表作', '职称申报', '成果认定', '检索证明'],
            status: 'active',
            updatedAt: '2026-06-11 09:25'
        },
        {
            id: 'KB112',
            question: '职称评审公示期有异议怎么反馈？',
            summary: '公示期内如对评审结果或材料认定存在异议，应在规定时限内通过正式渠道提交书面反馈。',
            steps: [
                '查看职称评审通知中的公示期限和受理方式。',
                '准备异议说明、事实依据和相关证明材料。',
                '向所在单位或人事部门提交书面反馈。',
                '按复核流程等待处理结果并留意补充通知。'
            ],
            categoryId: 'teacher-title',
            keywords: ['职称异议', '公示期', '复核', '反馈'],
            status: 'active',
            updatedAt: '2026-06-10 15:05'
        }
    ];

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function getCategoryMap() {
        return categories.reduce((map, item) => {
            map[item.id] = item;
            return map;
        }, {});
    }

    function buildDisplayTitle(entry) {
        return entry.question ? entry.question.replace(/[？?]$/, '') : (entry.categoryName || '知识条目');
    }

    function hydrateEntry(entry) {
        const category = getCategoryMap()[entry.categoryId] || {};
        const keywords = Array.isArray(entry.keywords)
            ? entry.keywords.map((item) => String(item || '').trim()).filter(Boolean)
            : [];
        const steps = Array.isArray(entry.steps)
            ? entry.steps.map((item) => String(item || '').trim()).filter(Boolean)
            : [];

        return {
            id: entry.id || `KB${Date.now()}`,
            question: String(entry.question || '').trim(),
            summary: String(entry.summary || entry.answer || '').trim(),
            steps,
            categoryId: entry.categoryId || '',
            categoryName: category.name || entry.categoryName || '',
            group: category.group || entry.group || 'student',
            groupName: category.groupName || entry.groupName || '学生知识',
            keywords,
            status: entry.status === 'inactive' ? 'inactive' : 'active',
            updatedAt: entry.updatedAt || DEFAULT_TIMESTAMP
        };
    }

    function readStoredEntries() {
        try {
            const raw = global.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            const source = Array.isArray(parsed)
                ? parsed
                : parsed && Array.isArray(parsed.entries)
                    ? parsed.entries
                    : null;

            if (!source) {
                return null;
            }

            return source.map(hydrateEntry);
        } catch (error) {
            return null;
        }
    }

    function getEntries() {
        const stored = readStoredEntries();
        if (stored && stored.length) {
            return stored;
        }
        return seedEntries.map(hydrateEntry);
    }

    function saveEntries(entries) {
        const normalizedEntries = (entries || []).map(hydrateEntry);
        try {
            global.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ version: 1, entries: normalizedEntries })
            );
        } catch (error) {
            return false;
        }
        return true;
    }

    function getActiveEntries() {
        return getEntries().filter((entry) => entry.status === 'active');
    }

    function getHomepageCategories() {
        return categories.map((item) => ({ ...item }));
    }

    function getCategoryQuestions() {
        return getActiveEntries().reduce((map, entry) => {
            if (!map[entry.categoryId]) {
                map[entry.categoryId] = [];
            }
            map[entry.categoryId].push(entry.question);
            return map;
        }, {});
    }

    function toAnswerPayload(entry) {
        return {
            id: entry.id,
            title: buildDisplayTitle(entry),
            content: entry.summary,
            steps: entry.steps.length ? [...entry.steps] : [entry.summary].filter(Boolean),
            category: entry.categoryId,
            categoryName: entry.categoryName,
            group: entry.group,
            groupName: entry.groupName,
            keywords: [...entry.keywords],
            question: entry.question,
            status: entry.status,
            updatedAt: entry.updatedAt
        };
    }

    function getAnswerMap() {
        return getActiveEntries().reduce((map, entry) => {
            map[entry.question] = toAnswerPayload(entry);
            return map;
        }, {});
    }

    function scoreEntry(entry, query) {
        const normalizedQuery = normalize(query);
        if (!normalizedQuery) {
            return 0;
        }

        let score = 0;
        const question = normalize(entry.question);
        const searchableTerms = [
            entry.question,
            entry.summary,
            entry.categoryName,
            entry.groupName,
            ...(entry.keywords || [])
        ];

        if (question === normalizedQuery) {
            score += 1000;
        }
        if (question.includes(normalizedQuery) || normalizedQuery.includes(question)) {
            score += 600;
        }

        searchableTerms.forEach((term) => {
            const normalizedTerm = normalize(term);
            if (!normalizedTerm) {
                return;
            }

            if (normalizedTerm === normalizedQuery) {
                score += 320;
            } else if (normalizedTerm.includes(normalizedQuery) || normalizedQuery.includes(normalizedTerm)) {
                score += 180;
            }
        });

        if (entry.group === 'teacher' && (normalizedQuery.includes('教师') || normalizedQuery.includes('老师'))) {
            score += 60;
        }
        if (entry.group === 'student' && (normalizedQuery.includes('学生') || normalizedQuery.includes('同学'))) {
            score += 30;
        }

        return score;
    }

    function findEntry(query) {
        const entries = getActiveEntries();
        let bestEntry = null;
        let bestScore = 0;

        entries.forEach((entry) => {
            const score = scoreEntry(entry, query);
            if (score > bestScore) {
                bestScore = score;
                bestEntry = entry;
            }
        });

        return bestEntry ? toAnswerPayload(bestEntry) : null;
    }

    function getCategoriesByGroup(group) {
        return categories
            .filter((item) => item.group === group)
            .map((item) => ({ ...item }));
    }

    global.campusKnowledgeBase = {
        getCategories: getHomepageCategories,
        getCategoriesByGroup,
        getCategoryMap,
        getEntries,
        getActiveEntries,
        saveEntries,
        getHomepageCategories,
        getCategoryQuestions,
        getAnswerMap,
        findEntry,
        hydrateEntry,
        clone
    };
})(window);
