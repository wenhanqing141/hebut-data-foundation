(function () {
  function toast(message) {
    var node = document.querySelector(".toast");
    if (!node) return;
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(function () { node.classList.remove("show"); }, 1600);
  }

  document.querySelectorAll("[data-action]").forEach(function (button) {
    button.addEventListener("click", function () { toast(button.dataset.action); });
  });

  var enableButton = document.querySelector("[data-enable]");
  document.querySelectorAll("[data-status]").forEach(function (statusNode) { statusNode.remove(); });
  if (enableButton) {
    var status = document.querySelector("[data-status]");
    var label = enableButton.querySelector("[data-enable-label]");
    enableButton.setAttribute("role", "switch");
    function syncEnableState(enabled) {
      enableButton.dataset.enabled = String(enabled);
      enableButton.setAttribute("aria-checked", String(enabled));
      if (label) label.textContent = enabled ? "启用中" : "未启用";
      if (status) status.hidden = true;
    }
    enableButton.addEventListener("click", function () {
      var enabled = enableButton.dataset.enabled !== "true";
      syncEnableState(enabled);
      toast(enabled ? "表单已启用" : "表单已关闭");
    });
    syncEnableState(enableButton.dataset.enabled === "true");
  }

  var modeButtons = document.querySelectorAll("[data-mode]");
  if (modeButtons.length) {
    var empty = document.querySelector("[data-empty-state]");
    var ready = document.querySelector("[data-ready-state]");
    var permission = document.querySelector("[data-permission]");
    var leftEmpty = document.querySelector("[data-left-empty]");
    var leftCreated = document.querySelector("[data-left-created]");
    var navActions = document.querySelectorAll("[data-nav-action]");
    function setMode(mode) {
      modeButtons.forEach(function (button) { button.classList.toggle("active", button.dataset.mode === mode); });
      if (empty) empty.hidden = mode !== "empty";
      if (ready) ready.hidden = mode !== "ready";
      if (leftEmpty) leftEmpty.hidden = mode !== "empty";
      if (leftCreated) leftCreated.hidden = mode !== "ready";
      if (permission) permission.disabled = mode === "empty";
      navActions.forEach(function (button) { button.disabled = mode === "empty"; });
    }
    modeButtons.forEach(function (button) { button.addEventListener("click", function () { setMode(button.dataset.mode); }); });
    setMode(document.querySelector(".segmented") ? "ready" : "empty");
  }

  var modal = document.querySelector("[data-modal]");
  if (modal) {
    modal.innerHTML = '<div class="modal permission-modal"><div class="permission-modal-header"><span class="permission-modal-icon">▣</span><h2>权限设置</h2><button class="permission-close" type="button" data-close-modal aria-label="关闭">×</button></div><div class="permission-modal-body"><div class="permission-intro"><div class="permission-intro-copy"><span class="permission-intro-icon">♟</span><span>为角色配置前台左侧栏可见的分类和表单</span><span class="permission-hint">💡 勾选父级会自动全选其下所有子项，取消同理。</span></div><button class="button primary" type="button" data-action="添加角色入口">＋ 添加角色</button></div><div class="permission-role is-open"><div class="permission-role-header"><button class="permission-role-toggle" type="button" aria-expanded="true">⌄ <strong>管理员</strong></button><button class="permission-role-remove" type="button" aria-label="移除管理员">×</button></div><div class="permission-role-content"><label class="permission-check level-0"><input type="checkbox" data-permission-check="base"><span class="permission-item-icon">▱</span><span>基础数据表</span><span class="permission-type">分类</span></label><label class="permission-check level-1"><input type="checkbox" checked data-permission-check="staff"><span class="permission-item-icon">▱</span><span>教职工基本信息</span><span class="permission-type">分类</span></label><label class="permission-check level-2"><input type="checkbox" checked data-permission-check="leader"><span class="permission-item-icon">□</span><span>校领导信息</span><span class="permission-type">表单</span></label><label class="permission-check level-2"><input type="checkbox" checked data-permission-check="manager"><span class="permission-item-icon">□</span><span>管理人员信息</span><span class="permission-type">表单</span></label><label class="permission-check level-2"><input type="checkbox" checked data-permission-check="teacher"><span class="permission-item-icon">□</span><span>教师基本信息</span><span class="permission-type">表单</span></label><label class="permission-check level-1"><input type="checkbox" data-permission-check="student"><span class="permission-item-icon">□</span><span>学生基本信息</span><span class="permission-type">表单</span></label><label class="permission-check level-1"><input type="checkbox" data-permission-check="course"><span class="permission-item-icon">□</span><span>课程信息</span><span class="permission-type">表单</span></label></div></div><div class="permission-role"><div class="permission-role-header"><button class="permission-role-toggle" type="button" aria-expanded="false">› <strong>人事处</strong></button><button class="permission-role-remove" type="button" aria-label="移除人事处">×</button></div><div class="permission-role-content" hidden></div></div><div class="permission-role"><div class="permission-role-header"><button class="permission-role-toggle" type="button" aria-expanded="false">› <strong>教务处</strong></button><button class="permission-role-remove" type="button" aria-label="移除教务处">×</button></div><div class="permission-role-content" hidden></div></div></div><div class="permission-modal-footer"><span>● 权限变更后立即生效，前台用户刷新即可看到</span><div class="modal-footer"><button class="button" type="button" data-close-modal>取消</button><button class="button primary" type="button" data-permission-save>保存设置</button></div></div></div>';
    var permissionButton = document.querySelector("[data-permission]");
    if (permissionButton) permissionButton.addEventListener("click", function () { if (!this.disabled) modal.classList.add("open"); });
    document.querySelectorAll("[data-close-modal]").forEach(function (button) { button.addEventListener("click", function () { modal.classList.remove("open"); }); });
    var savePermission = modal.querySelector("[data-permission-save]");
    if (savePermission) savePermission.addEventListener("click", function () { modal.classList.remove("open"); toast("权限设置已保存"); });
    modal.querySelectorAll(".permission-role-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        var role = button.closest(".permission-role");
        var content = role && role.querySelector(".permission-role-content");
        var expanded = button.getAttribute("aria-expanded") === "true";
        if (content) content.hidden = expanded;
        button.setAttribute("aria-expanded", String(!expanded));
        button.firstChild.textContent = expanded ? "› " : "⌄ ";
        if (role) role.classList.toggle("is-open", !expanded);
      });
    });
    modal.querySelectorAll("[data-permission-check]").forEach(function (input) {
      input.addEventListener("change", function () {
        var key = input.dataset.permissionCheck;
        if (key === "base" || key === "staff") {
          var descendants = modal.querySelectorAll("[data-permission-check]");
          descendants.forEach(function (item) { if (key === "base" || item.dataset.permissionCheck === "leader" || item.dataset.permissionCheck === "manager" || item.dataset.permissionCheck === "teacher") item.checked = input.checked; });
        }
      });
    });
  }

  var navTree = document.querySelector("[data-nav-tree]");
  if (navTree) {
    var navTip = document.querySelector(".nav-tip");
    if (navTip) navTip.remove();
    var navCard = navTree.closest(".nav-card");
    var selectedNode = null;
    var newNodeIndex = 1;

    function nodeLevel(node) { return Number(node.dataset.level || 0); }
    function nodeLabel(node) { var label = node.querySelector(":scope > .nav-row .nav-label"); return label ? label.textContent.trim() : ""; }
    function parentNode(node) { return node.parentElement ? node.parentElement.closest(".tree-node") : null; }
    function childList(node) {
      var list = node.querySelector(":scope > .tree-children");
      if (!list) { list = document.createElement("div"); list.className = "tree-children"; node.appendChild(list); }
      return list;
    }
    function hasChildren(node) {
      var list = node ? node.querySelector(":scope > .tree-children") : null;
      return !!(list && list.children.length);
    }
    function ensureToggle(node) {
      if (!node) return;
      var row = node.querySelector(":scope > .nav-row");
      if (!row || row.querySelector("[data-nav-toggle]")) return;
      var spacer = row.querySelector(":scope > .nav-disclosure.empty");
      var toggle = document.createElement("button");
      toggle.className = "nav-disclosure";
      toggle.type = "button";
      toggle.dataset.navToggle = "true";
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "展开或收起子级");
      toggle.textContent = "⌃";
      if (spacer) spacer.replaceWith(toggle); else row.prepend(toggle);
    }
    function setExpanded(node, expanded, collapsePeers) {
      if (!hasChildren(node)) return;
      var list = childList(node);
      var toggle = node.querySelector(":scope > .nav-row [data-nav-toggle]");
      if (collapsePeers && expanded && node.parentElement) {
        node.parentElement.querySelectorAll(":scope > .tree-node").forEach(function (peer) {
          if (peer !== node) setExpanded(peer, false, false);
        });
      }
      list.hidden = !expanded;
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(expanded));
        toggle.textContent = expanded ? "⌃" : "⌄";
      }
      node.classList.toggle("expanded", expanded);
    }
    function updateDepth(node, level) {
      node.dataset.level = String(level);
      node.querySelector(":scope > .nav-row").style.setProperty("--nav-depth", String(level));
      node.querySelectorAll(":scope > .tree-children > .tree-node").forEach(function (child) { updateDepth(child, level + 1); });
    }
    function updateTitle(node) {
      var title = document.querySelector("[data-nav-context-title]");
      if (title && node) title.textContent = nodeLabel(node).replace(/：/g, " ");
    }
    function updateControls() {
      var selectedLevel = selectedNode ? nodeLevel(selectedNode) : 0;
      var childButton = navCard && navCard.querySelector('[data-nav-action="child"]');
      if (childButton) {
        childButton.disabled = selectedLevel >= 5;
        childButton.title = selectedLevel >= 5 ? "已达到 5 级，不能继续创建子级" : "新增当前选中节点的子级";
      }
    }
    function selectNode(node) {
      if (!node) return;
      navTree.querySelectorAll(".nav-row.selected").forEach(function (row) { row.classList.remove("selected"); });
      var row = node.querySelector(":scope > .nav-row");
      if (row) row.classList.add("selected");
      selectedNode = node;
      updateTitle(node);
      updateControls();
    }
    function createNode(label, level, kind) {
      var node = document.createElement("div");
      node.className = "tree-node";
      node.dataset.level = String(level);
      node.dataset.kind = kind || "category";
      node.draggable = navCard.classList.contains("is-sorting");
      var icon = level === 1 ? '<span class="nav-icon">▱</span>' : '';
      node.innerHTML = '<div class="tree-row nav-row" data-nav-select>' + (kind === "table" ? '<span class="nav-disclosure empty"></span>' : '<button class="nav-disclosure" type="button" data-nav-toggle aria-expanded="true" aria-label="展开或收起子级">⌄</button>') + icon + '<span class="nav-label"></span><span class="nav-actions"><button class="nav-action" type="button" data-nav-edit aria-label="编辑导航名称">✎</button><button class="nav-action danger" type="button" data-nav-delete aria-label="删除导航项">⌫</button></span></div><div class="tree-children"></div>';
      node.querySelector(".nav-label").textContent = label;
      node.querySelector(":scope > .nav-row").style.setProperty("--nav-depth", String(level));
      return node;
    }
    function renderInitialTree() {
      var groups = [
        ["1. 学校基本信息", ["学校名称", "学校代码", "学校地址", "学校层次"]],
        ["2. 办学基本条件", ["校区信息", "教室信息", "实验室信息", "设备信息"]],
        ["3. 政教育情况", ["教育类型", "培养层次", "教育项目", "教育统计"]],
        ["4. 教职工基本信息", ["表4-1：校领导信息", "表4-2：管理人员信息", "教师基本信息", "教职工联系方式"]],
        ["5. 学生基本信息", ["学生信息", "学籍信息", "班级信息", "联系方式"]],
        ["6. 学科专业基本信息", ["学科信息", "专业信息", "培养方案", "学位信息"]],
        ["7. 科研与学术信息", ["科研项目", "科研成果", "学术活动", "论文信息"]],
        ["8. 校园基础信息", ["部门信息", "楼宇信息", "房间信息", "校园资源"]]
      ];
      navTree.innerHTML = "";
      var root = createNode("基础数据表", 0, "category");
      navTree.appendChild(root);
      groups.forEach(function (group) {
        var category = createNode(group[0], 1, "category");
        var list = childList(root);
        list.appendChild(category);
        group[1].forEach(function (label) { childList(category).appendChild(createNode(label, 2, "table")); });
      });
    }
    function sameLevelList(node) { var parent = parentNode(node); return parent ? childList(parent) : navTree; }
    function addNode(type) {
      var current = selectedNode || navTree.querySelector(".tree-node");
      var currentLevel = current ? nodeLevel(current) : 0;
      var nextLevel = type === "child" ? currentLevel + 1 : currentLevel;
      if (type === "child" && nextLevel > 5) { toast("最多支持 5 级分类"); return; }
      var parent = type === "child" ? current : parentNode(current);
      var list = parent ? childList(parent) : navTree;
      var label = type === "child" ? "基础数据表" : (currentLevel === 0 ? "新建分类" : "新建同级项");
      var kind = nextLevel >= 2 ? "table" : "category";
      var node = createNode(label + (type === "sibling" ? " " + newNodeIndex++ : ""), nextLevel, kind);
      list.appendChild(node);
      if (type === "child") { ensureToggle(current); setExpanded(current, true, true); }
      selectNode(node);
      toast(type === "child" ? "已创建子级标签" : "已创建同级标签");
    }
    function removeNode(node) {
      if (!node || nodeLevel(node) === 0) { toast("基础数据表为默认根节点，不能删除"); return; }
      var fallback = parentNode(node) || navTree.querySelector(".tree-node");
      node.remove();
      selectNode(fallback);
      toast("导航标签已删除");
    }
    function editNode(node) {
      var label = nodeLabel(node);
      var next = window.prompt("编辑导航名称", label);
      if (next && next.trim()) { node.querySelector(":scope > .nav-row .nav-label").textContent = next.trim(); updateTitle(node); toast("导航名称已更新"); }
    }
    renderInitialTree();
    navTree.querySelectorAll(".tree-node").forEach(function (node) { updateDepth(node, nodeLevel(node)); node.draggable = false; });
    navTree.querySelectorAll(".nav-label").forEach(function (label) { if (label.textContent.trim() === "表4-1：校领导信息") selectedNode = label.closest(".tree-node"); });
    if (!selectedNode) selectedNode = navTree.querySelector(".tree-node");
    selectNode(selectedNode);
    var rootNode = navTree.querySelector(":scope > .tree-node");
    setExpanded(rootNode, true, false);
    var selectedParent = parentNode(selectedNode);
    if (selectedParent && nodeLevel(selectedParent) === 1) setExpanded(selectedParent, true, true);

    navTree.addEventListener("click", function (event) {
      var edit = event.target.closest("[data-nav-edit]");
      var remove = event.target.closest("[data-nav-delete]");
      var toggle = event.target.closest("[data-nav-toggle]");
      var row = event.target.closest("[data-nav-select]");
      if (toggle) {
        event.stopPropagation();
        var toggleNode = toggle.closest(".tree-node");
        setExpanded(toggleNode, toggle.getAttribute("aria-expanded") === "false", true);
        return;
      }
      if (edit) { event.stopPropagation(); editNode(edit.closest(".tree-node")); return; }
      if (remove) { event.stopPropagation(); removeNode(remove.closest(".tree-node")); return; }
      if (row) {
        var rowNode = row.closest(".tree-node");
        selectNode(rowNode);
        if (hasChildren(rowNode)) {
          var rowToggle = rowNode.querySelector(":scope > .nav-row [data-nav-toggle]");
          setExpanded(rowNode, !rowToggle || rowToggle.getAttribute("aria-expanded") === "false", true);
        }
      }
    });
    navCard.querySelectorAll("[data-nav-action]").forEach(function (button) { button.addEventListener("click", function () { addNode(button.dataset.navAction); }); });
    var sortButton = navCard.querySelector("[data-nav-sort]");
    if (sortButton) sortButton.addEventListener("click", function () { navCard.classList.toggle("is-sorting"); sortButton.classList.toggle("active"); navTree.querySelectorAll(".tree-node").forEach(function (node) { node.draggable = navCard.classList.contains("is-sorting"); }); toast(navCard.classList.contains("is-sorting") ? "已开启拖动排序" : "已关闭拖动排序"); });
    navTree.addEventListener("dragstart", function (event) { var node = event.target.closest(".tree-node"); if (!node) return; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", "nav"); node.classList.add("is-dragging"); navCard.classList.add("is-sorting"); });
    navTree.addEventListener("dragend", function (event) { var node = event.target.closest(".tree-node"); if (node) node.classList.remove("is-dragging"); navTree.querySelectorAll(".drop-target").forEach(function (target) { target.classList.remove("drop-target"); }); });
    navTree.addEventListener("dragover", function (event) { var target = event.target.closest(".tree-node"); var source = navTree.querySelector(".tree-node.is-dragging"); if (!target || !source || target === source || source.contains(target)) return; event.preventDefault(); target.querySelector(":scope > .nav-row").classList.add("drop-target"); });
    navTree.addEventListener("dragleave", function (event) { var target = event.target.closest(".tree-node"); if (target) target.querySelector(":scope > .nav-row").classList.remove("drop-target"); });
    navTree.addEventListener("drop", function (event) { var target = event.target.closest(".tree-node"); var source = navTree.querySelector(".tree-node.is-dragging"); if (!target || !source || target === source || source.contains(target)) return; event.preventDefault(); target.querySelector(":scope > .nav-row").classList.remove("drop-target"); var list = target.parentElement; list.insertBefore(source, target); updateDepth(source, nodeLevel(target)); selectNode(source); toast("导航顺序已更新"); });
  }

  var appViews = document.querySelectorAll("[data-app-view]");
  var accessViews = document.querySelectorAll("[data-access-view]");
  function setViews() {
    var hash = location.hash.slice(1) || "admin";
    var app = hash.indexOf("access/") === 0 ? "access" : hash.split("/")[0];
    if (["admin", "frontend", "access"].indexOf(app) < 0) app = "admin";
    appViews.forEach(function (view) { view.classList.toggle("active", view.dataset.appView === app); });
    document.querySelectorAll("[data-top-link]").forEach(function (link) { link.classList.toggle("active", link.dataset.topLink === app); });
    if (accessViews.length) {
      var accessKey = hash.indexOf("access/") === 0 ? hash.split("/")[1] : "apps";
      var allowed = ["apps", "authview", "log-base", "log-table", "log-auth"];
      if (allowed.indexOf(accessKey) < 0) accessKey = "apps";
      accessViews.forEach(function (view) { view.classList.toggle("active", view.dataset.accessView === accessKey); });
      document.querySelectorAll("[data-access-link]").forEach(function (link) { link.classList.toggle("active", link.dataset.accessLink === accessKey); });
    }
  }
  if (appViews.length) { window.addEventListener("hashchange", setViews); setViews(); }
})();
