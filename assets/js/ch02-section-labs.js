/*
 * 第 2 章分节互动实验室
 *
 * 每个组件都对应正文中的一个测量学问题。所有状态只保存在浏览器本地；
 * 组件由 Docsify 在章节渲染后挂载，因此学生小组可以复制结构、替换数据与反馈。
 */
(function () {
  'use strict';

  var prefix = 'iac-ch02-section-lab-v1:';

  function read(key, initial) {
    try {
      var stored = window.localStorage.getItem(prefix + key);
      return stored ? Object.assign({}, initial, JSON.parse(stored)) : Object.assign({}, initial);
    } catch (error) {
      return Object.assign({}, initial);
    }
  }

  function save(key, value) {
    try { window.localStorage.setItem(prefix + key, JSON.stringify(value)); } catch (error) { /* 本地存储不可用时仍可完成当前操作。 */ }
  }

  function reset(key) {
    try { window.localStorage.removeItem(prefix + key); } catch (error) { /* 无需处理。 */ }
  }

  function feedback(type, title, text) {
    return '<div class="section-lab-feedback section-lab-feedback--' + type + '" role="status" aria-live="polite"><strong>' + title + '</strong><p>' + text + '</p></div>';
  }

  function countTrue(object) {
    return Object.keys(object || {}).filter(function (key) { return object[key]; }).length;
  }

  function shell(kicker, title, objective, body, footer) {
    return '<section class="section-lab" aria-label="' + title + '"><header class="section-lab__header"><p>' + kicker + '</p><h4>' + title + '</h4><span>' + objective + '</span></header>' + body + (footer || '') + '</section>';
  }

  function linePath(points, width, height, pad) {
    var xs = points.map(function (point) { return point.x; });
    var ys = points.map(function (point) { return point.y; });
    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);
    var xRange = maxX - minX || 1;
    var yRange = maxY - minY || 1;
    return points.map(function (point, index) {
      var x = pad.left + (point.x - minX) / xRange * (width - pad.left - pad.right);
      var y = height - pad.bottom - (point.y - minY) / yRange * (height - pad.top - pad.bottom);
      return (index === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  }

  function dataObjectLab(root) {
    var initial = { layers: {}, reviewed: false };
    var state = read('object', initial);
    var layers = [
      { id: 'axis', title: '坐标层', detail: '400–760 nm、单位、间隔、方向与插值版本', why: '没有坐标，强度值没有物理位置；不同文件也无法可靠拼成同一列。' },
      { id: 'identity', title: '样品层', detail: 'sample_id、独立取样单位、制样/扫描重复类型', why: '它决定一行代表一个独立样品，还是同一样品的重复测量。' },
      { id: 'method', title: '测量层', detail: '仪器、积分时间、校准状态、批次与参照方法', why: '它让批次差异和标签不确定度能够被追溯、分层和检验。' },
      { id: 'history', title: '处理层', detail: '原始文件指针、空白/基线参数、软件与版本', why: '它让预处理成为可复现的方法步骤，而不是覆盖原始信号的修图。' }
    ];

    function draw() {
      var complete = layers.every(function (layer) { return state.layers[layer.id]; });
      var cards = layers.map(function (layer, index) {
        var selected = Boolean(state.layers[layer.id]);
        return '<button type="button" class="section-lab-card' + (selected ? ' is-selected' : '') + '" data-action="object-layer" data-id="' + layer.id + '" aria-pressed="' + selected + '"><span class="section-lab-card__index">' + (index + 1) + '</span><span><strong>' + layer.title + '</strong><small>' + layer.detail + '</small></span></button>';
      }).join('');
      var schema = layers.map(function (layer) {
        return '<div class="data-object-row ' + (state.layers[layer.id] ? 'is-filled' : 'is-empty') + '"><span>' + layer.title + '</span><code>' + (state.layers[layer.id] ? layer.detail : '尚未登记') + '</code></div>';
      }).join('');
      var review = state.reviewed ? feedback(complete ? 'success' : 'warning', complete ? '这是一条可解释的数据对象' : '这仍只是一组未落地的数字', complete ? '现在才可以谈“把它写成 X 的一行”。坐标、独立单位、测量条件和处理历史共同规定了这行数据能回答什么问题。' : '请补齐缺失层。注意：即便强度数组完整，样品身份或方法条件缺失时，它也不能被当作可独立验证的样本。') : '';
      var body = '<div class="section-lab__body"><p class="section-lab-lead">任务：从原始光谱数组中补齐可追溯的分析对象。点击每一层，把它纳入数据包。</p><div class="section-lab-grid section-lab-grid--cards">' + cards + '</div><div class="data-object-visual"><div class="data-object-spectrum"><span>原始信号</span><svg viewBox="0 0 280 74" aria-label="未标注坐标的光谱强度示意图" role="img"><path d="M8 58 C30 50 43 56 60 45 S89 18 109 40 S138 56 158 42 S192 9 214 27 S242 50 272 18" fill="none" stroke="#117eb1" stroke-width="4" stroke-linecap="round"/></svg><small>y = [0.23, 0.26, …]</small></div><div class="data-object-arrow" aria-hidden="true">＋</div><div class="data-object-schema">' + schema + '</div></div><div class="section-lab-actions"><button type="button" class="section-lab-primary" data-action="object-review">检查数据对象</button><button type="button" class="section-lab-secondary" data-action="object-reset">重置</button></div>' + review + '<p class="section-lab-caption">观察要点：建模矩阵只保存数值时，矩阵的形状仍在，化学问题却可能已经丢失。</p></div>';
      root.innerHTML = shell('2.1 数据结构实验室', '把一条谱图组装成数据对象', '目标：理解“矩阵的一行”需要哪些边界条件。', body);
    }

    root.onclick = function (event) {
      var target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'object-layer') { state.layers[target.getAttribute('data-id')] = !state.layers[target.getAttribute('data-id')]; state.reviewed = false; }
      if (action === 'object-review') state.reviewed = true;
      if (action === 'object-reset') { reset('object'); state = Object.assign({}, initial); }
      save('object', state); draw();
    };
    draw();
  }

  function qualityConsoleLab(root) {
    var initial = { view: 'censor', answers: {}, checked: false };
    var state = read('quality', initial);
    var cases = [
      { id: 'censor', label: '低于检出限', title: '一组低浓度结果显示为“< 0.02 mg/L”', action: 'censored', options: [['mean', '用全体均值填补，使表格没有空值'], ['censored', '保留删失区间，并按检出限机制建模']], why: '“低于检出限”不是随机缺失，更不是精确的零；它保留了样品位于一个区间内的信息。' },
      { id: 'outlier', label: '多变量异常', title: 'Q-118 在得分图中远离样本群，但单个波段都不越界', action: 'trace', options: [['delete', '删除它，因为它降低了交叉验证分数'], ['trace', '标记后回查原始文件、样品身份、仪器日志和重复测量']], why: '高维异常可能是录入/仪器错误，也可能是稀有但真实的样品。先定位来源，才谈剔除或扩展适用域。' },
      { id: 'repeat', label: '重复与方差', title: '方差分量估计：样品间 68%，批次间 22%，扫描误差 10%', action: 'sample', options: [['scan', '优先增加每个样品的扫描次数'], ['sample', '优先增加独立样品，并监控批次效应']], why: '当样品间差异远大于扫描误差时，更多扫描只会更精确地重复同一小部分样品，不能扩大模型的化学覆盖。' },
      { id: 'qc', label: '质量控制趋势', title: 'QC 峰面积尚在 ±3s 内，但连续 6 次低于稳定期均值', action: 'investigate', options: [['ignore', '未越界即可继续，不必记录'], ['investigate', '记录趋势并调查光源、内标、进样或环境变化']], why: '控制图用于发现漂移的早期证据。趋势尚未越界，不代表它没有改变下一批未知样品的测量条件。' }
    ];

    function visual(caseId) {
      if (caseId === 'censor') return '<svg class="quality-chart" viewBox="0 0 360 160" role="img" aria-label="低于检出限的左删失结果"><line x1="45" y1="20" x2="45" y2="130" class="chart-axis"/><line x1="45" y1="130" x2="340" y2="130" class="chart-axis"/><line x1="45" y1="98" x2="340" y2="98" class="chart-limit"/><text x="48" y="93">LOD 0.02</text><circle cx="92" cy="110" r="6" class="chart-dot chart-dot--muted"/><circle cx="123" cy="112" r="6" class="chart-dot chart-dot--muted"/><circle cx="154" cy="108" r="6" class="chart-dot chart-dot--muted"/><path d="M92 100v-11m-5 5 5-5 5 5 M123 100v-11m-5 5 5-5 5 5 M154 100v-11m-5 5 5-5 5 5" class="chart-censor"/><circle cx="220" cy="75" r="6" class="chart-dot"/><circle cx="260" cy="54" r="6" class="chart-dot"/><circle cx="304" cy="38" r="6" class="chart-dot"/><text x="190" y="151">样品顺序</text></svg>';
      if (caseId === 'outlier') return '<svg class="quality-chart" viewBox="0 0 360 160" role="img" aria-label="多变量得分图中的离群点"><line x1="40" y1="20" x2="40" y2="132" class="chart-axis"/><line x1="40" y1="132" x2="336" y2="132" class="chart-axis"/><text x="300" y="151">PC1</text><text x="12" y="25">PC2</text><ellipse cx="168" cy="82" rx="82" ry="38" class="chart-ellipse"/><circle cx="125" cy="92" r="5" class="chart-dot"/><circle cx="145" cy="72" r="5" class="chart-dot"/><circle cx="167" cy="94" r="5" class="chart-dot"/><circle cx="187" cy="62" r="5" class="chart-dot"/><circle cx="208" cy="86" r="5" class="chart-dot"/><circle cx="284" cy="38" r="7" class="chart-dot chart-dot--alert"/><text x="248" y="28">Q-118</text></svg>';
      if (caseId === 'repeat') return '<svg class="quality-chart" viewBox="0 0 360 160" role="img" aria-label="方差分量条形图"><line x1="54" y1="28" x2="54" y2="132" class="chart-axis"/><line x1="54" y1="132" x2="338" y2="132" class="chart-axis"/><rect x="78" y="55" width="55" height="77" class="chart-bar chart-bar--blue"/><rect x="164" y="107" width="55" height="25" class="chart-bar chart-bar--green"/><rect x="250" y="121" width="55" height="11" class="chart-bar chart-bar--orange"/><text x="77" y="150">样品 68%</text><text x="161" y="150">批次 22%</text><text x="245" y="150">扫描 10%</text></svg>';
      return '<svg class="quality-chart" viewBox="0 0 360 160" role="img" aria-label="质量控制样随时间缓慢下降"><line x1="42" y1="20" x2="42" y2="132" class="chart-axis"/><line x1="42" y1="132" x2="340" y2="132" class="chart-axis"/><line x1="42" y1="56" x2="340" y2="56" class="chart-limit"/><line x1="42" y1="94" x2="340" y2="94" class="chart-limit"/><line x1="42" y1="75" x2="340" y2="75" class="chart-mean"/><text x="47" y="72">稳定期均值</text><path d="M62 69 L96 72 L130 75 L164 79 L198 82 L232 86 L266 89 L300 93" class="chart-line chart-line--alert"/><circle cx="62" cy="69" r="4" class="chart-dot chart-dot--alert"/><circle cx="96" cy="72" r="4" class="chart-dot chart-dot--alert"/><circle cx="130" cy="75" r="4" class="chart-dot chart-dot--alert"/><circle cx="164" cy="79" r="4" class="chart-dot chart-dot--alert"/><circle cx="198" cy="82" r="4" class="chart-dot chart-dot--alert"/><circle cx="232" cy="86" r="4" class="chart-dot chart-dot--alert"/><circle cx="266" cy="89" r="4" class="chart-dot chart-dot--alert"/><circle cx="300" cy="93" r="4" class="chart-dot chart-dot--alert"/><text x="278" y="151">测量顺序</text></svg>';
    }

    function draw() {
      var active = cases.filter(function (item) { return item.id === state.view; })[0];
      var score = cases.filter(function (item) { return state.answers[item.id] === item.action; }).length;
      var tabs = cases.map(function (item) { return '<button type="button" class="section-lab-tab' + (state.view === item.id ? ' is-selected' : '') + '" data-action="quality-view" data-id="' + item.id + '" aria-pressed="' + (state.view === item.id) + '">' + item.label + '</button>'; }).join('');
      var options = active.options.map(function (option, index) {
        var selected = state.answers[active.id] === option[0];
        var status = state.checked && selected ? (option[0] === active.action ? ' is-correct' : ' is-incorrect') : '';
        return '<button type="button" class="section-lab-choice' + (selected ? ' is-selected' : '') + status + '" data-action="quality-answer" data-id="' + option[0] + '" aria-pressed="' + selected + '"><b>' + String.fromCharCode(65 + index) + '</b><span>' + option[1] + '</span></button>';
      }).join('');
      var activeFeedback = state.checked && state.answers[active.id] ? feedback(state.answers[active.id] === active.action ? 'success' : 'warning', state.answers[active.id] === active.action ? '行动与数据机制匹配' : '先不要把它粗暴地称为“坏数据”', active.why) : '';
      var finalFeedback = state.checked ? feedback(score === 4 ? 'success' : 'warning', '审计记录：' + score + ' / 4 个判断成立', score === 4 ? '很好。质量审计不是删除不顺眼的记录，而是把数据现象还原为可回查的测量机制。' : '逐一切换四种视图。每一种现象都需要不同的证据、不同的模型假设和不同的处理行动。') : '';
      var body = '<div class="section-lab__body"><p class="section-lab-lead">任务：先读图，再选择第一步行动。这里的“正确”不是某个软件按钮，而是把异常现象连接到它可能的来源。</p><div class="section-lab-tabs" role="tablist" aria-label="质量审计视图">' + tabs + '</div><div class="quality-console"><div>' + visual(active.id) + '<p class="section-lab-caption">' + active.title + '</p></div><div class="quality-console__decision"><h5>你首先会怎样处理？</h5>' + options + activeFeedback + '</div></div><div class="section-lab-actions"><button type="button" class="section-lab-primary" data-action="quality-check">审查本轮判断</button><button type="button" class="section-lab-secondary" data-action="quality-reset">重置</button></div>' + finalFeedback + '</div>';
      root.innerHTML = shell('2.2 数据质量审计', '质量控制室', '目标：把异常现象追溯到缺失机制、测量层级或时间漂移。', body);
    }

    root.onclick = function (event) {
      var target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'quality-view') { state.view = target.getAttribute('data-id'); state.checked = false; }
      if (action === 'quality-answer') { state.answers[state.view] = target.getAttribute('data-id'); state.checked = false; }
      if (action === 'quality-check') state.checked = true;
      if (action === 'quality-reset') { reset('quality'); state = Object.assign({}, initial); }
      save('quality', state); draw();
    };
    draw();
  }

  function preprocessingLab(root) {
    var initial = { baseline: false, window: 1, normalise: false };
    var state = read('preprocess', initial);

    function gaussian(x, center, width, height) { return height * Math.exp(-Math.pow((x - center) / width, 2)); }
    function points() {
      var values = [];
      for (var index = 0; index <= 72; index += 1) {
        var x = 400 + index * 5;
        var base = 0.26 + 0.0012 * (x - 400) + 0.0000010 * Math.pow(x - 585, 2);
        var y = base + gaussian(x, 520, 24, 0.72) + gaussian(x, 650, 37, 1.00) + 0.048 * Math.sin(index * 2.3) + 0.023 * Math.sin(index * 5.5);
        values.push({ x: x, y: state.baseline ? y - base : y });
      }
      if (state.window > 1) {
        var radius = Math.floor(state.window / 2);
        values = values.map(function (point, index) {
          var start = Math.max(0, index - radius); var end = Math.min(values.length - 1, index + radius); var sum = 0;
          for (var cursor = start; cursor <= end; cursor += 1) sum += values[cursor].y;
          return { x: point.x, y: sum / (end - start + 1) };
        });
      }
      if (state.normalise) {
        var max = Math.max.apply(null, values.map(function (point) { return point.y; }));
        values = values.map(function (point) { return { x: point.x, y: point.y / max }; });
      }
      return values;
    }

    function spectrumSvg(data) {
      var path = linePath(data, 600, 220, { left: 48, right: 18, top: 18, bottom: 34 });
      return '<svg class="process-spectrum" viewBox="0 0 600 220" role="img" aria-label="根据所选参数变化的光谱"><rect width="600" height="220" rx="10" class="process-spectrum__background"/><line x1="48" y1="62" x2="582" y2="62" class="process-spectrum__grid"/><line x1="48" y1="105" x2="582" y2="105" class="process-spectrum__grid"/><line x1="48" y1="148" x2="582" y2="148" class="process-spectrum__grid"/><path d="' + path + '" class="process-spectrum__line"/><text x="45" y="205">400</text><text x="274" y="205">波长 / nm</text><text x="548" y="205">760</text><text x="12" y="24">强度</text></svg>';
    }

    function draw() {
      var data = points();
      var peak = Math.max.apply(null, data.map(function (point) { return point.y; }));
      var area = data.reduce(function (sum, point) { return sum + Math.max(0, point.y); }, 0) * 5;
      var risk = state.normalise ? '已主动移除全局尺度；绝对浓度任务必须验证这不是目标信息。' : (state.baseline ? '宽背景已按“缓慢变化、非目标”假设移除；应检查宽峰是否被误扣。' : '原始尺度仍包含背景与强度信息；尚不能判断哪一部分属于目标物。');
      if (state.window >= 7) risk += ' 当前窗口较宽，需特别复核峰高和半峰宽。';
      var body = '<div class="section-lab__body"><p class="section-lab-lead">情境：用谱图预测水样的<strong>绝对浓度</strong>。调整参数时，同时观察曲线和被改变的量。</p><div class="preprocess-layout"><div><div class="process-control"><button type="button" class="section-lab-toggle' + (state.baseline ? ' is-selected' : '') + '" data-action="process-baseline" aria-pressed="' + state.baseline + '">基线校正：' + (state.baseline ? '开' : '关') + '</button><button type="button" class="section-lab-toggle' + (state.normalise ? ' is-selected' : '') + '" data-action="process-normalise" aria-pressed="' + state.normalise + '">向量归一化：' + (state.normalise ? '开' : '关') + '</button></div><label class="process-slider" for="process-window">平滑窗口：<output>' + state.window + ' 点</output><input id="process-window" data-action="process-window" type="range" min="1" max="11" step="2" value="' + state.window + '"><small>窗口变宽会压低随机起伏，也可能削弱窄峰。</small></label>' + spectrumSvg(data) + '</div><aside class="process-readout"><h5>当前读数</h5><dl><div><dt>最大强度</dt><dd>' + peak.toFixed(3) + '</dd></div><div><dt>正信号面积</dt><dd>' + area.toFixed(2) + '</dd></div><div><dt>平滑窗口</dt><dd>' + state.window + ' 点</dd></div></dl><p>' + risk + '</p></aside></div><div class="section-lab-callout"><strong>实验问题：</strong>若模型只在“已归一化”的训练数据上表现很好，仍需要回到独立样品，检查误差是否在低浓度处系统增大。</div><div class="section-lab-actions"><button type="button" class="section-lab-secondary" data-action="process-reset">恢复原始信号</button></div></div>';
      root.innerHTML = shell('2.3 预处理的机制与边界', '预处理实验台', '目标：把每一步处理看成一个关于信号来源的可检验假设。', body);
    }

    root.onclick = function (event) {
      var target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'process-baseline') state.baseline = !state.baseline;
      if (action === 'process-normalise') state.normalise = !state.normalise;
      if (action === 'process-reset') { reset('preprocess'); state = Object.assign({}, initial); }
      save('preprocess', state); draw();
    };
    root.oninput = function (event) {
      if (event.target && event.target.getAttribute('data-action') === 'process-window') {
        state.window = Number(event.target.value); save('preprocess', state); draw();
      }
    };
    draw();
  }

  function diagnosticStudioLab(root) {
    var initial = { view: 'overlay', colour: 'batch', note: '' };
    var state = read('diagnostic', initial);
    var views = [
      { id: 'overlay', label: '原始叠图', expected: 'signal', prompt: '先核对基线与峰位是否在批次之间整体变化。' },
      { id: 'projection', label: '低维投影', expected: 'batch', prompt: '再检查分离是否只是仪器批次或日期的投影。' },
      { id: 'residual', label: '残差图', expected: 'residual', prompt: '最后检查误差是否随预测值、浓度或时间呈系统结构。' }
    ];
    var notes = [
      { id: 'signal', label: '回看原始信号、空白和坐标校准' },
      { id: 'batch', label: '按批次/日期着色，并重新设计独立验证' },
      { id: 'residual', label: '检查非线性、饱和、异方差或模型漂移' }
    ];

    function chart(active) {
      if (active.id === 'overlay') return '<svg class="diagnostic-chart" viewBox="0 0 520 210" role="img" aria-label="不同批次的原始光谱叠图"><rect width="520" height="210" rx="10" class="diagnostic-chart__background"/><path d="M35 158 C75 148 93 157 125 129 S165 55 200 117 S252 151 284 112 S337 39 370 80 S418 139 486 51" class="diagnostic-line diagnostic-line--blue"/><path d="M35 150 C75 143 93 152 125 120 S165 49 200 109 S252 143 284 105 S337 32 370 75 S418 131 486 45" class="diagnostic-line diagnostic-line--green"/><path d="M35 167 C75 157 93 166 125 137 S165 64 200 126 S252 160 284 121 S337 48 370 90 S418 148 486 61" class="diagnostic-line diagnostic-line--orange"/><text x="35" y="198">400 nm</text><text x="435" y="198">760 nm</text><text x="344" y="22">批次 A / B / C</text></svg>';
      if (active.id === 'projection') return '<svg class="diagnostic-chart" viewBox="0 0 520 210" role="img" aria-label="按批次或浓度着色的低维投影"><line x1="56" y1="22" x2="56" y2="173" class="chart-axis"/><line x1="56" y1="173" x2="495" y2="173" class="chart-axis"/><text x="468" y="197">PC1</text><text x="23" y="30">PC2</text><ellipse cx="213" cy="101" rx="125" ry="53" class="chart-ellipse"/>' + (state.colour === 'batch' ? '<circle cx="145" cy="118" r="7" class="chart-dot"/><circle cx="171" cy="83" r="7" class="chart-dot"/><circle cx="194" cy="109" r="7" class="chart-dot"/><circle cx="277" cy="92" r="7" class="chart-dot chart-dot--green"/><circle cx="301" cy="122" r="7" class="chart-dot chart-dot--green"/><circle cx="324" cy="76" r="7" class="chart-dot chart-dot--green"/><text x="110" y="43">日期 1</text><text x="304" y="48">日期 3</text>' : '<circle cx="145" cy="118" r="7" class="chart-dot chart-dot--muted"/><circle cx="171" cy="83" r="7" class="chart-dot chart-dot--muted"/><circle cx="194" cy="109" r="7" class="chart-dot chart-dot--muted"/><circle cx="277" cy="92" r="7" class="chart-dot chart-dot--orange"/><circle cx="301" cy="122" r="7" class="chart-dot chart-dot--orange"/><circle cx="324" cy="76" r="7" class="chart-dot chart-dot--orange"/><text x="108" y="43">低浓度</text><text x="300" y="48">高浓度</text>') + '</svg>';
      return '<svg class="diagnostic-chart" viewBox="0 0 520 210" role="img" aria-label="预测残差随预测值增大的图"><line x1="55" y1="25" x2="55" y2="172" class="chart-axis"/><line x1="55" y1="102" x2="495" y2="102" class="chart-mean"/><line x1="55" y1="172" x2="495" y2="172" class="chart-axis"/><text x="410" y="198">预测浓度</text><text x="13" y="31">残差</text><circle cx="95" cy="97" r="5" class="chart-dot"/><circle cx="138" cy="89" r="5" class="chart-dot"/><circle cx="180" cy="109" r="5" class="chart-dot"/><circle cx="224" cy="80" r="5" class="chart-dot"/><circle cx="270" cy="121" r="5" class="chart-dot chart-dot--green"/><circle cx="316" cy="64" r="5" class="chart-dot chart-dot--green"/><circle cx="362" cy="137" r="5" class="chart-dot chart-dot--green"/><circle cx="406" cy="48" r="5" class="chart-dot chart-dot--alert"/><circle cx="450" cy="155" r="5" class="chart-dot chart-dot--alert"/><path d="M88 101 Q270 80 460 115" class="chart-line chart-line--alert"/></svg>';
    }

    function draw() {
      var active = views.filter(function (view) { return view.id === state.view; })[0];
      var currentNote = notes.filter(function (note) { return note.id === state.note; })[0];
      var viewButtons = views.map(function (view) { return '<button type="button" class="section-lab-tab' + (state.view === view.id ? ' is-selected' : '') + '" data-action="diagnostic-view" data-id="' + view.id + '" aria-pressed="' + (state.view === view.id) + '">' + view.label + '</button>'; }).join('');
      var colour = state.view === 'projection' ? '<div class="diagnostic-colour"><span>着色变量：</span><button type="button" class="section-lab-chip' + (state.colour === 'batch' ? ' is-selected' : '') + '" data-action="diagnostic-colour" data-id="batch" aria-pressed="' + (state.colour === 'batch') + '">采集批次</button><button type="button" class="section-lab-chip' + (state.colour === 'concentration' ? ' is-selected' : '') + '" data-action="diagnostic-colour" data-id="concentration" aria-pressed="' + (state.colour === 'concentration') + '">参照浓度</button></div>' : '';
      var noteButtons = notes.map(function (note) { return '<button type="button" class="section-lab-choice section-lab-choice--compact' + (state.note === note.id ? ' is-selected' : '') + '" data-action="diagnostic-note" data-id="' + note.id + '" aria-pressed="' + (state.note === note.id) + '">' + note.label + '</button>'; }).join('');
      var response = currentNote ? feedback(currentNote.id === active.expected ? 'success' : 'warning', currentNote.id === active.expected ? '这张图的用途判断准确' : '这张图还不足以支持这一行动', active.prompt) : '';
      var body = '<div class="section-lab__body"><p class="section-lab-lead">切换图形，并把你最先要做的诊断行动写进本次阅片记录。注意：图形是线索，而不是替代原始记录的证据。</p><div class="section-lab-tabs" role="tablist" aria-label="诊断图类型">' + viewButtons + '</div>' + colour + '<div class="diagnostic-layout">' + chart(active) + '<div class="diagnostic-note"><h5>这张图首先提示你：</h5>' + noteButtons + response + '</div></div><p class="section-lab-caption">' + active.prompt + ' 低维图中的“分群”本身不等于化学类别分离，必须回到批次、样品与原始变量。</p><div class="section-lab-actions"><button type="button" class="section-lab-secondary" data-action="diagnostic-reset">重置阅片记录</button></div></div>';
      root.innerHTML = shell('2.4 可视化作为诊断工具', '诊断图阅片室', '目标：为不同图形指定合适的问题，而不是用一张漂亮图替代验证。', body);
    }

    root.onclick = function (event) {
      var target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'diagnostic-view') state.view = target.getAttribute('data-id');
      if (action === 'diagnostic-colour') state.colour = target.getAttribute('data-id');
      if (action === 'diagnostic-note') state.note = target.getAttribute('data-id');
      if (action === 'diagnostic-reset') { reset('diagnostic'); state = Object.assign({}, initial); }
      save('diagnostic', state); draw();
    };
    draw();
  }

  function pipelineBuilderLab(root) {
    var initial = { steps: [], message: '', done: false };
    var state = read('pipeline', initial);
    var stages = [
      { id: 'identity', title: '建立样品主表与文件映射', reason: '先明确独立样品单位，才能避免一份样品的重复扫描被当作多份独立证据。' },
      { id: 'audit', title: '检查坐标、单位、缺失、饱和与重复，并回查原始记录', reason: '先校验测量对象，避免错误文件进入后续统计或被数学处理掩盖。' },
      { id: 'split', title: '按独立样品、日期或仪器批次划分训练、验证与测试', reason: '先定义未来使用场景，才能防止总体分布与近邻重复记录泄漏到测试集。' },
      { id: 'fit', title: '只在训练集拟合插补、缩放、基线与特征选择参数', reason: '这是所有学习型预处理的边界；测试集只能接受已冻结的变换。' },
      { id: 'apply', title: '用冻结参数变换验证/测试数据，并保留数据谱系', reason: '这一步使处理结果可复现，也能显示不同批次是否仍在适用范围内。' },
      { id: 'package', title: '输出建模矩阵、质量标记、参数日志与审计报告', reason: '只有把矩阵与它的来历一起交付，下一章的模型性能才可解释、可维护。' }
    ];

    function draw() {
      var expected = stages[state.steps.length];
      var done = state.steps.length === stages.length;
      var board = stages.map(function (stage, index) {
        var position = state.steps.indexOf(stage.id);
        var completed = position >= 0;
        var next = !done && expected.id === stage.id;
        return '<button type="button" class="pipeline-card' + (completed ? ' is-complete' : '') + (next ? ' is-next' : '') + '" data-action="pipeline-step" data-id="' + stage.id + '" ' + (completed || done ? 'disabled' : '') + '><span>' + (completed ? '✓' : (index + 1)) + '</span><strong>' + stage.title + '</strong><small>' + (completed ? stage.reason : (next ? '现在应执行此步' : '等待前置条件')) + '</small></button>';
      }).join('');
      var timeline = state.steps.length ? state.steps.map(function (id, index) { var stage = stages.filter(function (item) { return item.id === id; })[0]; return '<li><span>' + (index + 1) + '</span>' + stage.title + '</li>'; }).join('') : '<li class="is-empty">从第一步开始组装流程。</li>';
      var report = state.done ? feedback('success', '流程已经可交付给建模阶段', '你先固定了独立单位和数据边界，再隔离错误、定义外推检验、在训练集内学习处理参数，最后把矩阵与谱系一起交付。') : (state.message ? feedback('warning', '顺序需要调整', state.message) : '');
      var body = '<div class="section-lab__body"><p class="section-lab-lead">任务：每次只选择下一步。系统会阻止可能造成数据泄露或不可逆信息损失的跳步。</p><div class="pipeline-layout"><div class="pipeline-board">' + board + '</div><aside class="pipeline-timeline"><h5>已完成的证据链</h5><ol>' + timeline + '</ol></aside></div><div class="section-lab-actions"><button type="button" class="section-lab-secondary" data-action="pipeline-reset">重新装配</button></div>' + report + '</div>';
      root.innerHTML = shell('2.5 从文件到建模矩阵', '建模矩阵装配线', '目标：理解数据划分、预处理学习与审计记录的先后依赖。', body);
    }

    root.onclick = function (event) {
      var target = event.target.closest('[data-action]');
      if (!target || !root.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'pipeline-reset') { reset('pipeline'); state = Object.assign({}, initial); save('pipeline', state); draw(); return; }
      if (action !== 'pipeline-step') return;
      var expected = stages[state.steps.length];
      if (target.getAttribute('data-id') === expected.id) {
        state.steps.push(expected.id); state.message = ''; state.done = state.steps.length === stages.length;
      } else {
        state.message = '“' + target.querySelector('strong').textContent + '”还不能先做。' + expected.reason;
      }
      save('pipeline', state); draw();
    };
    draw();
  }

  function mountSectionLabs() {
    document.querySelectorAll('.interactive-lab[data-lab]').forEach(function (root) {
      if (root.getAttribute('data-section-mounted') === 'true') return;
      var name = root.getAttribute('data-lab');
      var renderer = {
        'ch02-data-object': dataObjectLab,
        'ch02-quality-console': qualityConsoleLab,
        'ch02-preprocessing-bench': preprocessingLab,
        'ch02-diagnostic-studio': diagnosticStudioLab,
        'ch02-pipeline-builder': pipelineBuilderLab
      }[name];
      if (renderer) { root.setAttribute('data-section-mounted', 'true'); renderer(root); }
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
    hook.doneEach(function () { window.requestAnimationFrame(mountSectionLabs); });
    hook.mounted(function () { window.requestAnimationFrame(mountSectionLabs); });
  });
  document.addEventListener('DOMContentLoaded', mountSectionLabs);
}());
