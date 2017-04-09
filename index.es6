const {In,
       Inl,
       Inr,
       interpretExpr,
       interpreterOr,
       Interpreter,
       inject,
       injectId,
       injectLeft,
       injectRight,
       functorOr,
       Functor,
      } = require('./alacarte')

function interpreterFor(functor, interpreter) {
  return new Interpreter(function () {
    return functor;
  }, interpreter);
}

function injectorFrom(types) {
  let supTypes = _functorFromArray(functorOrT)(types)
  function injector(type){
    let inject = _injectInto(supTypes, type)
    inject.__TYPE__ = {__SUB__: type, __SUP__: supTypes}
    return inject
  }
  injector.__TYPE__ = supTypes
  return injector
}

function functorOrT(__LEFT__) {
  return function(__RIGHT__) {
    let functor = functorOr(__LEFT__)(__RIGHT__)
    functor.__TYPE__ = {__LEFT__, __RIGHT__}
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
    return expr.injector.__TYPE__.__SUP__ == injector.__TYPE__
  }
}

function _functorFromArray(functor) {
  return function go(array){
    let head = array[0]
    let tail = array.slice(1)
    if(tail.length===0) {
      return head;
    }else{
      return functor(head)(go(tail))
    }
  }
}

function _injectInto(functorOr, type) {
  if(!functorOr.__TYPE__){
    return injectId(type)
  }else if(functorOr.__TYPE__.__LEFT__ == type){
    return injectLeft(functorOr.__TYPE__.__LEFT__)(functorOr.__TYPE__.__RIGHT__)
  }else if(functorOr.__TYPE__.__RIGHT__){
    return injectRight(functorOr.__TYPE__.__LEFT__)(functorOr.__TYPE__.__RIGHT__)(type)(_injectInto(functorOr.__TYPE__.__RIGHT__, type))
  }
  throw new Error(`Failed inject type into functorOr`);
}

module.exports = {
  injectorFrom,
  interpreterFrom: _functorFromArray(interpreterOr),
  interpreterFor,
  interpretExpr,
  Functor,
  inject: injectT,
  supTypeSameAs,
}
