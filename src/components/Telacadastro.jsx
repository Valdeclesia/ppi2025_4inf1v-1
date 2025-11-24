import styles from "./Telacadastro.module.css";

export function Telacadastro({ onRegister }) {
  return (
    <div className={styles.container}>
      <h2>Cadastro de Usuário</h2>
      <form className={styles.form} onSubmit={e => { e.preventDefault(); onRegister(); }}>
        <label>
          Nome:
          <input type="text" name="nome" required className={styles.input} />
        </label>
        <label>
          E-mail:
          <input type="email" name="email" required className={styles.input} />
        </label>
        <label>
          Senha:
          <input type="password" name="senha" required className={styles.input} />
        </label>
        <button type="submit" className={styles.button}>Cadastrar</button>
      </form>
    </div>
  );
}