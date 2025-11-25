import { createContext, useState, useEffect, useContext, useMemo } from "react";
import { supabase } from "../utils/supabase";
import { SessionContext } from "./SessionContext";

export const CartContext = createContext({
  products: [],
  loading: false,
  error: null,
  cart: [],
  cartTotal: 0,
  addToCart: () => {},
  updateQtyCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  addProduct: () => {},
  updateProduct: () => {},
  deleteProduct: () => {},
  refreshProducts: () => {},
});

export function CartProvider({ children }) {
  const { session } = useContext(SessionContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from("product_1v").select("*");
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  }


  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("realtime-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "product_1v" },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  
  async function fetchCart() {
    if (!session) {
      setCart([]);
      return;
    }
    setLoading(true);

    
    const { data, error } = await supabase
      .from("cart")
      .select("product_id, quantity, product_1v:product_1v(*)")
      .eq("user_id", session.user.id);

    if (error) {
      setError(error.message);
      setCart([]);
    } else {
      const formatted = (data || []).map((i) => {
        const prod = i.product_1v || {};
        return {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          
          price: Number(prod.price) || 0,
          thumbnail: prod.thumbnail,
          quantity: Number(i.quantity) || 0,
        };
      });
      setCart(formatted);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, [session]);

  
  async function addToCart(product) {
    if (!session) {
      alert("Sign in first!");
      return;
    }

    
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {

      return updateQtyCart(product.id, existing.quantity + 1);
    } else {
      const { error } = await supabase.from("cart").insert({
        user_id: session.user.id,
        product_id: product.id,
        quantity: 1,
      });

      if (error) {
        setError(error.message);
        return;
      }

      await fetchCart();
    }
  }

  async function updateQtyCart(productId, qty) {
    if (!session) return;

    const { error } = await supabase
      .from("cart")
      .update({ quantity: qty })
      .eq("user_id", session.user.id)
      .eq("product_id", productId);

    if (error) {
      setError(error.message);
      return;
    }


    await fetchCart();
  }

  async function removeFromCart(productId) {
    if (!session) return;

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", session.user.id)
      .eq("product_id", productId);

    if (error) {
      setError(error.message);
      return;
    }

    await fetchCart();
  }

  async function clearCart() {
    if (!session) return;

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", session.user.id);

    if (error) {
      setError(error.message);
      return;
    }

    setCart([]);
  }

  async function addProduct(newProduct) {
    const { error } = await supabase.from("product_1v").insert(newProduct);
    if (error) setError(error.message);
    else await fetchProducts();
  }

  async function updateProduct(id, updates) {
    const { error } = await supabase
      .from("product_1v")
      .update(updates)
      .eq("id", id);
    if (error) setError(error.message);
    else await fetchProducts();
  }

  async function deleteProduct(id) {
    const { error } = await supabase
      .from("product_1v")
      .delete()
      .eq("id", id);
    if (error) setError(error.message);
    else await fetchProducts();
  }

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        products,
        loading,
        error,
        cart,
        cartTotal,
        addToCart,
        updateQtyCart,
        removeFromCart,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}