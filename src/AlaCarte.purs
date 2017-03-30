module AlaCarte where

import Prelude
data Expr f = In (f (Expr f))

data Or f g e = Inl (f e) | Inr (g e)

instance functorOr :: (Functor f, Functor g) => Functor (Or f g) where
  map f (Inl a) = Inl (map f a)
  map f (Inr b) = Inr (map f b)

foldExpr :: forall f a. Functor f => (f a -> a) -> Expr f -> a
foldExpr f (In e) = f (map (foldExpr f) e)

class Functor f <= Interpreter f where
  interpret ::forall a. f a -> a

instance interpreterOr :: (Interpreter f, Interpreter g) => Interpreter (Or f g) where
  interpret (Inl l) = interpret l
  interpret (Inr r) = interpret r

interpretExpr :: forall f a. Interpreter f => Expr f -> a
interpretExpr = foldExpr interpret

class (Functor sub, Functor sup) <= Inj sub sup where
  inj :: forall a . sub a -> sup a

-- Reflexivity
instance injectId :: Functor f => Inj f f where
  inj = id

instance injectLeft :: (Functor f, Functor g) =>  Inj f (Or f g) where
  inj = Inl

instance injectRight :: (Functor f, Functor g, Functor h, Inj f g) => Inj f (Or h g) where
  inj = Inr <<< inj

inject :: forall g f. (Inj g f) => g (Expr f) -> Expr f
inject = In <<< inj
