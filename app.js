let currentVersion = 7;
let elements = [];
let selectedId = null;

const ELEMENT_TYPES = {
  label:       { minVer: 1, name: "📝 Текст (Простий)" },
  title:       { minVer: 3, name: "🎨 Текст (Форматований)" },
  list_player: { minVer: 1, name: "🎒 Інвентар Гравця" },
  list_chest:  { minVer: 1, name: "📦 Вміст Сундука (Node)" },
  item_btn:    { minVer: 1, name: "💎 Предмет-Кнопка" },
  item_img:    { minVer: 1, name: "🧱 Блок (Картинка)" },
  box:         { minVer: 1, name: "🟦 Кольоровий Квадрат" },
  field:       { minVer: 1, name: "📥 Поле вводу" },
  dropdown:    { minVer: 3, name: "📜 Випадаючий список" },
  checkbox:    { minVer: 1, name: "☑️ Чекбокс" },
  close_btn:   { minVer: 1, name: "❌ Кнопка 'Закрити'" }
};

function checkAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const keyFromUrl = urlParams.get('key') || "";
  const inputPass = document.getElementById('pass-input').value.trim();

  if (md5(keyFromUrl) === PASSPHRASE_HASH || md5(inputPass) === PASSPHRASE_HASH) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    updateSidebarMenu();
  } else if (inputPass !== "") {
    alert("Невірний пароль!");
  }
}

window.onload = checkAuth;

function changeVersion() {
  currentVersion = parseInt(document.getElementById('fv-select').value);
  
  const beforeCount = elements.length;
  elements = elements.filter(el => {
    const config = ELEMENT_TYPES[el.type];
    return config && currentVersion >= config.minVer;
  });

  if (elements.length < beforeCount) {
    alert("Деякі елементи видалено, оскільки вони не підтримуються у v" + currentVersion);
    selectedId = null;
    renderProps();
  }

  updateSidebarMenu();
  render();
}

function updateSidebarMenu() {
  const container = document.getElementById('sidebar-buttons');
  container.innerHTML = '';

  // Кнопка швидкого створення фону
  const bgBtn = document.createElement('button');
  bgBtn.className = 'btn-bg';
  bgBtn.innerText = '🌅 Зробити Фон на всю сітку';
  bgBtn.onclick = createBackground;
  container.appendChild(bgBtn);

  for (const [key, item] of Object.entries(ELEMENT_TYPES)) {
    if (currentVersion >= item.minVer) {
      const btn = document.createElement('button');
      btn.className = 'btn-add';
      btn.innerText = item.name;
      btn.onclick = () => createEl(key);
      container.appendChild(btn);
    }
  }
}

// 🌅 Створення фону (автоматично падає на найнижчий шар)
function createBackground() {
  const id = Date.now();
  const bgEl = {
    id,
    type: 'box',
    x: 0,
    y: 0,
    w: 12.5,
    h: 12,
    color: "#181824"
  };
  
  elements.unshift(bgEl);
  selectEl(id);
}

function createEl(type) {
  const id = Date.now();
  let newEl = { 
    id, type, x: 0.5, y: 0.5, w: 2.5, h: 0.8, 
    text: "Текст", color: "#0fc5f7", item: "default:diamond", 
    key: "btn_" + id, options: "Опція 1,Опція 2",
    nodePos: "17014,443,16012"
  };
  
  if(type === 'title' || type === 'label') { newEl.w = 4; newEl.h = 0.8; newEl.text = "ЗАГОЛОВОК"; }
  if(type === 'list_player') { newEl.w = 8; newEl.h = 4; newEl.x = 0.25; newEl.y = 5.25; }
  if(type === 'list_chest') { newEl.w = 9; newEl.h = 3; newEl.x = 0.25; newEl.y = 0.5; }
  if(type === 'item_btn') { newEl.w = 1.2; newEl.h = 1.2; newEl.text = "Купити"; newEl.item = "default:diamond"; }
  if(type === 'item_img') { newEl.w = 1.2; newEl.h = 1.2; newEl.item = "default:pick_mese"; }
  if(type === 'box') { newEl.w = 3; newEl.h = 1.5; newEl.color = "#111118"; }

  elements.push(newEl);
  selectEl(id);
}

// 🔝 Перемістити шар ВГОРУ (на передній план)
function moveLayerUp() {
  const idx = elements.findIndex(el => el.id === selectedId);
  if (idx !== -1 && idx < elements.length - 1) {
    const temp = elements[idx];
    elements[idx] = elements[idx + 1];
    elements[idx + 1] = temp;
    render();
    renderProps();
  }
}

