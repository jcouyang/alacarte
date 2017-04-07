'use strict';

var _require = require('./output/AlaCarte'),
    In = _require.In,
    Inl = _require.Inl,
    Inr = _require.Inr,
    interpretExpr = _require.interpretExpr,
    interpreterOr = _require.interpreterOr,
    Interpreter = _require.Interpreter,
    inject = _require.inject,
    injectId = _require.injectId,
    injectLeft = _require.injectLeft,
    injectRight = _require.injectRight,
    functorOr = _require.functorOr;

var _require2 = require('./output/Data.Functor'),
    Functor = _require2.Functor;

function interpreterFor(functor, interpreter) {
  return new Interpreter(function () {
    return functor;
  }, interpreter);
}

function injectorFrom(types) {
  var supTypes = _functorFromArray(functorOrT)(types);
  function injector(type) {
    var inject = _injectInto(supTypes, type);
    inject.__TYPE__ = { __SUB__: type, __SUP__: supTypes };
    return inject;
  }
  injector.__TYPE__ = supTypes;
  return injector;
}

function functorOrT(__LEFT__) {
  return function (__RIGHT__) {
    var functor = functorOr(__LEFT__)(__RIGHT__);
    functor.__TYPE__ = { __LEFT__: __LEFT__, __RIGHT__: __RIGHT__ };
    return functor;
  };
}

function injectT(injector) {
  return function (adt) {
    var expr = inject(injector)(adt);
    expr.injector = injector;
    return expr;
  };
}

function supTypeSameAs(injector) {
  return function (expr) {
    return expr.injector.__TYPE__.__SUP_TYPE__ == injector.__TYPE__;
  };
}

function _functorFromArray(functor) {
  return function go(array) {
    var head = array[0];
    var tail = array.slice(1);
    if (tail.length === 0) {
      return head;
    } else {
      return functor(head)(go(tail));
    }
  };
}

function _injectInto(functorOr, type) {
  if (!functorOr.__TYPE__) {
    return injectId(type);
  } else if (functorOr.__TYPE__.__LEFT__ == type) {
    return injectLeft(functorOr.__TYPE__.__LEFT__)(functorOr.__TYPE__.__RIGHT__);
  } else if (functorOr.__TYPE__.__RIGHT__) {
    return injectRight(functorOr.__TYPE__.__LEFT__)(functorOr.__TYPE__.__RIGHT__)(type)(_injectInto(functorOr.__TYPE__.__RIGHT__, type));
  }
  throw new Error('Failed inject type into functorOr');
}

module.exports = {
  injectorFrom: injectorFrom,
  interpreterFrom: _functorFromArray(interpreterOr),
  interpreterFor: interpreterFor,
  interpretExpr: interpretExpr,
  Functor: Functor,
  inject: injectT,
  supTypeSameAs: supTypeSameAs
};

