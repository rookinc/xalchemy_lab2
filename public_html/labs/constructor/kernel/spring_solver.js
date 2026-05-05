export class SpringSolver {
  constructor(graph, params = {}) {
    this.graph = graph;
    this.nodes = graph.nodes;
    this.edges = graph.edges;

    this.params = {
      repulsion: params.repulsion ?? 9000,
      springK: params.springK ?? 0.01,
      springLength: params.springLength ?? 120,
      centering: params.centering ?? 0.002,
      damping: params.damping ?? 0.85,
      maxSpeed: params.maxSpeed ?? 12,
    };

    this.dragged = null;
  }

  setDraggedNode(node) {
    this.dragged = node;
    if (node) {
      node.vx = 0;
      node.vy = 0;
    }
  }

  step(width, height) {
    const { nodes, edges, params } = this;

    for (const n of nodes) {
      n.fx = 0;
      n.fy = 0;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];

        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;

        if (d2 < 0.01) {
          dx = (Math.random() - 0.5) * 0.1;
          dy = (Math.random() - 0.5) * 0.1;
          d2 = dx * dx + dy * dy;
        }

        const d = Math.sqrt(d2);
        const f = params.repulsion / d2;
        const fx = (f * dx) / d;
        const fy = (f * dy) / d;

        a.fx -= fx;
        a.fy -= fy;
        b.fx += fx;
        b.fy += fy;
      }
    }

    for (const edge of edges) {
      const a = nodes[edge.source];
      const b = nodes[edge.target];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
      const stretch = d - params.springLength;
      const f = params.springK * stretch;
      const fx = (f * dx) / d;
      const fy = (f * dy) / d;

      a.fx += fx;
      a.fy += fy;
      b.fx -= fx;
      b.fy -= fy;
    }

    const cx = width / 2;
    const cy = height / 2;

    for (const n of nodes) {
      n.fx += (cx - n.x) * params.centering;
      n.fy += (cy - n.y) * params.centering;
    }

    for (const n of nodes) {
      if (n === this.dragged || n.pinned) continue;

      n.vx = (n.vx + n.fx) * params.damping;
      n.vy = (n.vy + n.fy) * params.damping;

      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > params.maxSpeed) {
        n.vx = (n.vx / speed) * params.maxSpeed;
        n.vy = (n.vy / speed) * params.maxSpeed;
      }

      n.x += n.vx;
      n.y += n.vy;
    }
  }
}
