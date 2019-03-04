// type QuoteSymbol = string;
// type BaseSymbol = string;
import { LinkedListSymbol } from './constants';
import { ILinkedList, INode } from './types';

import ListNode from './node';

export default function LinkedList<V>(initial?: Iterable<V>) {
  const list: ILinkedList<V> = {
    [LinkedListSymbol]: true,
    c: 0,
    s: null,
    e: null,
    push(v: V) {
      const node = ListNode(list, v);
      if (!list.e) {
        list.e = node;
        list.s = node;
      } else {
        list.e.insert('n', node);
      }
      return node;
    },
    unshift(v: V) {
      const node = ListNode(list, v);
      if (!list.s) {
        list.s = node;
        list.e = node;
      } else {
        list.s.insert('p', node);
      }
      return node;
    },
    map(cb: (v: V) => any) {
      const arr: any[] = [];
      list.forEach(v => arr.push(cb(v)));
      return arr;
    },
    insert(v: V, cb: (a: V, b: null | V) => any): null | INode<V> {
      let node: null | INode<V> = list.s;
      while (node !== null) {
        const a = node.v;
        const b = node.n ? node.n.v : null;
        if (cb(a, b)) {
          return node.insert('n', v);
        } else if (node === null) {
          break;
        }
        node = node.n;
      }
      return null;
    },
    forEach(cb: (n: V) => void) {
      let node = list.s;
      while (node !== null) {
        cb(node.v);
        node = node.n;
      }
      return list;
    },
    merge(l2: ILinkedList<V>) {
      [...l2].forEach(list.push);
      return list;
    },
    toJSON() {
      return Array.from(list);
    },
    *[Symbol.iterator]() {
      let node = list.s;
      while (node !== null) {
        yield node.v;
        node = node.n;
      }
    },
    reverse: {
      get c() {
        return list.c;
      },
      get s() {
        return list.e;
      },
      get e() {
        return list.s;
      },
      push(v: V) {
        return list.unshift(v);
      },
      unshift(v: V) {
        return list.push(v);
      },
      forEach(cb: (n: V) => void) {
        let node = list.e;
        while (node !== null) {
          cb(node.v);
          node = node.p;
        }
      },
      merge(l2: ILinkedList<V>) {
        [...l2].forEach(list.unshift);
        return list;
      },
      map(cb: (v: V) => any) {
        const arr: any[] = [];
        this.forEach(v => arr.push(cb(v)));
        return arr;
      },
      insert(v: V, cb: (a: V, b: null | V) => any): null | INode<V> {
        let node: null | INode<V> = list.e;
        while (node !== null) {
          const a = node.v;
          const b = node.p ? node.p.v : null;
          if (cb(a, b)) {
            return node.insert('p', v);
          } else if (node === null) {
            break;
          }
          node = node.p;
        }
        return null;
      },
      toJSON() {
        return Array.from(list.reverse);
      },
      *[Symbol.iterator]() {
        let node = list.e;
        while (node !== null) {
          yield node.v;
          node = node.p;
        }
      },
    },
  };
  if (initial) {
    Array.from(initial).forEach(list.push);
  }
  return list;
}

// interface Market<QS extends QuoteSymbol, BS extends BaseSymbol> {
//   readonly market: [QS, BS];

//   orders: OrderBook<QS, BS>;
// }

// interface OrderBook<QS extends QuoteSymbol, BS extends BaseSymbol> {
//   readonly market: Market<QS, BS>;
//   readonly total_asks: string;
//   readonly total_bids: string;

//   readonly precision: number;

//   insert(order: any): boolean;
//   fill(fill: any): boolean;
//   cancel(order: any): boolean;
// }

// const market = {
//   market: ['AURA', 'ETH'],
// };

// const chunk = [
//   // bids
//   [
//     // bid stats
//     [2, 58000000000n, '3'],
//     // bid orders
//     [[30000000000n, '1.5', [25, 26, 27]], [28000000000n, '1.5', [22, 21, 20]]],
//   ],
//   // asks
//   [
//     // ask stats
//     [1, 40000000000n, '0.5'],
//     // ask orders
//     [[40000000000n, '0.5', [28, 29, 30]]],
//   ],
// ];

// console.log(chunk);
