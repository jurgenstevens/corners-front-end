import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as authService from '../../services/authService'
import { redirectByRole } from '../../utils/redirectByRole'
import styles from './Login.module.css'

const LoginPage = ({ handleAuthEvt }) => {
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = evt => {
    setMessage('')
    setFormData({ ...formData, [evt.target.name]: evt.target.value })
  }

  const handleSubmit = async evt => {
    evt.preventDefault()
    try {
      if (!import.meta.env.VITE_BACK_END_SERVER_URL) {
        throw new Error('No VITE_BACK_END_SERVER_URL in front-end .env')
      }
      const user = await authService.login(formData)
      handleAuthEvt(user)
      redirectByRole(user, navigate)
    } catch (err) {
      console.log(err)
      setMessage(err.message)
    }
  }

  const { email, password } = formData
  const isFormInvalid = () => !(email && password)

  return (
    <main className={styles.container}>
      <h1 className={styles.header}>Log In</h1>

      {message && <p className={styles.message}>{message}</p>}

      <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
        <input
          className={styles.input}
          placeholder="Email"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
        />

        <input
          className={styles.input}
          placeholder="Password"
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
        />

        <button
          className={styles.button}
          disabled={isFormInvalid()}
        >
          Log In
        </button>

        <Link to="/" className={styles.link}>
          Cancel
        </Link>
      </form>
    </main>
  )
}

export default LoginPage
