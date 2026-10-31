import { useEffect, useState } from 'react'

function PostList({ refreshKey }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch('/api/posts')
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Could not load posts')
          return
        }

        setPosts(data.posts)
      } catch (error) {
        console.error(error)
        setError('Could not connect to the server')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
}, [refreshKey])

  if (loading) return <p>Loading posts...</p>
  if (error) return <p>{error}</p>

  return (
    <section>
      <h2>Blog Posts</h2>
      <p>Total posts: {posts.length}</p>

      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>Author: {post.author}</p>
          <p style={{ whiteSpace: 'pre-wrap' }}>Content: {post.content}</p>
          <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
        </article>
      ))}
    </section>
  )
}

export default PostList