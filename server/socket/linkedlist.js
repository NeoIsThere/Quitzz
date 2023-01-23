class LLNode {
  next = null;
  previous = null;
  data = null;

  constructor(data) {
    this.data = data;
  }
}

class LinkedList {
  constructor() {
    this.first = new LLNode();
    this.last = new LLNode();
    this.first.next = this.last;
    this.last.previous = this.first;
    this.size = 0;
  }

  push(data) {
    const newNode = new LLNode(data);
    const previous = this.last.previous;
    previous.next = newNode;
    this.last.previous = newNode;
    newNode.previous = previous;
    newNode.next = this.last;
    this.size++;
  }

  popFirst() {
    if (this.size < 1) {
      return;
    }
    this.first.next = this.first.next.next;
    this.first.next.previous = this.first;
    this.size--;
  }

  pop(predicate) {
    const node = this.findNode(predicate);
    if (!node) {
      return;
    }

    node.previous.next = node.next;
    node.next.previous = node.previous;
    this.size--;
  }

  popNFirst(n) {
    let current = this.first;

    while (current.next != this.last && n > 0) {
      current = current.next;
      n--;
      this.size--;
    }

    this.first.next = current.next;
    current.next.previous = this.first;
  }

  findNode(predicate) {
    let current = this.last;
    while (current.previous != this.first) {
      current = current.previous;
      if (predicate(current.data)) {
        return current;
      }
    }
    return null;
  }

  getNLatest(n) {
    return this.getNAfter(this.last, n);
  }

  getNAfter(node, n) {
    let current = node;
    let toReturn = [];
    while (current.previous != this.first && n > 0) {
      current = current.previous;
      toReturn.push(current.data);
      n--;
    }
    return toReturn.reverse();
  }

  stringify() {
    let str = "";
    let current = this.first;
    while (current.next != this.last) {
      current = current.next;
      str += JSON.stringify(current.data);
      str += "\n";
    }
    return str;
  }
}

module.exports = {
  LinkedList,
};
