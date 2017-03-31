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

module.exports = {
  injectorFrom,
  interpreterFrom,
  interpreterFor,
  interpretExpr,
  Functor,
  inject,
}
