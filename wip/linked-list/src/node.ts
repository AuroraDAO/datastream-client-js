import { LinkedListNodeSymbol } from './constants';
import { ILinkedList, INode } from './types';

function removeNode<V>(l: ILinkedList<V>, node: INode<V>): INode<V> {
  if (!node.p && !node.n) {
    return node;
  }
  if (node.p) {
    node.p.n = node.n;
  } else {
    l.s = node.n;
  }
  if (node.n) {
    node.n.p = node.p;
  } else {
    l.e = node.p;
  }
  node.n = null;
  node.p = null;
  return node;
}

function insertNodeBefore<V>(
  l: ILinkedList<V>,
  self: INode<V>,
  inserted: INode<V>
): INode<V> {
  inserted.n = self;
  if (self.p === null) {
    self.p = inserted;
    inserted.p = null;
  } else {
    self.p.n = inserted;
    inserted.p = self.p;
    self.p = inserted;
  }
  if (inserted.p === null) {
    l.s = inserted;
  }
  return self;
}

function insertNodeAfter<V>(
  l: ILinkedList<V>,
  self: INode<V>,
  inserted: INode<V>
): INode<V> {
  inserted.p = self;
  if (self.n === null) {
    self.n = inserted;
  } else {
    self.n.p = inserted;
    inserted.n = self.n;
    inserted.p = self;
    self.n = inserted;
  }
  if (inserted.n === null) {
    l.e = inserted;
  }
  return self;
}

function isListNode<V>(v: V | INode<V>): v is INode<V> {
  return (
    typeof v === 'object' && (v as INode<V>)[LinkedListNodeSymbol] === true
  );
}

export default function ListNode<V>(
  l: ILinkedList<V>,
  v: V,
  p: null | INode<V> = null,
  n: null | INode<V> = null
): INode<V> {
  l.c += 1;
  const self: INode<V> = {
    [LinkedListNodeSymbol]: true,
    v,
    p,
    n,
    insert(pos: 'p' | 'n', next: V | INode<V>) {
      const inserted = isListNode(next) ? next : ListNode(l, next);
      if (inserted.n || inserted.p) {
        removeNode(l, inserted);
      }
      return pos === 'p'
        ? insertNodeBefore(l, self, inserted)
        : insertNodeAfter(l, self, inserted);
    },
    remove() {
      l.c -= 1;
      return removeNode(l, self);
    },
  };
  return self;
}
