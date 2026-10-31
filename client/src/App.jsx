import BlogPostForm from './components/BlogPostForm'
import { useEffect, useState } from 'react'
import Signup from './components/Signup'
import Signin from './components/Signin'

function App() {
  const [page, setPage] = useState('signin')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  async function checkSession() {
    try {
      const response = await fetch('/api/me')

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  checkSession()
}, [])

async function handleLogout() {
  try {
    const response = await fetch('/api/logout', { method: 'POST' })

    if (!response.ok) {
      throw new Error('Logout failed')
    }

    setUser(null)
    setPage('signin')
  } catch (error) {
    console.error(error)
    alert('Could not log out try again')
  }
}

if (loading) {
  return <main><p>Loading...</p></main>
}



  return (
    <main>
      {user ? (
        <>
          <h1>Signed in as {user.name}</h1>
          <BlogPostForm />
          <button type="button" onClick={handleLogout}>Log Out</button>
        </>
      ) : (
        <>
          {page === 'signin'
            ? <Signin onSignin={setUser} />
            : <Signup />}

          <button
            type="button"
            onClick={() => setPage(page === 'signin' ? 'signup' : 'signin')}
          >
            {page === 'signin' ? 'Create an account' : 'Back to sign in'}
          </button>
        </>
      )}
    </main>
  )
}

export default App