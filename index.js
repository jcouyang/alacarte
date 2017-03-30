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

function fromArray(array) {
  let head = array[0]
  let tail = array.slice(1)
  if(tail.length===0) {
    return head;
  }else{
    return interpreterOr(head)(fromArray(tail))
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

const interpreter = fromArray([evalLit,evalAdd])
var res = inject(AlaCarte.injectId(functorLit))(new Lit(10))
console.log(interpretExpr(res));
