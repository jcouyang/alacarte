const AlaCarte = require('./output/AlaCarte')
const {
    In,
  Inl,
  Inr,
  interpretExpr,
  interpreterOr,
  Interpreter,
  inject,
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
    return functor(head)(fromArray(tail))
  }
}
// ------------------------------
function Add(value0, value1) {
  this.value0 = value0
  this.value1 = value1
}

function Lit(value0) {
  this.value0 = value0
}

var functorLit = new Functor(f => v => new Lit(v.value0))
var functorAdd = new Functor(f => v => new Add(f(v.value0), f(v.value1)))

var evalAdd = interpreterFor(functorAdd, function (v) {
  return v.value0 + v.value1 | 0;
});

var evalLit = interpreterFor(functorLit, function (v) {
  return v.value0;
});

const interpreter = fromArray([evalLit,evalAdd], interpreterOr)

// const injection = inject([functorLit,functorAdd], functorLit)
// function inject(a, functor, f) {
//   let head = a[0]
//   let tail = a.slice(1)
//   if(tail.length==0){
//     return f
//   }
//   if(head == functor){
//     return new In( new Inl(f))
//   }else {
//     return new Inr(inject(tail, functor, f))
//   }
// }
// var expr = inject(AlaCarte.injectRight(functorAdd)(functorAdd)(functorLit)(AlaCarte.injectId(functorAdd)))(inject(AlaCarte.injectLeft(functorLit)(functorAdd))(new Lit(1)))(inject(AlaCarte.injectLeft(functorLit)(functorAdd))(new Lit(2)));

function injectWhich(ia, ib, i, iInj) {
  console.log(`Failed inject type ${i.constructor} into ${ia.constructor} or ${ib.constructor}`);
  if(ia == ib && ia == i) {
    return AlaCarte.injectId(ia)(ib)
  }else if(ia == i) {
    return AlaCarte.injectLeft(ia)(ib)
  } else {
    return AlaCarte.injectRight(ia)(ib)(i)(iInj)
  }
  throw new Error(`Failed inject type ${i.constructor} into ${ia.constructor} or ${ib.constructor}`);
}

function lit(n) {
  return inject(injectWhich(functorLit, functorAdd, functorLit))(new Lit(n))
}

function add(a, b) {
  return inject(injectWhich(functorLit, functorAdd, functorAdd, AlaCarte.injectId(functorAdd)))(new Add(a, b))
}

console.log(interpretExpr(fromArray([evalLit, evalAdd], interpreterOr))(add(lit(4), lit(3))));
