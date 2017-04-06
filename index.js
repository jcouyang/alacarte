const AlaCarte = require('./output/AlaCarte')
const {In,
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

  if(!typeArray.type){
    return AlaCarte.injectId(type)
  }else if(typeArray.type.head == type){
    return AlaCarte.injectLeft(typeArray.type.head)(typeArray.type.tail)
  }else if(typeArray.type.tail){
    return AlaCarte.injectRight(typeArray.type.head)(typeArray.type.tail)(type)(injectInto(typeArray.type.tail, type))
  }
  throw new Error(`Failed inject type into typeArray`);
}

function injectorFrom(types) {
  let functorTypes = fromArray(types, functorOrT)
  function injector(t){
    let inject = injectInto(functorTypes, t)
    inject.type = {sub: t, sup: functorTypes}
    return inject
  }
  injector.type = functorTypes
  return injector
}

function interpreterFrom(types) {
  return fromArray(types, interpreterOr)
}

function functorOrT(head) {
  return function(tail) {
    let functor = functorOr(head)(tail)
    functor.type = {head, tail}
    return functor
  }
}

function injectT(injector) {
  return function (adt) {
    let expr = inject(injector)(adt);
    expr.injector = injector

    return expr
    }
}

function supTypeSameAs(injector){
  return function(expr){
    return expr.injector.type.sup == injector.type
  }
}
module.exports = {
  injectorFrom,
  interpreterFrom,
  interpreterFor,
  interpretExpr,
  Functor,
  inject: injectT,
  supTypeSameAs,
}
