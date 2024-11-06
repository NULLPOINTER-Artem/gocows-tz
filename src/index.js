const SPIN_POPUP_EL_ID = 'spin-popup';
const COPY_CODE_POPUP_ID = 'code-copied';
const CLASS_SHOW_POPUP = 'is-show';
const ATTR_FOR_POPUP = 'has-popup'; //* VAL OF ATTR MUST EQUAL TO POPUP ID VALUE! **
const ATTR_FOR_POPUP_POSITION = 'popup-position';
const ATTR_FOR_POPUP_OFFSET = 'popup-offset';
const ATTR_FOR_POPUP_TIMER = 'popup-timer';

const arrClb = [];
let casinoWidgetEl = null;
let spinPopupEl = null;
let totalListHeight = 0;
let alignPosPopup = null;

function findChildrenBySelector(
  parent,
  selector,
  searchByAttr = false,
  results = []
) {
  if (!parent || !selector) return results;
  const { children } = parent;
  if (!children || !children.length) return results;

  // eslint-disable-next-line no-restricted-syntax
  for (const child of children) {
    if (searchByAttr && child.hasAttribute(`data-${selector}`)) {
      results.push(child);
    } else if (!searchByAttr && child.matches(selector)) {
      results.push(child);
    }

    findChildrenBySelector(child, selector, searchByAttr, results);
  }

  return results;
}

function onLoadMore() {
  const casinoListEl = findChildrenBySelector(casinoWidgetEl, 'list', true)[0];
  if (!casinoListEl) return;

  casinoListEl.style.maxHeight = `${totalListHeight}px`;
  this.classList.add('is-hidden');
}

function calcListMaxHeight() {
  const casinoListEl = findChildrenBySelector(casinoWidgetEl, 'list', true)[0];
  if (!casinoListEl) return;
  const listItems = findChildrenBySelector(casinoListEl, 'item', true).slice(
    0,
    4
  );
  if (!listItems.length) return;
  totalListHeight = casinoListEl.scrollHeight;

  const initialListHeight = listItems.reduce(
    (initVal, itemEl) => (initVal += itemEl.clientHeight),
    0
  );
  casinoListEl.style.maxHeight = `${initialListHeight}px`;
}

function autoAlign(val, popupEl, position) {
  const rect = popupEl.getBoundingClientRect();

  var width = rect.width;
  var isVertical = position === 'top' || position === 'bottom';

  if (isVertical && val + width > window.innerWidth) alignPosPopup = 'right';
  if (isVertical && val < 0) alignPosPopup = 'left';
  if (!isVertical && val < 0) alignPosPopup = 'top';
}

function calcX(popupEl, triggerCoords, pos) {
  const rect = popupEl.getBoundingClientRect();
  const width = rect.width;

  let x = triggerCoords.left + (triggerCoords.width - width) / 2;
  autoAlign(x, popupEl, pos);

  return x;
}

function setPopupPosition(pos, popupEl, triggerCoords, offset) {
  let x = 0;
  let y = 0;

  const rect = popupEl.getBoundingClientRect();

  if (pos === 'top' || pos === 'bottom') {
    x = calcX(popupEl, triggerCoords, pos);
    y =
      pos === 'top'
        ? triggerCoords.top - rect.height
        : triggerCoords.top + triggerCoords.height;

    popupEl.style[alignPosPopup || 'left'] =
      x + (window.scrollX || window.pageXOffset) + 'px';
    popupEl.style.top =
      y +
      (window.scrollY || window.pageYOffset) +
      (pos === 'top' ? -offset : offset) +
      'px';
  }
}

function setupPositionOfPopup(popupId, rectObj, triggerEl, timer = null) {
  if (!popupId || !rectObj) return;
  const thePopup = document.getElementById(popupId);
  if (!thePopup) return;
  const offset = +triggerEl.getAttribute(`data-${ATTR_FOR_POPUP_OFFSET}`);
  const position = triggerEl.getAttribute(`data-${ATTR_FOR_POPUP_POSITION}`);

  setPopupPosition(position, thePopup, rectObj, offset);
  thePopup.classList.add(CLASS_SHOW_POPUP);

  if (timer) {
    setTimeout(() => {
      thePopup.classList.remove(CLASS_SHOW_POPUP);
    }, timer);
  }
}

function triggerPopup() {
  const attrVal = this.getAttribute(`data-${ATTR_FOR_POPUP}`);
  const timer = +this.getAttribute(`data-${ATTR_FOR_POPUP_TIMER}`);
  const rect = this.getBoundingClientRect();

  setupPositionOfPopup(attrVal, rect, this, timer);
}

function initAllPopups() {
  const allTriggers = Array.from(
    document.querySelectorAll(`[data-${ATTR_FOR_POPUP}]`)
  );
  if (!allTriggers.length) return;

  allTriggers.forEach((triggerEl) => {
    triggerEl.addEventListener('click', triggerPopup);

    arrClb.push(() => {
      triggerEl.removeEventListener('click', triggerPopup);
    });
  });
}

function closePopup(popupId) {
  let ID = typeof popupId !== 'string' ? SPIN_POPUP_EL_ID : popupId;
  const thePopup = document.getElementById(ID);
  thePopup.classList.remove(CLASS_SHOW_POPUP);
}

const onLoad = () => {
  casinoWidgetEl = document.querySelector('.casino-widget');
  if (!casinoWidgetEl) return;
  calcListMaxHeight();
  initAllPopups();

  const btnMore = findChildrenBySelector(casinoWidgetEl, 'btn-more', true)[0];
  if (!btnMore) return;
  btnMore.addEventListener('click', onLoadMore);

  const spinPopupEl = document.getElementById(SPIN_POPUP_EL_ID);
  if (!spinPopupEl) return;
  const btnClose = findChildrenBySelector(spinPopupEl, 'close-btn', true)[0];
  if (!btnClose) return;
  btnClose.addEventListener('click', closePopup);

  arrClb.push(() => {
    btnMore.removeEventListener('click', onLoadMore);
    btnClose.removeEventListener('click', closePopup);
  });
};

const onUnload = () => {
  arrClb.forEach((func) => func());
};

document.addEventListener('DOMContentLoaded', onLoad);
window.addEventListener('beforeunload', onUnload);
