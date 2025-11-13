import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"
import { Navigation } from "@/components/ui/Navigation"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default async function CoachingNotesPage({
  params
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== UserRole.COACH) {
    redirect('/auth/login')
  }

  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id }
  })

  if (!coach) {
    redirect('/auth/login')
  }

  const employee = await prisma.employee.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true } }
    }
  })

  if (!employee || employee.assignedCoachId !== coach.id) {
    redirect('/coach')
  }

  // Fetch coaching notes
  const notes = await prisma.coachingNote.findMany({
    where: {
      employeeId: employee.id,
      coachId: coach.id
    },
    orderBy: { sessionDate: 'desc' }
  })

  async function handleSignOut() {
    'use server'
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="COACH" userName={session.user.name} onSignOut={handleSignOut} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href={`/coach/employees/${employee.id}`}
            className="text-blue-600 hover:text-blue-700 flex items-center mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {employee.user.name}'s Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coaching Notes</h1>
              <p className="text-gray-600 mt-1">{employee.user.name}</p>
            </div>
            <Button variant="primary" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Add Note
            </Button>
          </div>
        </div>

        {notes.length === 0 ? (
          <Card title="No Notes Yet">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start documenting your coaching sessions</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add notes after each coaching session to track progress, action items, and observations.
              </p>
              <Button variant="primary" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Note
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">
                        {new Date(note.sessionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      {note.sessionType && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {note.sessionType}
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                  </div>

                  {note.actionItems && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Action Items</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.actionItems}</p>
                    </div>
                  )}

                  {note.nextSteps && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.nextSteps}</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    Last updated {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
