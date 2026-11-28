// Remembers the order numbers placed from THIS phone/browser (no login needed).
const KEY = "veloria_my_orders";

export function getMyOrderIds() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveMyOrder(id) {
  if (!id) return;
  try {
    const list = getMyOrderIds().filter((x) => x !== id);
    list.unshift(id);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* storage blocked: nothing to do */
  }
}
