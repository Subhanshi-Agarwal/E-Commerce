import React, { useState } from 'react'
import './CSS/LoginSignup.css'

const LoginSignup = () => {

  const API_URL = process.env.REACT_APP_API_URL;

  const [state,setState] = useState("Login");
  const [formData, setFormData] = useState({
    username:"",
    password:"",
    email:""
  })

  const changeHandler = (e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  const login = async () =>{
    let responseData;

    await fetch(`${API_URL}/login`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => responseData = data);

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  }

  const signup = async () =>{
    let responseData;

    await fetch(`${API_URL}/signup`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(data => responseData = data);

    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/");
    } else {
      alert(responseData.errors);
    }
  }

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up" &&
            <input
              name='username'
              value={formData.username}
              onChange={changeHandler}
              type="text"
              placeholder='Your Name'
            />
          }
          <input
            name='email'
            value={formData.email}
            onChange={changeHandler}
            type="email"
            placeholder='Email Address'
          />
          <input
            name='password'
            value={formData.password}
            onChange={changeHandler}
            type="password"
            placeholder='Password'
          />
        </div>

        <button onClick={() => state==="Login" ? login() : signup()}>
          Continue
        </button>

        {state==="Sign Up"
          ? <p className="loginsignup-login">
              Already have an account? <span onClick={()=>setState("Login")}>Login here</span>
            </p>
          : <p className="loginsignup-login">
              Create an account? <span onClick={()=>setState("Sign Up")}>Click here</span>
            </p>
        }

        <div className="loginsignup-agree">
          <input type="checkbox" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup;