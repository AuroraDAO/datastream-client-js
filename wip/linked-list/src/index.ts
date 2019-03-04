import { ILinkedList } from './types';

import LinkedList from './list';

function start() {
  const list: ILinkedList<[string, number]> = LinkedList(
    new Map([['FIRST', 0]])
  );

  list.push(['key1', 1]);
  list.push(['key2', 2]);
  list.push(['key3', 3]);
  list.unshift(['key4', 4]);

  const list2 = LinkedList(list);
  list2.push(['NEW', 6]);

  list.forEach(v => console.log(v));
  list2.forEach(v => console.log(v));

  // let node = list.s;
  // while (node !== null) {
  //   const n = node.v[1];

  //   switch (n) {
  //     case 4:
  //     case 2:
  //     case 3: {
  //       node.insert('p', ['hi', list.c + 1]);
  //       break;
  //     }
  //   }
  //   node = node.n;
  // }
  // node = list.s;
  // // list.sort((a, b) => a[1] - b[1]);
  // // console.log(list.c);

  // // console.log(JSON.stringify(list));

  // list.insert(['new', 6], a => a[1] === 6);

  // const rlist = list.reverse;

  // rlist.insert(['new', 7], a => a[1] === 1);

  // console.log(JSON.stringify(list));
  // console.log(JSON.stringify(rlist));

  // console.log(JSON.stringify(list.merge(list)));
  // list.forEachReverse(v => console.log(v));
  // console.log('done');
  // const node = ListNode([1, 2]);
  // node.insert('n', ListNode([2, 3]));
  // node.insert('p', ListNode([3, 4]));
  // node.insert('p', ListNode([4, 5]));
  // console.log(node);
  // const arr = [5, 9, 2, 1, 6];
  // console.log(arr);
  // console.log(quickSort(arr));
}

start();
