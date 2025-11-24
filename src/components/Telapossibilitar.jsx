import styles from "./Telapossibilitar.module.css";
import { useState } from "react";

export function Telapossibilitar() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");

  function adicionarProduto(e) {
    e.preventDefault();
    setProdutos([...produtos, { nome, preco }]);
    setNome("");
    setPreco("");
  }

  function removerProduto(index) {
    setProdutos(produtos.filter((_, i) => i !== index));
  }

  function atualizarProduto(index) {
    const novoNome = prompt("Novo nome:", produtos[index].nome);
    const novoPreco = prompt("Novo preço:", produtos[index].preco);
    if (novoNome && novoPreco) {
      const novos = [...produtos];
      novos[index] = { nome: novoNome, preco: novoPreco };
      setProdutos(novos);
    }
  }

  return (
    <div className={styles.container}>
      <h2>Gerenciar Produtos</h2>
      <form className={styles.form} onSubmit={adicionarProduto}>
        <input
          type="text"
          placeholder="Nome do produto"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          required
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Adicionar</button>
      </form>
      <ul className={styles.list}>
        {produtos.map((p, i) => (
          <li key={i} className={styles.item}>
            <span>{p.nome} - R$ {p.preco}</span>
            <button onClick={() => atualizarProduto(i)} className={styles.edit}>Editar</button>
            <button onClick={() => removerProduto(i)} className={styles.remove}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}