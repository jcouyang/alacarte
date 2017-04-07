const {
  injectorFrom,
  interpreterFrom,
  interpretExpr,
  Functor,
  interpreterFor,
  inject,
} = require('../index.es6')

function Add(value0, value1) {
  this.value0 = value0
  this.value1 = value1
}

function Lit(value0) {
  this.value0 = value0
}

function injectLit(injector) {
  return n => inject(injector(functorLit))(new Lit(n))
}

function add(a, b) {
  return inject(injector(functorAdd))(new Add(a, b))
}

function injectAdd(injector) {
  return (a, b) => inject(injector(functorAdd))(new Add(a, b))
}

function Mult(a, b) {
  this.value0 = a
  this.value1 = b
}

const functorLit = new Functor(f => v => new Lit(v.value0))
const functorAdd = new Functor(f => v => new Add(f(v.value0), f(v.value1)))
const functorMult = new Functor(f => v => new Mult(f(v.value0), f(v.value1)))
const evalAdd = interpreterFor(functorAdd, function (v) {
  return v.value0 + v.value1
});

const evalLit = interpreterFor(functorLit, function (v) {
  return v.value0
});

const evalMult = interpreterFor(functorMult, function (v) {
  return v.value0 * v.value1 | 0;
});
function injectMult(injector) {
  return (a, b) => inject(injector(functorMult))(new Mult(a, b))
}

test('adds 1 + 2 to equal 3', () => {
  let interpreter = interpreterFrom([evalLit, evalAdd])
  let injector = injectorFrom([functorLit, functorAdd])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let expr = add(lit(1), lit(2))
  expect(interpretExpr(interpreter)(expr)).toBe(3);
});

test('(mult (add 1 3) 4) to equal 16', () => {
  // a la carte new data type Mult
  let interpreter = interpreterFrom([evalLit, evalAdd, evalMult])
  let injector = injectorFrom([functorLit, functorAdd, functorMult])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let mult = injectMult(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})

test('user interpreter as printer', () => {
  const printMult = interpreterFor(functorMult, v => `(${v.value0} * ${v.value1})`)
  const printAdd = interpreterFor(functorAdd, v => `(${v.value0} + ${v.value1})`)
  const printLit = interpreterFor(functorLit, v => `${v.value0}`)
  const printer = interpreterFrom([printLit, printAdd, printMult])
  let injector = injectorFrom([functorLit, functorAdd, functorMult])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let mult = injectMult(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(printer)(expr)).toBe('((1 + 3) * 4)')
})

test('arbitrary type', () => {
  let interpreter = interpreterFrom([evalLit, evalAdd])
  let injector = injectorFrom([functorLit, functorAdd])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let expr = add(lit('1'), lit('2'))
  expect(interpretExpr(interpreter)(expr)).toBe("12");
})

test('order does not matter, but injector and interpreter has to be the same', () => {
  let interpreter = interpreterFrom([evalAdd, evalLit, evalMult])
  let injector = injectorFrom([functorAdd, functorLit, functorMult])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let mult = injectMult(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
test('missing argument', () => {
  let interpreter = interpreterFrom([evalAdd, evalLit, evalMult])
  let injector = injectorFrom([functorAdd, functorLit, functorMult])
  let add = injectAdd(injector)
  let lit = injectLit(injector)
  let mult = injectMult(injector)
  let expr = mult(add(lit(1), lit(3)), lit(4))
  expect(interpretExpr(interpreter)(expr)).toBe(16);
})
