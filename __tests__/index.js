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
const evalAdd = interpreterFor(Add.type, function (v) {
  return v.value0 + v.value1
});

const evalLit = interpreterFor(Val.type, function (v) {
  return v.value
});

const evalMult = interpreterFor(Mult.type, function (v) {
  return v.value0 * v.value1 | 0;
});

test('adds 1 + 2 to equal 3', () => {
  let interpreter = interpreterFrom([evalLit, evalAdd])
  let injector = injectorFrom([Val.type, Add.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let expr = add(lit(1), lit(2))
  expect(interpretExpr(interpreter)(expr)).toBe(3);
});

test('(mult (add 1 3) 4) to equal 16', () => {
  // a la carte new data type Mult
  let interpreter = interpreterFrom([evalLit, evalAdd, evalMult])
  let injector = injectorFrom([Val.type, Add.type, Mult.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let mult = Mult.inject(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})

test('user interpreter as printer', () => {
  const printMult = interpreterFor(Mult.type, v => `(${v.value0} * ${v.value1})`)
  const printAdd = interpreterFor(Add.type, v => `(${v.value0} + ${v.value1})`)
  const printLit = interpreterFor(Val.type, v => `${v.value}`)
  const printer = interpreterFrom([printLit, printAdd, printMult])
  let injector = injectorFrom([Val.type, Add.type, Mult.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let mult = Mult.inject(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(printer)(expr)).toBe('((1 + 3) * 4)')
})

test('arbitrary type', () => {
  let interpreter = interpreterFrom([evalLit, evalAdd])
  let injector = injectorFrom([Val.type, Add.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let expr = add(lit('1'), lit('2'))
  expect(interpretExpr(interpreter)(expr)).toBe("12");
})

test('order does not matter, but injector and interpreter has to be the same', () => {
  let interpreter = interpreterFrom([evalAdd, evalLit, evalMult])
  let injector = injectorFrom([Add.type, Val.type, Mult.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let mult = Mult.inject(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
test('missing argument', () => {
  let interpreter = interpreterFrom([evalAdd, evalLit, evalMult])
  let injector = injectorFrom([Add.type, Val.type, Mult.type])
  let add = Add.inject(injector)
  let lit = Val.inject(injector)
  let mult = Mult.inject(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
