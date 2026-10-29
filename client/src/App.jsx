import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('Click to test the connection.')

  // Ask Express for a JSON response
  async function checkConnection() {
    setMessage('Connecting...')

    try {
      const response = await fetch('/api/test')

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()
      console.log(data)
      setMessage(data.message)
    } catch (error) {
      console.error(error)
      setMessage('Could not connect to Express try again.')
    }
  }

  return (
    <main>
      <h1>Sedona Travel Blog</h1>
      <p>{message}</p>
      <button onClick={checkConnection}>Check connection</button>
    </main>
  )
}

export default App