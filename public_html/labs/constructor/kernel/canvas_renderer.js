export class CanvasGraphRenderer {
  constructor(canvas, graph, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.graph = graph;
    this.nodes = graph.nodes;
    this.edges = graph.edges;
    this.nodeRadius = options.nodeRadius ?? 10;
    this.dragged = null;
    this.isDestroyed = false;

    this.resize = this.resize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);

    window.addEventListener("resize", this.resize);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);

    this.resize();
  }

  destroy() {
    if (this.isDestroyed) return;

    window.removeEventListener("resize", this.resize);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);

    this.dragged = null;
    this.isDestroyed = true;
  }

  resize() {
    if (this.isDestroyed) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  pointerPos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }

  nearestNode(x, y) {
    let best = null;
    let bestD2 = Infinity;

    for (const n of this.nodes) {
      const dx = n.x - x;
      const dy = n.y - y;
      const d2 = dx * dx + dy * dy;
      if (d2 < bestD2) {
        bestD2 = d2;
        best = n;
      }
    }

    return bestD2 <= 30 * 30 ? best : null;
  }

  onPointerDown(event) {
    if (this.isDestroyed) return;

    const p = this.pointerPos(event);
    this.dragged = this.nearestNode(p.x, p.y);

    if (this.dragged) {
      this.dragged.vx = 0;
      this.dragged.vy = 0;
    }
  }

  onPointerMove(event) {
    if (this.isDestroyed || !this.dragged) return;

    const p = this.pointerPos(event);
    this.dragged.x = p.x;
    this.dragged.y = p.y;
    this.dragged.vx = 0;
    this.dragged.vy = 0;
  }

  onPointerUp() {
    if (this.isDestroyed) return;
    this.dragged = null;
  }

  draw() {
    if (this.isDestroyed) return;

    const ctx = this.ctx;
    const { canvas } = this;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const edge of this.edges) {
      const a = this.nodes[edge.source];
      const b = this.nodes[edge.target];
      if (!a || !b) continue;

      const style = edge.style || {};

      if (style.is_visible === 0 || style.hidden === true) {
        continue;
      }

      ctx.strokeStyle = style.stroke || "#6aa9ff";
      ctx.lineWidth = style.lineWidth || 2;

      if (Array.isArray(style.lineDash)) {
        ctx.setLineDash(style.lineDash);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    for (const n of this.nodes) {
      const style = n.style || {};

      const fill = n === this.dragged
        ? "#ffd166"
        : style.fill || "#e8f1ff";

      const stroke = style.stroke || "#0f1318";
      const text = style.text || "#0f1318";
      const radius = style.radius || this.nodeRadius;
      const lineWidth = style.lineWidth || 2;

      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      ctx.fillStyle = text;
      ctx.font = `${style.fontSize || 12}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(n.label ?? n.node_key ?? n.id), n.x, n.y);
    }
  }
}
