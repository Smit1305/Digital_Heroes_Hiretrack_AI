import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Bell, CheckCircle2, Clock, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'Notifications — HireTrack AI',
  description: 'View your latest notifications and activity updates.',
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with your latest candidate applications, interviews, and team activities.
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold">No notifications yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            You are all caught up! You will be notified here when candidates update or interviews are scheduled.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors ${
                !n.read ? 'border-primary/40 bg-primary/5' : 'bg-card'
              }`}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      !n.read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {!n.read ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold leading-none">
                      {n.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-foreground/80 leading-relaxed">
                      {n.body}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0" />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
