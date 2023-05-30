import { useState } from 'react'

import './LoginForm.css'

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const addBlog = (event) => {
    event.preventDefault()
    login({
      username,
      password,
    })

    setUsername('')
    setPassword('')    
  }

  return (
    <div className="login-form-container">
      <h2>Login</h2>
      <form onSubmit={addBlog}>
        <div className="login-form-group">
          <label htmlFor="username" className="login-form-label">
            Username
          </label>
          <input
            type="text"
            value={username}
            name="Username"
            id="username"
            className="login-form-input"
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="password" className="login-form-label">
            Password
          </label>
          <input
            type="password"
            value={password}
            name="Password"
            id="password"
            className="login-form-input"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button type="submit" className="login-form-button">
          Login
        </button>
      </form>
    </div>
  )
}

export default LoginForm
