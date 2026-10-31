import { useState } from 'react'

function Signin({ onSignin }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Could not sign in')
        return
      }

      onSignin(data.user)
    } catch (error) {
      console.error(error)
      setMessage('Could not connect to the server')
    }
  }

  return (
    <section>
      <h1>Sign In</h1>
      <p role="status">{message}</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="signin-user-id">User ID:</label>
        <input
          id="signin-user-id"
          type="text"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          required
        />

        <label htmlFor="signin-password">Password:</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Sign In</button>
      </form>
    </section>
  )
}

export default Signin