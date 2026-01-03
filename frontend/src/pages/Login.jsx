// import { useState } from "react";
// import { loginUser } from "../api/auth";
// import "../styles/auth.css";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   function handleLogin() {
//     // later connect backend here
//     navigate("/home"); // 🔥 THIS WAS MISSING
//   }

//   return (
//     <div className="container">
//       <div className="card">
//         <h3>Login</h3>

//         <input placeholder="Email" />
//         <input type="password" placeholder="Password" />

//         <button onClick={handleLogin}>Login</button>

//         <p onClick={() => navigate("/register")} style={{ cursor: "pointer" }}>
//           Don’t have an account? Register
//         </p>
//       </div>
//     </div>
//   );
// }

// // export default function Login() {
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [role, setRole] = useState("candidate");

// //   async function handleLogin(e) {
// //     e.preventDefault();

// //     const res = await loginUser({ email, password, role });

// //     if (res.message === "Login successful") {
// //       alert("Login Success");
// //       localStorage.setItem("role", role);
// //     } else {
// //       alert(res.message);
// //     }
// //   }

// //   return (
// //     <div className="auth-card">
// //       <h2>Login</h2>

// //       <select onChange={e => setRole(e.target.value)}>
// //         <option value="candidate">Candidate</option>
// //         <option value="hr">HR</option>
// //       </select>

// //       <form onSubmit={handleLogin}>
// //         <input
// //           type="email"
// //           placeholder="Email"
// //           required
// //           onChange={e => setEmail(e.target.value)}
// //         />

// //         <input
// //           type="password"
// //           placeholder="Password"
// //           required
// //           onChange={e => setPassword(e.target.value)}
// //         />

// //         <button type="submit">Login</button>
// //       </form>
// //     </div>
// //   );
// // }
