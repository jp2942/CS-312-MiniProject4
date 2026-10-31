import { useState } from 'react'

function EditPost({ post, onSaved, onCancel }) {
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Could not save changes')
        return
      }

      onSaved()
    } catch (error) {
      console.error(error)
      setError('Could not connect to the server')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor={`edit-title-${post.id}`}>Title:</label>
      <input
        id={`edit-title-${post.id}`}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={255}
        required
      />

      <label htmlFor={`edit-content-${post.id}`}>Content:</label>
      <textarea
        id={`edit-content-${post.id}`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows="5"
        required
      />

      <button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
      <button type="button" onClick={onCancel}>Cancel</button>
      {error && <p role="alert">{error}</p>}
    </form>
  )
}

export default EditPost