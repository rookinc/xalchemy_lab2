export function timestamp() {
  return new Date().toLocaleTimeString();
}

export function writeLine(els, kind, message, tone = 'ok') {
  const p = document.createElement('p');
  p.className = 'line';
  p.innerHTML = `<span class="ts">[${timestamp()}]</span> <span class="kind">${kind}</span> <span class="${tone}">${message}</span>`;
  els.console.appendChild(p);
  els.console.scrollTop = els.console.scrollHeight;
}

export function writeFlow(els, fromFrame, toFrame) {
  const fromPort = `${fromFrame.portKey ?? '(none)'} (${fromFrame.portName ?? '(none)'})`;
  const fromSlot = `${fromFrame.slotKey ?? '(none)'} (${fromFrame.slotName ?? '(none)'})`;
  const toPort = `${toFrame.portKey ?? '(none)'} (${toFrame.portName ?? '(none)'})`;
  const toSlot = `${toFrame.slotKey ?? '(none)'} (${toFrame.slotName ?? '(none)'})`;

  writeLine(els, 'FLOW', `from ${fromPort} / ${fromSlot} / ${fromFrame.phaseKey ?? '(none)'}`);
  writeLine(els, 'FLOW', `to   ${toPort} / ${toSlot} / ${toFrame.phaseKey ?? '(none)'}`);
}
