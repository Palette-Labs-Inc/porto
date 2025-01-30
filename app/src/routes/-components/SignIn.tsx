import { Hooks } from 'porto/remote'
import LucideLogIn from '~icons/lucide/log-in'
import { Button } from '../../components/Button'
import { Layout } from '../../components/Layout'
import { useAppStore } from '../../lib/app'
import { porto } from '../../lib/porto'
import { StringFormatter } from '../../utils'

export function SignIn(props: SignIn.Props) {
  const { loading, onApprove, onReject } = props

  const address = Hooks.usePortoStore(
    porto,
    (state) => state.accounts[0]?.address,
  )
  const hostname = useAppStore((state) => state.referrer?.origin.hostname)

  return (
    <Layout loading={loading} loadingTitle="Signing in">
      <Layout.Header
        className="flex-grow"
        title="Sign in"
        icon={LucideLogIn}
        content={
          <>
            Authenticate with your passkey wallet to start using{' '}
            <span className="font-medium">{hostname}</span>.
          </>
        }
      />

      <Layout.Footer className="space-y-3">
        <div className="flex gap-2 px-3">
          <Button type="button" onClick={onReject}>
            No thanks
          </Button>

          <Button
            className="flex-grow"
            type="button"
            variant="primary"
            onClick={onApprove}
          >
            Sign in
          </Button>
        </div>

        {address && (
          <div className="flex justify-between border-blackA1 border-t px-3 pt-3 dark:border-whiteA1">
            <div className="text-[13px] text-gray9 leading-[22px]">Wallet</div>

            <div className="flex items-center gap-1.5">
              <div className="font-medium text-[14px] text-gray12">
                {StringFormatter.truncate(address, { start: 6, end: 4 })}
              </div>
            </div>
          </div>
        )}
      </Layout.Footer>
    </Layout>
  )
}

export declare namespace SignIn {
  type Props = {
    loading: boolean
    onApprove: () => void
    onReject: () => void
  }
}
