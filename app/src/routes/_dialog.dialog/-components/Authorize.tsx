import { Hex, type RpcSchema } from 'ox'
import type { RpcSchema as porto_RpcSchema } from 'porto'
import { useMemo, useState } from 'react'
import { erc20Abi } from 'viem'
import { useReadContract } from 'wagmi'

import LucideKey from '~icons/lucide/key-round'
import { Button } from '../../../components/Button'
import { Layout } from '../../../components/Layout'
import { useAppStore } from '../../../lib/app'
import { StringFormatter, ValueFormatter } from '../../../utils'
import { NotFound } from './NotFound'

export function Authorize(props: Authorize.Props) {
  const { address, permissions, role, loading, onApprove, onReject } = props

  const [index, setIndex] = useState(0)

  if (role === 'admin') return <NotFound />
  if (!permissions?.spend) return <NotFound />
  if (permissions.spend.length === 0) return <NotFound />

  return (
    <Layout loading={loading} loadingTitle="Authorizing">
      <AuthorizeSpendPermission {...permissions.spend[index]!} />
      <Layout.Footer className="space-y-3">
        <div className="flex gap-2 px-3">
          <Button
            className="flex-1"
            type="button"
            variant="destructive"
            onClick={onReject}
          >
            Deny
          </Button>

          <Button
            className="flex-1"
            type="button"
            variant="success"
            onClick={() => {
              if (index < permissions!.spend!.length - 1) setIndex(index + 1)
              else onApprove()
            }}
          >
            Approve
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

export declare namespace Authorize {
  type Props = RpcSchema.ExtractParams<
    porto_RpcSchema.Schema,
    'experimental_authorizeKey'
  >['0'] & {
    loading: boolean
    onApprove: () => void
    onReject: () => void
  }
}

export function AuthorizeSpendPermission(
  props: AuthorizeSpendPermission.Props,
) {
  const { limit, period, token } = props

  const hostname = useAppStore((state) => state.referrer?.origin.hostname)

  // TODO: handle errors
  const symbol = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'symbol',
    query: {
      enabled: !!token,
    },
  })
  const decimals = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: 'decimals',
    query: {
      enabled: !!token,
    },
  })

  const displayAmount = useMemo(() => {
    if (!decimals.data && token) return null
    return ValueFormatter.format(Hex.toBigInt(limit), decimals.data)
  }, [limit, decimals.data, token])

  return (
    <>
      <Layout.Header
        icon={LucideKey}
        title="Authorize Spending"
        content={
          <div>
            <span className="font-medium">{hostname}</span> would like
            permissions to spend the following amount:
          </div>
        }
      />
      <Layout.Content>
        <div className="flex h-[40px] items-center justify-center gap-2 rounded-lg bg-gray3 p-2">
          {displayAmount || !token ? (
            <>
              <div className="mt-[2px]">
                <code>
                  {displayAmount} {symbol.data ?? 'ETH'}
                </code>
              </div>
              <div className="opacity-50">per {period}</div>
            </>
          ) : (
            <svg
              className="animate-spin"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
            >
              <path
                className="fill-gray6"
                d="M10 0.5C8.02219 0.5 6.08879 1.08649 4.4443 2.1853C2.79981 3.28412 1.51809 4.8459 0.761209 6.67316C0.00433288 8.50043 -0.1937 10.5111 0.192152 12.4509C0.578004 14.3907 1.53041 16.1725 2.92894 17.5711C4.32746 18.9696 6.10929 19.922 8.0491 20.3078C9.98891 20.6937 11.9996 20.4957 13.8268 19.7388C15.6541 18.9819 17.2159 17.7002 18.3147 16.0557C19.4135 14.4112 20 12.4778 20 10.5C20 7.84783 18.9464 5.3043 17.0711 3.42893C15.1957 1.55357 12.6522 0.5 10 0.5ZM10 17.7727C8.56159 17.7727 7.15549 17.3462 5.95949 16.547C4.7635 15.7479 3.83134 14.6121 3.28088 13.2831C2.73042 11.9542 2.5864 10.4919 2.86702 9.08116C3.14764 7.67039 3.8403 6.37451 4.85741 5.3574C5.87452 4.3403 7.17039 3.64764 8.58116 3.36702C9.99193 3.0864 11.4542 3.23042 12.7832 3.78088C14.1121 4.33133 15.2479 5.26349 16.0471 6.45949C16.8462 7.65548 17.2727 9.06159 17.2727 10.5C17.2727 12.4288 16.5065 14.2787 15.1426 15.6426C13.7787 17.0065 11.9288 17.7727 10 17.7727Z"
              />
              <path
                className="fill-gray9"
                d="M10 3.22767C11.7423 3.22846 13.4276 3.8412 14.7556 4.95667C16.0837 6.07214 16.9681 7.61784 17.2512 9.31825C17.3012 9.64364 17.4662 9.94096 17.7169 10.1573C17.9677 10.3737 18.2878 10.4951 18.6205 10.5C18.8211 10.5001 19.0193 10.457 19.2012 10.3735C19.3832 10.2901 19.5445 10.1684 19.674 10.017C19.8036 9.86549 19.8981 9.68789 19.9511 9.49656C20.004 9.30523 20.0141 9.10478 19.9807 8.90918C19.5986 6.56305 18.3843 4.42821 16.5554 2.88726C14.7265 1.34631 12.4025 0.5 10 0.5C7.59751 0.5 5.27354 1.34631 3.44461 2.88726C1.61569 4.42821 0.401366 6.56305 0.0192815 8.90918C-0.0141442 9.10478 -0.00402016 9.30523 0.0489472 9.49656C0.101914 9.68789 0.196449 9.86549 0.325956 10.017C0.455463 10.1684 0.616823 10.2901 0.798778 10.3735C0.980732 10.457 1.1789 10.5001 1.37945 10.5C1.71216 10.4951 2.03235 10.3737 2.28307 10.1573C2.5338 9.94096 2.69883 9.64364 2.74882 9.31825C3.03193 7.61784 3.91633 6.07214 5.24436 4.95667C6.57239 3.8412 8.25775 3.22846 10 3.22767Z"
              />
            </svg>
          )}
        </div>
      </Layout.Content>
    </>
  )
}

export declare namespace AuthorizeSpendPermission {
  type Props = NonNullable<
    NonNullable<Authorize.Props['permissions']>['spend']
  >[number]
}
