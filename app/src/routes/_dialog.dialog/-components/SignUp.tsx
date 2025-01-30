import LucideLogIn from '~icons/lucide/log-in'
import { Button } from '../../../components/Button'
import { Layout } from '../../../components/Layout'
import { useAppStore } from '../../../lib/app'

export function SignUp(props: SignUp.Props) {
  const { enableSignIn, loading, onApprove, onReject } = props

  const hostname = useAppStore((state) => state.referrer?.origin.hostname)

  return (
    <Layout loading={loading} loadingTitle="Signing up">
      <Layout.Header
        className="flex-grow"
        title="Sign up"
        icon={LucideLogIn}
        content={
          <>
            Create a new passkey wallet to start using{' '}
            <span className="font-medium">{hostname}</span>.
          </>
        }
      />

      <Layout.Footer className="space-y-3">
        <div className="flex gap-2 px-3">
          {enableSignIn ? (
            <Button type="button" onClick={() => onApprove({ signIn: true })}>
              Sign in
            </Button>
          ) : (
            <Button type="button" onClick={onReject}>
              No thanks
            </Button>
          )}

          <Button
            className="flex-grow"
            type="button"
            variant="primary"
            onClick={() => onApprove({})}
          >
            Sign up
          </Button>
        </div>
      </Layout.Footer>
    </Layout>
  )
}

export declare namespace SignUp {
  export type Props = {
    enableSignIn?: boolean
    loading?: boolean
    onApprove: (p: { signIn?: boolean }) => void
    onReject: () => void
  }
}
