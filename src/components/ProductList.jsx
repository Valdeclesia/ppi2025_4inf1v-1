import styles from "./ProductList.module.css";
import { CircularProgress } from "@mui/material";
import { Product } from "./Product";
import { useContext, useRef, useState } from "react";
import { CartContext } from "../context/CartContext";

export function ProductList() {
  const { products, loading, error } = useContext(CartContext);
  const searchInput = useRef(null);
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    const query = searchInput.current.value.toLowerCase();
    setSearch(query);
  };

  const handleClear = () => {
    searchInput.current.value = "";
    setSearch("");
  };

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search)
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          ref={searchInput}
          type="text"
          placeholder="Search for products..."
          className={styles.searchInput}
          onChange={handleSearch}
        />
        <button className={styles.searchButton} onClick={handleClear}>
          Clear
        </button>
      </div>
      <div className={styles.productList}>
        {filteredProducts.map((product) => (
          <Product key={product.id} product={product} />
        ))}
      </div>
      {loading && (
        <div>
          <CircularProgress
            thickness={5}
            style={{ margin: "2rem auto", display: "block" }}
            sx={{ color: "#001111" }}
          />
          <p>Loading products...</p>
        </div>
      )}
      {error && <p>❌{error} </p>}
    </div>
  );
}