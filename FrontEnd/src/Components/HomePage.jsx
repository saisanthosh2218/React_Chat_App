import { Link } from "react-router-dom";
import "./HomePage.css";
import logo from "../../public/vite.svg";
import { useState } from "react";

let user;

const HomePage = () => {
  const [name, setName] = useState("");

  const sendUser = () => {
    user = document.getElementById("input_value").value;
    document.getElementById("input_value").value = "";
  };

  return (
    <div>
      <div className="container">
        <div className="inner-contain">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          <div>
            <h2>React Chat Application</h2>
          </div>
        </div>
        <div className="inputs">
          <div>
            <input
              type="text"
              id="input_value"
              placeholder="Enter Your Name..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </div>

          <div style={{ margin: "0px auto" }}>
            <Link
              onClick={(event) => {
                !name ? event.preventDefault() : null;
              }}
              to="/chat"
            >
              <button onClick={sendUser}>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
export { user };
