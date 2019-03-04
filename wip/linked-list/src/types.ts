import { LinkedListNodeSymbol, LinkedListSymbol } from './constants';

export interface INode<V> {
  [LinkedListNodeSymbol]: true;
  v: V;
  p: null | INode<V>;
  n: null | INode<V>;

  insert(pos: 'p' | 'n', inserted: V | INode<V>): INode<V>;
  remove(): INode<V>;
}

export interface ILinkedList<V> {
  [LinkedListSymbol]: true;
  c: number;
  s: null | INode<V>;
  e: null | INode<V>;
  reverse: {
    readonly c: number;
    readonly s: null | INode<V>;
    readonly e: null | INode<V>;
    push(v: V): INode<V>;
    unshift(v: V): INode<V>;
    forEach(cb: (n: V) => void): void;
    merge(list: ILinkedList<V>): ILinkedList<V>;
    map(cb: (v: V) => any): any[];
    insert(v: V, cb: (a: V, b: null | V) => any): null | INode<V>;
    toJSON(): V[];
    [Symbol.iterator](): IterableIterator<V>;
  };

  push(v: V): INode<V>;
  unshift(v: V): INode<V>;
  forEach(cb: (n: V) => void): void;

  merge(list: ILinkedList<V>): ILinkedList<V>;

  map(cb: (v: V) => any): any[];
  insert(v: V, cb: (a: V, b: null | V) => any): null | INode<V>;

  toJSON(): V[];
  [Symbol.iterator](): IterableIterator<V>;
}
