const AlaCarte = require('./output/AlaCarte')
const {
    In,
  Inl,
  Inr,
  interpretExpr,
  interpreterOr,
  Interpreter,
  inject,
  functorOr,
} = AlaCarte
const {Functor} = require('./output/Data.Functor')
function interpreterFor(functor, interpreter) {
  return new Interpreter(function () {
    return functor;
  }, interpreter);
}

function fromArray(array, functor) {
  let head = array[0]
  let tail = array.slice(1)
  if(tail.length===0) {
    return head;
  }else{
    return functor(head)(fromArray(tail, functor))
  }
}

function injectInto(typeArray, type) {
  let head = typeArray[0]
  let tail = typeArray.slice(1)
  if(head == type && tail.length == 0 ){
    return AlaCarte.injectId(type)
  }else if(head == type){
    return AlaCarte.injectLeft(head)(fromArray(tail, functorOr))
  }else if(tail.length != 0){
    return AlaCarte.injectRight(head)(fromArray(tail, functorOr))(type)(injectInto(tail, type))
  }
  throw new Error(`Failed inject type into typeArray`);
}

function injectorFrom(types) {
  return t => injectInto(types, t)
}

function interpreterFrom(types) {
  return fromArray(types, interpreterOr)
}

function Expr(adt, functor, injector){
  this.adt = adt
  this.functor = functor
  this.expr = inject(injector(this.functor))
}
// ------------------------------
function Add(value0, value1) {
  this.value0 = value0
  this.value1 = value1
}

function Lit(value0) {
  this.value0 = value0
}

const functorLit = new Functor(f => v => new Lit(v.value0))
const functorAdd = new Functor(f => v => new Add(f(v.value0), f(v.value1)))

const evalAdd = interpreterFor(functorAdd, function (v) {
  return v.value0 + v.value1 | 0;
});

const evalLit = interpreterFor(functorLit, function (v) {
  return v.value0;
});

function Mult(a, b) {
  this.value0 = a
  this.value1 = b
}

const functorMult = new Functor(f => v => new Mult(f(v.value0), f(v.value1)))

const evalMult = interpreterFor(functorMult, function (v) {
  return v.value0 * v.value1 | 0;
});

function lit(n) {
  return inject(injector(functorLit))(new Lit(n))
}

function add(a, b) {
  return inject(injector(functorAdd))(new Add(a, b))
}

function mult(a, b) {
  return inject(injector(functorMult))(new Mult(a, b))
}

// ----------------------
let interpreter = interpreterFrom([evalLit, evalAdd,evalMult])
let injector = injectorFrom([functorLit, functorAdd, functorMult])
let expr = mult(add(lit(4), lit(3)), lit(3))
console.log(interpretExpr(interpreter)(expr));

interpreter = interpreterFrom([evalLit, evalAdd])
injector = injectorFrom([functorLit, functorAdd])
expr = add(lit('3'), lit('4'))
console.log(interpretExpr(interpreter)(expr));

const printLit = interpreterFor(functorLit, function (v) {
  return v.value0.toString()
});

const printAdd = interpreterFor(functorAdd, function (v) {
  return `(${v.value0} + ${v.value1})`
});

const printMult = interpreterFor(functorMult, function (v) {
  return `(${v.value0} x ${v.value1})`
});

interpreter = interpreterFrom([printLit, printAdd, printMult])
injector = injectorFrom([functorLit, functorAdd, functorMult])
expr = mult(add(lit(4), lit(3)), lit(3))
console.log(interpretExpr(interpreter)(expr));
