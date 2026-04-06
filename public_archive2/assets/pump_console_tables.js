export const PORT_NEXT = [1, 2, 3, 0];
export const SLOT_NEXT = [1, 2, 0];

export function nextPort(port) {
  return PORT_NEXT[port % PORT_NEXT.length];
}

export function nextSlot(slot) {
  return SLOT_NEXT[slot % SLOT_NEXT.length];
}
