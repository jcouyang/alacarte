const {
  injectorFrom,
  interpreterFrom,
  interpretExpr,
  Functor,
  interpreterFor,
  inject,
  Val,
  Expr,
} = require('../index.es6')

const {Add, Mult} = Expr.create({Add: ['value0', 'value1'], Mult: ['value0', 'value1']})
const evalAdd = interpreterFor(Add, function (v) {
  return v.value0 + v.value1
});

const evalVal = interpreterFor(Val, function (v) {
  return v.value
});

const evalMult = interpreterFor(Mult, function (v) {
  return v.value0 * v.value1 | 0;
});

test('adds 1 + 2 to equal 3', () => {
  let interpreter = interpreterFrom([evalVal, evalAdd])
  let injector = injectorFrom([Val, Add])
  let [val, add] = injector.inject()
  let expr = add(val(1), val(2))
  expect(interpretExpr(interpreter)(expr)).toBe(3);
});

test('(mult (add 1 3) 4) to equal 16', () => {
  // a la carte new data type Mult
  let interpreter = interpreterFrom([evalVal, evalAdd, evalMult])
  let injector = injectorFrom([Val, Add, Mult])
  let [val, add, mult] = injector.inject()
  let expr = mult(add(val(1), val(3)), val(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})

test('user interpreter as printer', () => {
  const printMult = interpreterFor(Mult, v => `(${v.value0} * ${v.value1})`)
  const printAdd = interpreterFor(Add, v => `(${v.value0} + ${v.value1})`)
  const printVal = interpreterFor(Val, v => `${v.value}`)
  const printer = interpreterFrom([printVal, printAdd, printMult])
  let injector = injectorFrom([Val, Add, Mult])
  let [val, add, mult] = injector.inject()
  let expr = mult(add(val(1), val(3)), val(4))
  expect(interpretExpr(printer)(expr)).toBe('((1 + 3) * 4)')
})

test('arbitrary type', () => {
  let interpreter = interpreterFrom([evalVal, evalAdd])
  let injector = injectorFrom([Val, Add])
  let [val, add] = injector.inject()
  let expr = add(val('1'), val('2'))
  expect(interpretExpr(interpreter)(expr)).toBe("12");
})

test('order does not matter, but injector and interpreter has to be the same', () => {
  let interpreter = interpreterFrom([evalAdd, evalVal, evalMult])
  let injector = injectorFrom([Add, Val, Mult])
  let [add, val, mult] = injector.inject()
  let expr = mult(add(val(1), val(3)), val(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
test('missing argument', () => {
  let interpreter = interpreterFrom([evalAdd, evalVal, evalMult])
  let injector = injectorFrom([Add, Val, Mult])
  let [add, val, mult] = injector.inject()
  let expr = mult(add(val(1), val(3)), val(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
