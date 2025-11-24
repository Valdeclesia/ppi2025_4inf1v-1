import { useState } from "react";
import styles from "./LuckyNumber.module.css";

export function LuckyNumber() {
  //REACT HOOK - useState()
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [array, setArray] = useState([]);
  const [message, setMessage] = useState("");

  function handleClick() {
    var n = Math.ceil(Math.random() * 31);
    setLuckyNumber(n);

    if (array.includes(n)) {
      setMessage(`The number ${n} is already picked!`);
    } else {
      setMessage("");
      setArray([...array, n]);
    }
  }

  return (
    <div className={styles.container}>
      {luckyNumber ? (
        <h1>Lucky Number = {luckyNumber}</h1>
      ) : (
        <h1>Lucky Number 🎲</h1>
      )}
      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleClick}>
          I'm feeling lucky today!
        </button>
        <button
          className={styles.button}
          onClick={() => {
            setLuckyNumber(0);
            setArray([]);
            setMessage("");
          }}
        >
          RESET 🔄
        </button>
      </div>
      {message && <p>{message}</p>}
      {array.length > 0 && (
        <div>
          <h3>Lucky Numbers Array:</h3>
          <p>[{array.toString()}]</p>
        </div>
      )}
    </div>
  );
}