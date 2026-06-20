import { TopicForm } from '@/components/admin/topic-form'

export default function NewTopicPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Add Topic</h1>
      <TopicForm />
    </div>
  )
}
