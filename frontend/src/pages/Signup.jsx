import { useState } from "react";
import { signup } from "../api/api";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({});

  const handleSignup = async () => {

    await signup(form);

    navigate("/login");

  };

  return (
    <div>

      <h1>Signup</h1>

      <input placeholder="Aadhar"
        onChange={(e)=>setForm({...form,aadhar:e.target.value})} />

      <input placeholder="Phone"
        onChange={(e)=>setForm({...form,phone:e.target.value})} />

      <input placeholder="Email"
        onChange={(e)=>setForm({...form,email:e.target.value})} />

      <input type="password" placeholder="Password"
        onChange={(e)=>setForm({...form,password:e.target.value})} />

      <button onClick={handleSignup}>Signup</button>

    </div>
  );
}

export default Signup;