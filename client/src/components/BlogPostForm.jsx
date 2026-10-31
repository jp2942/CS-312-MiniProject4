import { useState } from 'react'

function BlogPostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Could not save the post')
        return
      }

      setMessage(`Saved post: ${data.post.title}`)
      setTitle('')
      setContent('')
    } catch (error) {
      console.error(error)
      setMessage('Could not connect to the server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="post-title">Title:</label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={255}
          required
        />

        <label htmlFor="post-content">Content:</label>
        <textarea
          id="post-content"
          rows="5"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Post'}
        </button>
      </form>
      <p role="status">{message}</p>
    </section>
  )
}

export default BlogPostForm