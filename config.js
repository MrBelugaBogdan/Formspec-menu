// Хеш паролю доступу
const PASSPHRASE_HASH = "9096095f6d674a667399b067ee3df916";

// Розмір сітки (1 unit у Formspec = 40px)
const GRID_SCALE = 40;

// Шаблон команди /giveme
function generateGivemeCommand(formspecCode) {
  return '/giveme books:empty 1 0 "\\u0001owner\\u0002Деси\\u0003description\\u0002Інвентар\\u0003page\\u0001\\u0003page_max\\u0001\\u0003text_b64\\u00020LPRgNCw0L/QvtC9IDIgLSDRhNC20LXRgNCwINC/0L7Qu9GMINC70ZbQstC90LAK\\u0003title_b64\\u00020JrRgNC40YHQuyBCYWc=\\u0003formspec\\u0002' + formspecCode + '\\u0003"';
}
