import { useEffect, useState } from 'react'
import EditPost from './EditPost'

function PostList({ refreshKey, user, onPostUpdated }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      setError('')

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

          {post.creator_user_id === user.user_id && (
            <>
              <button type="button" onClick={() => setEditingId(post.id)}>
                Edit
              </button>

              {editingId === post.id && (
                <EditPost
                  post={post}
                  onCancel={() => setEditingId(null)}
                  onSaved={() => {
                    setEditingId(null)
                    onPostUpdated()
                  }}
                />
              )}
            </>
          )}
        </article>
      ))}
    </section>
  )
}

export default PostList