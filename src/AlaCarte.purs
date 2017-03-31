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
  interpret ::forall a. f Int -> Int

instance interpreterOr :: (Interpreter f, Interpreter g) => Interpreter (Or f g) where
  interpret (Inl l) = interpret l
  interpret (Inr r) = interpret r

interpretExpr :: forall f a. Interpreter f => Expr f -> Int
interpretExpr = foldExpr interpret

class (Functor sub, Functor sup) <= Inj sub sup where
  inj :: forall a . sub a -> sup a

-- Reflexivity
instance injectId :: Functor f => Inj f f where
  inj = id

instance injectLeft :: (Functor f, Functor g) =>  Inj f (Or f g) where
  inj = Inl

instance injectRight :: (Functor h, Functor g, Functor f, Inj f g) => Inj f (Or h g) where
  inj = Inr <<< inj

inject :: forall g f. (Inj g f) => g (Expr f) -> Expr f
inject = In <<< inj

data Lit a = Lit Int

instance functorLit:: Functor Lit where
  map f (Lit a) = Lit a

instance interpreterLit ::Interpreter Lit where
  interpret (Lit x) = x

data Add a = Add a a

instance functorAdd:: Functor Add where
  map f (Add a b) = Add (f a) (f b)

instance interpreterAdd ::Interpreter Add where
  interpret (Add a b) = a + b

lit :: forall f. (Inj Lit f) => Int -> Expr f
lit n = inject (Lit n)

add :: forall f. (Inj Add f) => Expr f -> Expr f -> Expr f
add a b = inject (Add a b)

data  Mult a = Mult a a
mult :: forall f. (Inj Mult f) => Expr f -> Expr f -> Expr f
mult a b = inject (Mult a b)

instance functorMult:: Functor Mult where
  map f (Mult a b) = Mult (f a) (f b)

instance interpreterMult ::Interpreter Mult where
  interpret (Mult a b) = a * b

expr :: Expr (Or Lit (Or Add Mult))
expr = mult (add (lit 1) (lit 2)) (lit 3)

a = interpretExpr expr
