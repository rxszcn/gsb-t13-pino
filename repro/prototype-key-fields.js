// 复现：日志字段名撞上 Object.prototype 上的成员时，整条日志调用抛错
const pino = require('../');

const cases = [
  ['hasOwnProperty', 7],
  ['valueOf', 3],
  ['__proto__', { x: 1 }],
  ['toString', 42],
];

for (const [k, v] of cases) {
  const out = [];
  const log = pino({ level: 'info' }, { write(s) { out.push(s); } });
  let err = null;
  try { log.info({ [k]: v }); } catch (e) { err = e.message; }
  if (err) {
    console.log(String(k).padEnd(15), '抛错:', err.slice(0, 52));
  } else {
    let parsed = null;
    try { parsed = JSON.parse(out[out.length - 1]); } catch (e) {}
    console.log(String(k).padEnd(15), '未抛，字段值 =', parsed ? JSON.stringify(parsed[k]) : '该行不是合法 JSON');
  }
}

const out2 = [];
const log2 = pino({ level: 'info' }, { write(s) { out2.push(s); } });
const bare = Object.assign(Object.create(null), { a: 1 });
try {
  log2.child(bare).info('用无原型对象当绑定字段');
  console.log('无原型 bindings   未抛 ->', out2[out2.length - 1] ? out2[out2.length - 1].trim().slice(0, 70) : '无输出');
} catch (e) {
  console.log('无原型 bindings   抛错:', e.message.slice(0, 52));
}
