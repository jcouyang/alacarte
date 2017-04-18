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

function interpreterFor(expr, interpreter) {
  return new Interpreter(function () {
    return expr.__TYPE__;
  }, interpreter);
}

function injectorFrom(exprs) {
  let supTypes = _functorFromArray(functorOrT)(exprs.map(expr=>expr.__TYPE__))
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

function Expr(name, args) {
  this.name = name;
  this.args = args;
  this.__TYPE__ = new Functor(f => v => Object.create({}, argsToMap(v,this.args,f)))
}

function argsToMap(v, args, f=(_=>_)) {
  return args.map((arg,index) => ({[arg]: {value: f(v[arg], index),  enumerable: true}})).reduce((acc, a)=>Object.assign(acc, a), {})
}
Expr.prototype.inject = function(exprSupport){
  return (...a) => inject(exprSupport(this.__TYPE__))(Object.create({}, argsToMap({}, this.args, (_, index)=>a[index])))
}
Expr.create = function(desc) {
  var result = {}
  for (var expr in desc) {
    if (desc.hasOwnProperty(expr)) {
      result[expr] = new Expr(expr, desc[expr])
    }
  }
  return result
}

function _Val() {
  this.args = ['value'];
  this.__TYPE__ = new Functor(f => v => Object.create({}, argsToMap(v,this.args)))
}
_Val.prototype = Expr.prototype

module.exports = {
  injectorFrom,
  interpreterFrom: _functorFromArray(interpreterOr),
  interpreterFor,
  interpretExpr,
  Functor,
  inject: injectT,
  supTypeSameAs,
  Expr,
  Val: new _Val,
}