// 🔻 Перемістити шар ВНИЗ (на задній план)
function moveLayerDown() {
  const idx = elements.findIndex(el => el.id === selectedId);
  if (idx > 0) {
    const temp = elements[idx];
    elements[idx] = elements[idx - 1];
    elements[idx - 1] = temp;
    render();
    renderProps();
  }
}

function selectEl(id) {
  selectedId = id;
  render();
  renderProps();
}

function render() {
  const canvas = document.getElementById('canvas');
  canvas.innerHTML = '';

  elements.forEach(el => {
    const div = document.createElement('div');
    div.className = `gui-el type-${el.type} ${el.id === selectedId ? 'active' : ''}`;
    
    div.style.left = (el.x * GRID_SCALE) + 'px';
    div.style.top = (el.y * GRID_SCALE) + 'px';
    div.style.width = (el.w * GRID_SCALE) + 'px';
    div.style.height = (el.h * GRID_SCALE) + 'px';

    if (el.type === 'list_player' || el.type === 'list_chest') {
      const slotsW = Math.max(1, Math.round(el.w));
      const slotsH = Math.max(1, Math.round(el.h));
      const totalSlots = slotsW * slotsH;
      
      let gridHtml = `<div class="slot-grid-preview" style="grid-template-columns: repeat(${slotsW}, 1fr);">`;
      for(let i=0; i<totalSlots; i++) {
        gridHtml += '<div class="slot-cell"></div>';
      }
      gridHtml += '</div>';
      
      const labelText = el.type === 'list_player' ? '🎒 Інвентар' : `📦 Node: [${el.nodePos}]`;
      div.innerHTML = `<span style="font-size:9px; position:absolute; top:-15px; left:0; color:#0fc5f7; white-space:nowrap;">${labelText}</span>` + gridHtml;
    } else if (el.type === 'title') {
      div.style.color = el.color;
      div.innerText = el.text;
    } else if (el.type === 'box') {
      div.style.background = el.color;
    } else if (el.type === 'item_btn' || el.type === 'item_img') {
      div.innerHTML = `
        <div style="font-size:14px;">📦</div>
        <div class="item-id-tag">${el.item}</div>
        ${el.type === 'item_btn' ? `<div style="font-size:10px; margin-top:2px;">${el.text}</div>` : ''}
      `;
    } else {
      div.innerText = el.text;
    }

    const initDrag = (e) => {
      e.stopPropagation();
      selectEl(el.id);

      const isTouch = e.type === 'touchstart';
      if (isTouch) e.preventDefault();

      const getCoords = (event) => {
        return event.touches && event.touches.length > 0
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : { x: event.clientX, y: event.clientY };
      };

      const initial = getCoords(e);
      let startX = initial.x - (el.x * GRID_SCALE);
      let startY = initial.y - (el.y * GRID_SCALE);

      const doDrag = (event) => {
        if (event.cancelable) event.preventDefault();
        const current = getCoords(event);

        let rawX = (current.x - startX) / GRID_SCALE;
        let rawY = (current.y - startY) / GRID_SCALE;

        let newX = Math.max(0, Math.round(rawX * 20) / 20);
        let newY = Math.max(0, Math.round(rawY * 20) / 20);
        
        el.x = newX;
        el.y = newY;
        render();
        renderProps();
      };

      const stopDrag = () => {
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', doDrag);
        document.removeEventListener('touchend', stopDrag);
      };

      if (isTouch) {
        document.addEventListener('touchmove', doDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
      } else {
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
      }
    };

    div.addEventListener('mousedown', initDrag);
    div.addEventListener('touchstart', initDrag, { passive: false });

    canvas.appendChild(div);
  });

  buildCmd();
}

function renderProps() {
  const editor = document.getElementById('prop-editor');
  const el = elements.find(item => item.id === selectedId);

  if (!el) {
    editor.innerHTML = '<p style="color: #666; font-size: 12px;">Нічого не обрано</p>';
    return;
  }

  let html = `
    <div style="margin-bottom: 12px;">
      <label style="font-size: 11px; color: #aaa;">Порядок шару:</label>
      <div class="layer-controls">
        <button class="btn-layer" onclick="moveLayerUp()">⬆️ На передній план</button>
        <button class="btn-layer" onclick="moveLayerDown()">⬇️ На задній план</button>
      </div>
    </div>
  `;

  if (el.type === 'list_chest') {
    html += `
      <div class="prop-group">
        <label>Координати X,Y,Z (через кому):</label>
        <input type="text" value="${el.nodePos}" placeholder="17014,443,16012" oninput="updateVal('nodePos', this.value)">
      </div>
    `;
  }

  if (el.type === 'item_btn' || el.type === 'item_img') {
    html += `
      <div class="prop-group">
        <label>ID Предмета (напр. default:diamond):</label>
        <input type="text" value="${el.item}" oninput="updateVal('item', this.value)">
      </div>
    `;
  }

  if (['title', 'label', 'field', 'item_btn', 'close_btn', 'dropdown', 'checkbox'].includes(el.type)) {
    html += `
      <div class="prop-group">
        <label>Текст / Назва:</label>
        <input type="text" value="${el.text}" oninput="updateVal('text', this.value)">
      </div>
    `;
  }

  if (el.type === 'title' || el.type === 'box') {
    html += `
      <div class="prop-group">
        <label>Колір:</label>
        <div class="color-picker-row">
          <input type="color" value="${el.color}" oninput="updateVal('color', this.value); this.nextElementSibling.value=this.value;">
          <input type="text" value="${el.color}" oninput="updateVal('color', this.value); this.previousElementSibling.value=this.value;">
        </div>
      </div>
    `;
  }

  html += `
    <div style="display:flex; gap:6px;">
      <div class="prop-group" style="flex:1;">
        <label>${el.type.startsWith('list') ? 'Слотів (W)' : 'Ширина W'}:</label>
        <input type="number" step="${el.type.startsWith('list') ? '1' : '0.05'}" value="${el.w}" onchange="updateVal('w', parseFloat(this.value))">
      </div>
      <div class="prop-group" style="flex:1;">
        <label>${el.type.startsWith('list') ? 'Рядів (H)' : 'Висота H'}:</label>
        <input type="number" step="${el.type.startsWith('list') ? '1' : '0.05'}" value="${el.h}" onchange="updateVal('h', parseFloat(this.value))">
      </div>
    </div>

    <div style="display:flex; gap:6px;">
      <div class="prop-group" style="flex:1;">
        <label>X:</label>
        <input type="number" step="0.05" value="${el.x}" onchange="updateVal('x', parseFloat(this.value))">
      </div>
      <div class="prop-group" style="flex:1;">
        <label>Y:</label>
        <input type="number" step="0.05" value="${el.y}" onchange="updateVal('y', parseFloat(this.value))">
      </div>
    </div>

    <button onclick="removeEl(${el.id})" style="background:#ff3355; color:#fff; border:none; padding:8px; width:100%; border-radius:5px; cursor:pointer; font-weight:bold; margin-top:5px; font-size:12px;">🗑️ Видалити</button>
  `;

  editor.innerHTML = html;
}

function updateVal(key, val) {
  const el = elements.find(item => item.id === selectedId);
  if (el) {
    el[key] = val;
    render();
  }
}

function removeEl(id) {
  elements = elements.filter(item => item.id !== id);
  selectedId = null;
  renderProps();
  render();
}

function buildCmd() {
  let code = "";

  if (currentVersion >= 3) {
    code += `formspec_version[${currentVersion}]`;
  }
  
  code += "size[12.5,12]background[0,0;12.5,12;default_item_bg.png]";

  elements.forEach(el => {
    if (el.type === 'list_chest') {
      code += "list[nodemeta:" + el.nodePos + ";main;" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";]";
    } else if (el.type === 'list_player') {
      code += "list[current_player;main;" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";]";
    } else if (el.type === 'label') {
      code += "label[" + el.x + "," + el.y + ";" + el.text + "]";
    } else if (el.type === 'title') {
      code += "hypertext[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";title;<global halign=center font=size=20><style color=" + el.color + "><b>" + el.text + "</b></style>]";
    } else if (el.type === 'box') {
      code += "box[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.color + "]";
    } else if (el.type === 'item_btn') {
      code += "item_image_button[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.item + ";" + el.key + ";" + el.text + "]";
    } else if (el.type === 'item_img') {
      code += "item_image[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.item + "]";
    } else if (el.type === 'field') {
      code += "field[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.key + ";" + el.text + ";]";
    } else if (el.type === 'dropdown') {
      code += "dropdown[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.key + ";" + el.options + ";1]";
    } else if (el.type === 'checkbox') {
      code += "checkbox[" + el.x + "," + el.y + ";" + el.key + ";" + el.text + ";false]";
    } else if (el.type === 'close_btn') {
      code += "button_exit[" + el.x + "," + el.y + ";" + el.w + "," + el.h + ";" + el.key + ";" + el.text + "]";
    }
  });

  document.getElementById('cmd-result').value = generateGivemeCommand(code);
}

function copyResult() {
  const txt = document.getElementById("cmd-result");
  txt.select();
  navigator.clipboard.writeText(txt.value);
  alert("✅ Скопійовано!");
}
