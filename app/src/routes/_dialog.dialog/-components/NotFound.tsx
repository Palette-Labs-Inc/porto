import { useMutation } from '@tanstack/react-query'
import { Actions, Hooks } from 'porto/remote'

import LucideTriangleAlert from '~icons/lucide/triangle-alert'
import { Button } from '../../../components/Button'
import { Layout } from '../../../components/Layout'
import { porto } from '../../../lib/porto'

export function NotFound() {
  const request = Hooks.useRequest(porto)

  const respond = useMutation({
    mutationFn() {
      return Actions.respond(porto, request!)
    },
  })

  return (
    <Layout loading={respond.isPending} loadingTitle="Responding">
      <Layout.Header
        title="Method Not implemented"
        icon={LucideTriangleAlert}
        content={
          <>
            UI support for method "{request?.request?.method}" is not
            implemented yet. You may still proceed by rejecting or responding.
          </>
        }
        variant="warning"
      />
      <Layout.Content>
        <pre className="max-h-[400px] overflow-scroll rounded-lg border border-blackA1 bg-blackA1 p-3 text-[14px] text-gray12 leading-[22px] dark:border-whiteA1 dark:bg-whiteA1">
          {JSON.stringify(request?.request ?? {}, null, 2)}
        </pre>
      </Layout.Content>
      <Layout.Footer>
        <div className="flex gap-2 px-3">
          <Button
            className="flex-grow"
            type="button"
            onClick={() => Actions.reject(porto, request!)}
          >
            Reject
          </Button>

          <Button
            className="flex-grow"
            type="button"
            variant="warning"
            onClick={() => respond.mutate()}
          >
            Respond
          </Button>
        </div>
      </Layout.Footer>
    </Layout>
  )
}
