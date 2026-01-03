// import { useState } from "react";
// import { registerCandidate, registerHR } from "../api/auth";
// import "../styles/auth.css";


// // export default function Register() {
// //   const [role, setRole] = useState("candidate");
// //   const [email, setEmail] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [hrId, setHrId] = useState(null);

// //   async function handleSubmit(e) {
// //     e.preventDefault();

// //     if (role === "candidate") {
// //       const res = await registerCandidate({ email, password });
// //       alert(res.message);
// //     } else {
// //       const formData = new FormData();
// //       formData.append("email", email);
// //       formData.append("password", password);
// //       formData.append("hrId", hrId);

// //       const res = await registerHR(formData);
// //       alert(res.message);
// //     }
// //   }

// //   return (
// //     <div className="auth-card">
// //       <h2>Register</h2>

// //       <select onChange={e => setRole(e.target.value)}>
// //         <option value="candidate">Candidate</option>
// //         <option value="hr">HR</option>
// //       </select>

// //       <form onSubmit={handleSubmit}>
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

// //         {role === "hr" && (
// //           <input
// //             type="file"
// //             accept=".pdf,.jpg,.png"
// //             required
// //             onChange={e => setHrId(e.target.files[0])}
// //           />
// //         )}

// //         <button type="submit">Register</button>
// //       </form>
// //     </div>
// //   );
// // }
