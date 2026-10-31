import { useState } from 'react'

function Signup() {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  // Send the account information to Express
  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          password: password,
          name: name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Could not create the account')
        return
      }

      setMessage(data.message)
      setUserId('')
      setPassword('')
      setName('')
    } catch (error) {
      console.error(error)
      setMessage('Could not connect try again')
    }
  }

  return (
    <section>
      <h1>Create an Account</h1>
      <p role="status">{message}</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="user_id">User ID:</label>
        <input
          type="text"
          id="user_id"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          maxLength={255}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={255}
          required
        />

        <button type="submit">Sign Up</button>
      </form>
    </section>
  )
}

export default Signup