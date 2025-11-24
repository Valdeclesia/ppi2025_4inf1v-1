import styles from "./Telalogin.module.css";

export function Telalogin({ onLogin }) {
  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form className={styles.form} onSubmit={e => { e.preventDefault(); onLogin(); }}>
        <label>
          E-mail:
          <input type="email" name="email" required className={styles.input} />
        </label>
        <label>
          Senha:
          <input type="password" name="senha" required className={styles.input} />
        </label>
        <button type="submit" className={styles.button}>Entrar</button>
      </form>
    </div>
  );
}