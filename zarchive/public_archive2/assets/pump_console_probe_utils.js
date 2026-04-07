export function formatRawChannels(frame) {
  return (frame.channelMeta || [])
    .map(item => `${item.channelKey}=(${item.pair[0]},${item.pair[1]})`)
    .join(' ');
}

export function formatOperationalChannels(frame) {
  return (frame.operationalChannels || [])
    .map(item => `${item.slotKey}=(${item.pair[0]},${item.pair[1]})[${item.channelKey}]`)
    .join(' ');
}
