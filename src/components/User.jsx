// src/components/User.jsx
import { useContext, useEffect, useState } from "react";
import styles from "./User.module.css";
import { SessionContext } from "../context/SessionContext";
import { supabase } from "../utils/supabase";

/**
 * User component with Admin product manager
 */
export function User() {
  const { session, handleSignOut } = useContext(SessionContext);

  if (!session) {
    return (
      <div className={styles.container}>
        <h1>User not signed in!</h1>
      </div>
    );
  }

  const isAdmin = !!session.user.user_metadata?.admin;

  return (
    <div className={styles.container}>
      {isAdmin ? <AdminProductManager session={session} onSignOut={handleSignOut} /> : <RegularUser session={session} onSignOut={handleSignOut} />}
    </div>
  );
}

/* ---- Regular user view ---- */
function RegularUser({ session, onSignOut }) {
  return (
    <>
      <h1>User Account</h1>
      <div className={styles.userInfo}>
        <p>
          <strong>Username: </strong>
          {session.user.user_metadata?.username}
        </p>
        <p>
          <strong>Email: </strong>
          {session.user.email}
        </p>
        <p>
          <strong>ID: </strong>
          {session.user.id}
        </p>
      </div>
      <button className={styles.button} onClick={onSignOut}>
        SIGN OUT
      </button>
    </>
  );
}

/* ---- Admin product manager ---- */
function AdminProductManager({ session, onSignOut }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for new product
  const [newProduct, setNewProduct] = useState({
    title: "",
    price: "",
    description: "",
    thumbnail: "",
  });

  // Track edit mode per product id
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .order("id", { ascending: true });
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }

  function handleNewChange(e) {
    const { name, value } = e.target;
    setNewProduct((p) => ({ ...p, [name]: value }));
  }

  async function handleCreateProduct(e) {
    e.preventDefault();
    setError(null);

    const title = (newProduct.title || "").trim();
    const price = parseFloat(newProduct.price);
    const description = (newProduct.description || "").trim();
    const thumbnail = (newProduct.thumbnail || "").trim();

    if (!title || Number.isNaN(price)) {
      setError("Title and valid price are required.");
      return;
    }

    try {
      const payload = { title, price, description, thumbnail };
      const { data, error } = await supabase.from("product").insert(payload).select().single();
      if (error) throw error;

      setProducts((prev) => [...prev, data]);
      setNewProduct({ title: "", price: "", description: "", thumbnail: "" });
    } catch (err) {
      setError(err.message || "Failed to create product");
    }
  }

  function startEditing(product) {
    setEditingId(product.id);
    setEditValues({
      title: product.title ?? "",
      price: String(product.price ?? ""),
      description: product.description ?? "",
      thumbnail: product.thumbnail ?? "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditValues({});
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditValues((v) => ({ ...v, [name]: value }));
  }

  async function handleUpdateProduct(e, id) {
    e.preventDefault();
    setError(null);

    const title = (editValues.title || "").trim();
    const price = parseFloat(editValues.price);
    const description = (editValues.description || "").trim();
    const thumbnail = (editValues.thumbnail || "").trim();

    if (!title || Number.isNaN(price)) {
      setError("Title and valid price are required for update.");
      return;
    }

    try {
      const payload = { title, price, description, thumbnail };
      const { data, error } = await supabase
        .from("product")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
      cancelEditing();
    } catch (err) {
      setError(err.message || "Failed to update product");
    }
  }

  async function handleDeleteProduct(id) {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    setError(null);
    try {
      const { error } = await supabase.from("product").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete product");
    }
  }

  return (
    <>
      <h1>Admin Account</h1>

      <div className={styles.userInfo} style={{ marginBottom: "1.5rem" }}>
        <p>
          <strong>Username: </strong>
          {session.user.user_metadata?.username}
        </p>
        <p>
          <strong>Email: </strong>
          {session.user.email}
        </p>
        <p>
          <strong>ID: </strong>
          {session.user.id}
        </p>
      </div>

      <div style={{ width: "100%", maxWidth: 1200 }}>
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Create new product</h2>
          <form onSubmit={handleCreateProduct} style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 160px" }}>
            <input
              name="title"
              placeholder="Title"
              value={newProduct.title}
              onChange={handleNewChange}
              className={styles.input || undefined}
            />
            <input
              name="price"
              placeholder="Price (e.g. 199.90)"
              value={newProduct.price}
              onChange={handleNewChange}
              className={styles.input || undefined}
            />
            <input
              name="thumbnail"
              placeholder="Image URL (thumbnail)"
              value={newProduct.thumbnail}
              onChange={handleNewChange}
              className={styles.input || undefined}
              style={{ gridColumn: "1 / -1" }}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleNewChange}
              className={styles.input || undefined}
              style={{ gridColumn: "1 / -1", minHeight: 80 }}
            />
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
              <button type="submit" className={styles.button}>
                Add Product
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={() => setNewProduct({ title: "", price: "", description: "", thumbnail: "" })}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2>Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {products.map((product) =>
                editingId === product.id ? (
                  <form key={product.id} onSubmit={(e) => handleUpdateProduct(e, product.id)} style={{ border: "1px solid #ddd", padding: "1rem", borderRadius: 8 }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input name="title" value={editValues.title} onChange={handleEditChange} placeholder="Title" className={styles.input || undefined} />
                      <input name="price" value={editValues.price} onChange={handleEditChange} placeholder="Price" className={styles.input || undefined} />
                    </div>
                    <input name="thumbnail" value={editValues.thumbnail} onChange={handleEditChange} placeholder="Thumbnail URL" className={styles.input || undefined} style={{ marginTop: "0.5rem" }} />
                    <textarea name="description" value={editValues.description} onChange={handleEditChange} placeholder="Description" className={styles.input || undefined} style={{ marginTop: "0.5rem", minHeight: 60 }} />
                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                      <button type="submit" className={styles.button}>Save</button>
                      <button type="button" className={styles.button} onClick={cancelEditing}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div key={product.id} style={{ display: "flex", gap: "1rem", alignItems: "center", border: "1px solid #eee", padding: "0.75rem", borderRadius: 8 }}>
                    <div style={{ width: 96, height: 96, background: "#f6f6f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, overflow: "hidden" }}>
                      {product.thumbnail ? <img src={product.thumbnail} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 12, color: "#666" }}>No image</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      <strong>{product.title}</strong>
                      <div style={{ marginTop: 6 }}>
                        <span>Price: ${Number(product.price).toFixed(2)}</span>
                      </div>
                      {product.description && <p style={{ marginTop: 6 }}>{product.description}</p>}
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className={styles.button} onClick={() => startEditing(product)}>Edit</button>
                      <button className={styles.button} onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <div style={{ marginTop: "1.5rem" }}>
          <button className={styles.button} onClick={onSignOut}>SIGN OUT</button>
        </div>
      </div>
    </>
  );
}