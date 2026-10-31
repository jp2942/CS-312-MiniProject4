import { useState } from 'react'
import Signup from './components/Signup'
import Signin from './components/Signin'

function App() {
  const [page, setPage] = useState('signin')
  const [user, setUser] = useState(null)

  return (
    <main>
      {user ? (
        <h1>Signed in as {user.name}</h1>
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