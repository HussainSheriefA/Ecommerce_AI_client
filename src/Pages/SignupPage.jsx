import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="signup">
      <h2>Create Account</h2>

      <input placeholder="Name" />
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />

      <button onClick={() => navigate("/")}>
        Signup
      </button>

      <p onClick={() => navigate("/login")}>
        Already have an account? Login
      </p>
    </div>
  );
}